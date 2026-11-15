import math
from datetime import timedelta
from urllib.parse import urlencode

from backend.nasa_power import (
    DEFAULT_END,
    DEFAULT_START,
    NASADataError,
    POWER_ENDPOINT,
    fetch_power_payload,
    map_temperature,
    validate_request,
)

PARAMETERS = ("T2M", "RH2M", "WS2M")
VARIABLES = {
    "T2M": ("temperature_c", "temperature", -20.0, 50.0, 220.0, 880.0),
    "RH2M": ("relative_humidity_pct", "humidity", 0.0, 100.0, 110.0, 440.0),
    "WS2M": ("wind_speed_mps", "wind", 0.0, 20.0, 80.0, 320.0),
}


def build_climate_url(latitude, longitude, start, end):
    validate_request(latitude, longitude, start, end)
    query = urlencode({
        "parameters": ",".join(PARAMETERS),
        "community": "RE",
        "latitude": float(latitude),
        "longitude": float(longitude),
        "start": start,
        "end": end,
        "format": "JSON",
        "time-standard": "UTC",
    })
    return f"{POWER_ENDPOINT}?{query}"


def valid_measurement(value, parameter):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    number = float(value)
    if not math.isfinite(number) or number <= -900:
        return None
    if parameter == "RH2M" and not 0 <= number <= 100:
        return None
    if parameter == "WS2M" and number < 0:
        return None
    return number


def map_measurement(parameter, value):
    if parameter not in VARIABLES:
        raise ValueError("Unsupported climate parameter")
    name, label, lower, upper, low_hz, high_hz = VARIABLES[parameter]
    if parameter == "T2M":
        normalized, frequency = map_temperature(value)
    else:
        normalized = max(0.0, min(1.0, (value - lower) / (upper - lower)))
        frequency = round(low_hz * (high_hz / low_hz) ** normalized, 2)
        normalized = round(normalized, 5)
    return {
        "normalized": normalized,
        "frequency_hz": frequency,
        "clipped": value < lower or value > upper,
    }


def sonify_climate_payload(payload, latitude, longitude, start, end):
    start_date, end_date = validate_request(latitude, longitude, start, end)
    try:
        parameter_data = payload["properties"]["parameter"]
    except (KeyError, TypeError) as exc:
        raise NASADataError("NASA POWER climate response is missing its parameter data") from exc
    if not isinstance(parameter_data, dict):
        raise NASADataError("NASA POWER climate parameter data is invalid")

    data = {}
    for parameter in PARAMETERS:
        series = parameter_data.get(parameter)
        if series is None:
            series = {}
        if not isinstance(series, dict):
            raise NASADataError(f"NASA POWER {parameter} data is invalid")
        data[parameter] = series

    samples = []
    counts = {parameter: 0 for parameter in PARAMETERS}
    date = start_date
    while date <= end_date:
        date_key = date.strftime("%Y%m%d")
        sample = {"date": date.isoformat(), "measurements": {}, "sonification": {}}
        for parameter in PARAMETERS:
            name = VARIABLES[parameter][0]
            value = valid_measurement(data[parameter].get(date_key), parameter)
            sample["measurements"][name] = round(value, 2) if value is not None else None
            sample["sonification"][name] = (
                map_measurement(parameter, value) if value is not None else None
            )
            if value is not None:
                counts[parameter] += 1
        samples.append(sample)
        date += timedelta(days=1)

    if not any(counts.values()):
        raise NASADataError("NASA POWER returned no usable climate measurements")

    count = len(samples)
    return {
        "status": "success",
        "source": {
            "organization": "NASA POWER",
            "dataset": "Daily T2M temperature, RH2M humidity and WS2M wind speed",
            "source_url": build_climate_url(latitude, longitude, start, end),
            "time_standard": "UTC",
            "units": {"temperature_c": "degC", "relative_humidity_pct": "%", "wind_speed_mps": "m/s"},
            "data_type": "Gridded meteorological analysis/reanalysis, not direct readings from an on-site weather station",
        },
        "location": {"latitude": float(latitude), "longitude": float(longitude)},
        "period": {"start": start_date.isoformat(), "end": end_date.isoformat()},
        "mapping": {
            "type": "Artistic logarithmic pitch mapping",
            "rules": {
                "temperature_c": {"input_range": [-20, 50], "pitch_hz": [220, 880], "timbre": "sine"},
                "relative_humidity_pct": {"input_range": [0, 100], "pitch_hz": [110, 440], "timbre": "triangle"},
                "wind_speed_mps": {"input_range": [0, 20], "pitch_hz": [80, 320], "timbre": "sine"},
            },
            "clamp_outside_range": True,
            "note": "NASA supplies the meteorological values. Earthsonic generates the pitches; they are not NASA recordings or physical acoustic measurements.",
        },
        "data": {
            "sample_count": count,
            "complete_days": sum(all(s["measurements"][VARIABLES[p][0]] is not None for p in PARAMETERS) for s in samples),
            "available_by_parameter": counts,
            "missing_by_parameter": {p: count - counts[p] for p in PARAMETERS},
            "samples": samples,
        },
    }


def get_daily_climate_sonification(latitude, longitude, start=DEFAULT_START, end=DEFAULT_END):
    url = build_climate_url(latitude, longitude, start, end)
    payload = fetch_power_payload(url)
    return sonify_climate_payload(payload, latitude, longitude, start, end)
