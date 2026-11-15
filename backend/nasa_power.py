import json
import math
from datetime import datetime, timedelta
from functools import lru_cache
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

POWER_ENDPOINT = "https://power.larc.nasa.gov/api/temporal/daily/point"
DEFAULT_START = "20250101"
DEFAULT_END = "20250114"
MIN_C = -20.0
MAX_C = 50.0
MIN_HZ = 220.0
MAX_HZ = 880.0


class NASADataError(Exception):
    pass


def validate_request(latitude, longitude, start, end):
    if isinstance(latitude, bool) or isinstance(longitude, bool):
        raise ValueError("Coordinates must be numbers")
    if not (math.isfinite(float(latitude)) and -90 <= float(latitude) <= 90):
        raise ValueError("Latitude must be between -90 and 90")
    if not (math.isfinite(float(longitude)) and -180 <= float(longitude) <= 180):
        raise ValueError("Longitude must be between -180 and 180")
    if not isinstance(start, str) or not isinstance(end, str):
        raise ValueError("Dates must be YYYYMMDD strings")
    if len(start) != 8 or len(end) != 8 or not start.isascii() or not end.isascii() or not start.isdigit() or not end.isdigit():
        raise ValueError("Dates must be YYYYMMDD strings")
    try:
        start_date = datetime.strptime(start, "%Y%m%d").date()
        end_date = datetime.strptime(end, "%Y%m%d").date()
    except ValueError as exc:
        raise ValueError("Invalid calendar date") from exc
    if start_date.year < 1981:
        raise ValueError("NASA POWER daily data starts in 1981")
    duration = (end_date - start_date).days + 1
    if duration < 1 or duration > 31:
        raise ValueError("Choose a date range between 1 and 31 days")
    return start_date, end_date


def build_power_url(latitude, longitude, start, end):
    validate_request(latitude, longitude, start, end)
    query = urlencode({
        "parameters": "T2M",
        "community": "RE",
        "longitude": float(longitude),
        "latitude": float(latitude),
        "start": start,
        "end": end,
        "format": "JSON",
        "time-standard": "UTC"
    })
    return f"{POWER_ENDPOINT}?{query}"


@lru_cache(maxsize=32)
def fetch_power_payload(url):
    try:
        request = Request(url, headers={"User-Agent": "Earthsonic-NASA-Education/1.0"})
        with urlopen(request, timeout=20) as response:
            payload = json.load(response)
    except (HTTPError, URLError, TimeoutError, OSError, json.JSONDecodeError, ValueError) as exc:
        raise NASADataError("Could not retrieve NASA POWER data") from exc
    if not isinstance(payload, dict):
        raise NASADataError("NASA POWER returned an invalid response")
    return payload


def convert_temperature(value):
    if isinstance(value, bool) or not isinstance(value, (float, int)):
        return None
    temperature = float(value)
    if not math.isfinite(temperature) or temperature <= -900:
        return None
    return temperature


def map_temperature(temperature):
    normalized = max(0.0, min(1.0, (temperature - MIN_C) / (MAX_C - MIN_C)))
    frequency = MIN_HZ * (MAX_HZ / MIN_HZ) ** normalized
    return round(normalized, 5), round(frequency, 2)


def sonify_power_payload(payload, latitude, longitude, start, end):
    start_date, end_date = validate_request(latitude, longitude, start, end)
    try:
        daily_data = payload["properties"]["parameter"]["T2M"]
    except (KeyError, TypeError) as exc:
        raise NASADataError("NASA POWER response is missing T2M temperature data") from exc
    if not isinstance(daily_data, dict):
        raise NASADataError("NASA POWER T2M data has an unexpected format")

    samples = []
    for date_key in sorted(daily_data):
        if not isinstance(date_key, str) or len(date_key) != 8:
            continue
        try:
            sample_date = datetime.strptime(date_key, "%Y%m%d").date()
        except ValueError:
            continue
        if not start_date <= sample_date <= end_date:
            continue
        temperature = convert_temperature(daily_data[date_key])
        if temperature is None:
            continue
        normalized, frequency = map_temperature(temperature)
        samples.append({
            "date": sample_date.isoformat(),
            "temperature_c": round(temperature, 2),
            "normalized": normalized,
            "frequency_hz": frequency,
            "clipped": not (MIN_C <= temperature <= MAX_C)
        })

    if not samples:
        raise NASADataError("NASA POWER returned no valid daily temperature values for these dates")

    temperatures = [sample["temperature_c"] for sample in samples]
    total_days = (end_date - start_date).days + 1
    url = build_power_url(latitude, longitude, start, end)
    return {
        "status": "success",
        "source": {
            "organization": "NASA POWER",
            "dataset": "T2M daily 2-meter air temperature",
            "source_url": url,
            "time_standard": "UTC",
            "unit": "degC",
            "data_type": "Meteorological gridded analysis/reanalysis, not a local thermometer reading"
        },
        "location": {
            "latitude": float(latitude),
            "longitude": float(longitude)
        },
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "mapping": {
            "method": "Artistic logarithmic pitch mapping from daily temperature",
            "input_range_c": [MIN_C, MAX_C],
            "frequency_range_hz": [MIN_HZ, MAX_HZ],
            "clamp_outside_range": True,
            "note": "The numeric temperatures come from NASA POWER. Frequencies are generated by Earthsonic; they are not sounds measured by NASA."
        },
        "data": {
            "sample_count": len(samples),
            "missing_count": total_days - len(samples),
            "temperature_min_c": round(min(temperatures), 2),
            "temperature_max_c": round(max(temperatures), 2),
            "temperature_mean_c": round(sum(temperatures) / len(temperatures), 2),
            "samples": samples
        }
    }


def get_daily_temperature_sonification(latitude, longitude, start=DEFAULT_START, end=DEFAULT_END):
    url = build_power_url(latitude, longitude, start, end)
    return sonify_power_payload(fetch_power_payload(url), latitude, longitude, start, end)
