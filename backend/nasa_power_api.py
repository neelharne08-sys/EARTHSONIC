from fastapi import APIRouter, HTTPException, Query

from backend.nasa_power import (
    DEFAULT_END,
    DEFAULT_START,
    NASADataError,
    get_daily_temperature_sonification
)

router = APIRouter(prefix="/api/science", tags=["NASA Science"])


@router.get("/temperature")
def get_temperature_sonification(
    latitude: float = Query(default=0.0, ge=-90.0, le=90.0),
    longitude: float = Query(default=0.0, ge=-180.0, le=180.0),
    start: str = Query(default=DEFAULT_START, pattern=r"^\d{8}$"),
    end: str = Query(default=DEFAULT_END, pattern=r"^\d{8}$")
):
    try:
        return get_daily_temperature_sonification(latitude, longitude, start, end)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except NASADataError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
