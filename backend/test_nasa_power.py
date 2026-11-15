import json
from urllib.parse import parse_qs, urlsplit

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend import nasa_power
from backend import nasa_power_api


@pytest.fixture
def sample_payload():
    return {
        "properties": {
            "parameter": {
                "T2M": {
                    "20250101": 10.0,
                    "20250102": 20.0,
                    "20250103": -999,
                    "20250104": 30.0
                }
            }
        }
    }


def test_official_api_url():
    url = nasa_power.build_power_url(0, 0, "20250101", "20250114")
    parts = urlsplit(url)
    values = parse_qs(parts.query)
    assert parts.netloc == "power.larc.nasa.gov"
    assert values["parameters"] == ["T2M"]
    assert values["format"] == ["JSON"]
    assert values["time-standard"] == ["UTC"]


@pytest.mark.parametrize("start,end", [
    ("20251301", "20251303"),
    ("20250131", "20250101"),
    ("20250101", "20250228"),
    ("19800101", "19800102"),
    ("2025-01-01", "20250102")
])
def test_invalid_dates(start, end):
    with pytest.raises(ValueError):
        nasa_power.build_power_url(0, 0, start, end)


@pytest.mark.parametrize("lat,lon", [
    (91, 0), (-91, 0), (0, 181), (0, -181), (float("nan"), 0)
])
def test_invalid_coordinates(lat, lon):
    with pytest.raises(ValueError):
        nasa_power.build_power_url(lat, lon, "20250101", "20250102")


def test_measured_values_preserved(sample_payload):
    result = nasa_power.sonify_power_payload(sample_payload, 0, 0, "20250101", "20250104")
    assert [x["temperature_c"] for x in result["data"]["samples"]] == [10, 20, 30]
    assert result["data"]["sample_count"] == 3
    assert result["data"]["missing_count"] == 1
    assert result["source"]["unit"] == "degC"
    assert result["source"]["time_standard"] == "UTC"


def test_mapping_bounds():
    assert nasa_power.map_temperature(-20)[1] == 220
    assert nasa_power.map_temperature(50)[1] == 880
    assert nasa_power.map_temperature(-30)[1] == 220
    assert nasa_power.map_temperature(55)[1] == 880
    assert 220 < nasa_power.map_temperature(15)[1] < 880


def test_missing_parameter():
    with pytest.raises(nasa_power.NASADataError):
        nasa_power.sonify_power_payload({}, 0, 0, "20250101", "20250102")


def test_missing_all_samples():
    data = {"properties": {"parameter": {"T2M": {"20250101": -999}}}}
    with pytest.raises(nasa_power.NASADataError):
        nasa_power.sonify_power_payload(data, 0, 0, "20250101", "20250101")


def test_ignores_unrequested_days(sample_payload):
    result = nasa_power.sonify_power_payload(sample_payload, 0, 0, "20250102", "20250102")
    assert result["data"]["sample_count"] == 1
    assert result["data"]["samples"][0]["date"] == "2025-01-02"


def test_upstream_fetch_mocked(monkeypatch, sample_payload):
    class FakeResponse:
        def __enter__(self):
            return self
        def __exit__(self, *_):
            return None
        def read(self, *_):
            return json.dumps(sample_payload).encode()

    requests = []
    def fake_urlopen(req, timeout):
        requests.append((req.full_url, timeout))
        return FakeResponse()

    nasa_power.fetch_power_payload.cache_clear()
    monkeypatch.setattr(nasa_power, "urlopen", fake_urlopen)
    result = nasa_power.get_daily_temperature_sonification(0, 0, "20250101", "20250104")
    assert result["data"]["sample_count"] == 3
    result2 = nasa_power.get_daily_temperature_sonification(0, 0, "20250101", "20250104")
    assert result2 == result
    assert len(requests) == 1
    nasa_power.fetch_power_payload.cache_clear()


def make_app():
    app = FastAPI()
    app.include_router(nasa_power_api.router)
    return TestClient(app)


def test_api_success_offline(monkeypatch, sample_payload):
    def fake_temperature(latitude, longitude, start, end):
        return nasa_power.sonify_power_payload(sample_payload, latitude, longitude, start, end)
    monkeypatch.setattr(nasa_power_api, "get_daily_temperature_sonification", fake_temperature)
    with make_app() as client:
        response = client.get("/api/science/temperature?latitude=0&longitude=0&start=20250101&end=20250104")
    assert response.status_code == 200
    assert response.json()["data"]["sample_count"] == 3


def test_api_bad_dates_offline():
    with make_app() as client:
        response = client.get("/api/science/temperature?start=20250131&end=20250101")
    assert response.status_code == 422


def test_api_invalid_coordinate_offline():
    with make_app() as client:
        response = client.get("/api/science/temperature?latitude=105")
    assert response.status_code == 422


def test_api_upstream_failure_offline(monkeypatch):
    def fails(*_):
        raise nasa_power.NASADataError("NASA POWER not available")
    monkeypatch.setattr(nasa_power_api, "get_daily_temperature_sonification", fails)
    with make_app() as client:
        response = client.get("/api/science/temperature")
    assert response.status_code == 503
