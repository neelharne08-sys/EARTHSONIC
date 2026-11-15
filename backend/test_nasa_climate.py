from urllib.parse import parse_qs, urlparse

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend import nasa_climate, nasa_climate_api
from backend.nasa_power import NASADataError


@pytest.fixture
def nasa_payload():
    return {"properties": {"parameter": {
        "T2M": {"20250101": 10.0, "20250102": 20.0, "20250103": -999.0},
        "RH2M": {"20250101": 65.0, "20250102": 70.0, "20250103": 80.0},
        "WS2M": {"20250101": 3.5, "20250102": 9.0, "20250103": -999.0},
    }}}


def test_build_url():
    result = nasa_climate.build_climate_url(21.14, 79.08, "20250101", "20250103")
    query = parse_qs(urlparse(result).query)
    assert query["parameters"] == ["T2M,RH2M,WS2M"]
    assert query["time-standard"] == ["UTC"]
    assert query["latitude"] == ["21.14"]


@pytest.mark.parametrize("bad_start,bad_end", [
    ("20250104", "20250101"),
    ("20251301", "20251302"),
    ("20250101", "20250301"),
])
def test_invalid_period(bad_start, bad_end):
    with pytest.raises(ValueError):
        nasa_climate.build_climate_url(0, 0, bad_start, bad_end)


def test_invalid_location():
    with pytest.raises(ValueError):
        nasa_climate.build_climate_url(91, 0, "20250101", "20250103")


def test_preserves_measurements(nasa_payload):
    r = nasa_climate.sonify_climate_payload(nasa_payload, 0, 0, "20250101", "20250103")
    samples = r["data"]["samples"]
    assert len(samples) == 3
    assert samples[0]["measurements"] == {
        "temperature_c": 10.0, "relative_humidity_pct": 65.0, "wind_speed_mps": 3.5
    }
    assert r["data"]["complete_days"] == 2
    assert r["data"]["missing_by_parameter"] == {"T2M": 1, "RH2M": 0, "WS2M": 1}


def test_missing_values_are_null(nasa_payload):
    s = nasa_climate.sonify_climate_payload(nasa_payload, 0, 0, "20250101", "20250103")["data"]["samples"][2]
    assert s["measurements"]["temperature_c"] is None
    assert s["sonification"]["temperature_c"] is None
    assert s["measurements"]["wind_speed_mps"] is None


def test_mapping_boundaries():
    assert nasa_climate.map_measurement("T2M", -20)["frequency_hz"] == 220
    assert nasa_climate.map_measurement("T2M", 50)["frequency_hz"] == 880
    assert nasa_climate.map_measurement("RH2M", 0)["frequency_hz"] == 110
    assert nasa_climate.map_measurement("RH2M", 100)["frequency_hz"] == 440
    assert nasa_climate.map_measurement("WS2M", 0)["frequency_hz"] == 80
    assert nasa_climate.map_measurement("WS2M", 20)["frequency_hz"] == 320
    assert nasa_climate.map_measurement("WS2M", 35)["clipped"] is True


@pytest.mark.parametrize("invalid", [float('nan'), float('inf'), True, -999, 'x', None])
def test_reject_invalid_values(invalid):
    assert nasa_climate.valid_measurement(invalid, "T2M") is None


def test_reject_bad_humidity_and_wind():
    assert nasa_climate.valid_measurement(120, "RH2M") is None
    assert nasa_climate.valid_measurement(-2, "WS2M") is None


def test_bad_payload_rejected():
    with pytest.raises(NASADataError):
        nasa_climate.sonify_climate_payload({}, 0, 0, "20250101", "20250102")


def test_no_usable_data_rejected():
    payload = {"properties": {"parameter": {}}}
    with pytest.raises(NASADataError):
        nasa_climate.sonify_climate_payload(payload, 0, 0, "20250101", "20250102")


def test_zero_not_missing():
    payload = {"properties": {"parameter": {
        "T2M": {"20250101": 0}, "RH2M": {"20250101": 0}, "WS2M": {"20250101": 0}
    }}}
    r = nasa_climate.sonify_climate_payload(payload, 0, 0, "20250101", "20250101")
    assert r["data"]["complete_days"] == 1
    assert r["data"]["samples"][0]["measurements"]["wind_speed_mps"] == 0


def test_fetch_uses_one_request(monkeypatch, nasa_payload):
    urls = []
    def fake_fetch(url):
        urls.append(url)
        return nasa_payload
    monkeypatch.setattr(nasa_climate, "fetch_power_payload", fake_fetch)
    result = nasa_climate.get_daily_climate_sonification(0, 0, "20250101", "20250103")
    assert result["data"]["sample_count"] == 3
    assert len(urls) == 1


def test_api_success(monkeypatch, nasa_payload):
    def fake(*args):
        return nasa_climate.sonify_climate_payload(nasa_payload, *args)
    monkeypatch.setattr(nasa_climate_api, "get_daily_climate_sonification", fake)
    app = FastAPI()
    app.include_router(nasa_climate_api.router)
    response = TestClient(app).get("/api/science/climate?start=20250101&end=20250103")
    assert response.status_code == 200
    assert response.json()["data"]["complete_days"] == 2


def test_api_reject_invalid_latitude():
    app = FastAPI()
    app.include_router(nasa_climate_api.router)
    assert TestClient(app).get("/api/science/climate?latitude=99").status_code == 422


def test_api_upstream_error(monkeypatch):
    def fails(*args):
        raise NASADataError("NASA upstream unavailable")
    monkeypatch.setattr(nasa_climate_api, "get_daily_climate_sonification", fails)
    app = FastAPI()
    app.include_router(nasa_climate_api.router)
    assert TestClient(app).get("/api/science/climate").status_code == 503


def test_mapping_attribution(nasa_payload):
    result = nasa_climate.sonify_climate_payload(nasa_payload, 0, 0, "20250101", "20250103")
    assert "Earthsonic" in result["mapping"]["note"]
    assert result["source"]["organization"] == "NASA POWER"
