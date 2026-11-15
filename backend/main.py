
import hashlib
import hmac
import os
import sqlite3

from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field

from backend.auth_database import (
    DEFAULT_DB_PATH,
    create_user,
    get_user_by_email,
    get_user_by_id
)
from backend.auth_security import hash_password, verify_password
from backend.auth_sessions import (
    SESSION_TTL_SECONDS,
    create_session,
    get_session_user_id,
    revoke_session
)
from backend.nasa_power_api import router as science_router
from backend.nasa_climate_api import router as climate_router
from backend.image_processing import IMAGE_PATH
from backend.sonification import generate_sonification
from backend.user_favorites import (
    add_favorite,
    list_favorites,
    remove_favorite
)
from backend.user_mixes import (
    create_mix,
    delete_mix,
    get_mix,
    list_mixes,
    update_mix,
    validate_mix_name,
    validate_mix_settings
)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

SUPPORTED_STATION_IDS = frozenset({
    "svs-4950",
    "svs-4960",
    "svs-5011",
    "svs-5196",
    "svs-5425",
    "svs-5533",
    "svs-5669",
    "svs-3912",
    "svs-5313",
    "svs-13786"
})

SESSION_COOKIE_NAME = "earthsonic_session"

COOKIE_SECURE = os.getenv(
    "EARTHSONIC_ENV", "development"
).lower() == "production"

DUMMY_PASSWORD_HASH = hash_password(
    "EarthsonicDummyPassword2026!"
)

app = FastAPI(
    title="EarthPulse API",
    description="NASA Space Apps Challenge 2026 - Team Vertex",
    version="1.4.0"
)

@app.middleware('http')
async def require_login_for_scientific_api(request: Request, call_next):
    path = request.url.path
    requires_login = path == '/api/sonification' or path.startswith('/api/science/')
    if requires_login and request.method != 'OPTIONS':
        try:
            get_authenticated_session(request, get_auth_db_path())
        except HTTPException as exc:
            return JSONResponse(status_code=exc.status_code, content={'detail': 'Sign in to access Earthsonic scientific features'})
    return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-CSRF-Token"]
)


app.include_router(science_router)
app.include_router(climate_router)

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class PublicUser(BaseModel):
    id: int
    email: EmailStr
    created_at: str


class AuthSessionResponse(BaseModel):
    user: PublicUser
    csrf_token: str


class LogoutResponse(BaseModel):
    status: str


class FavoriteRequest(BaseModel):
    station_id: str = Field(min_length=1, max_length=32)


class FavoriteItem(BaseModel):
    station_id: str
    created_at: str


class FavoriteListResponse(BaseModel):
    favorites: list[FavoriteItem]
    count: int


class FavoriteAddResponse(BaseModel):
    station_id: str
    added: bool


class FavoriteRemoveResponse(BaseModel):
    station_id: str
    removed: bool


class MixRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    station_id: str = Field(min_length=1, max_length=32)
    settings: dict[str, Any]


class MixResponse(BaseModel):
    id: int
    name: str
    station_id: str
    settings: dict[str, Any]
    created_at: str
    updated_at: str


class MixListResponse(BaseModel):
    mixes: list[MixResponse]
    count: int


class MixDeleteResponse(BaseModel):
    mix_id: int
    deleted: bool


def get_auth_db_path() -> Path:
    return DEFAULT_DB_PATH


def validate_origin(request: Request):
    origin = request.headers.get("origin")

    if origin is not None and origin not in ALLOWED_ORIGINS:
        raise HTTPException(
            status_code=403,
            detail="Origin not allowed"
        )


def create_csrf_token(session_token: str) -> str:
    return hmac.new(
        session_token.encode("utf-8"),
        b"earthsonic-csrf-v1",
        hashlib.sha256
    ).hexdigest()


def get_authenticated_session(
    request: Request,
    db_path: Path
):
    token = request.cookies.get(SESSION_COOKIE_NAME)

    user_id = get_session_user_id(token, db_path)

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    user = get_user_by_id(user_id, db_path)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    return token, user


def verify_csrf(request: Request, session_token: str):
    supplied_token = request.headers.get(
        "x-csrf-token", ""
    )

    expected_token = create_csrf_token(session_token)

    if not hmac.compare_digest(
        supplied_token,
        expected_token
    ):
        raise HTTPException(
            status_code=403,
            detail="Invalid CSRF token"
        )


def authenticate_mutation(
    request: Request,
    db_path: Path
):
    validate_origin(request)

    token, user = get_authenticated_session(
        request,
        db_path
    )

    verify_csrf(request, token)

    return user


def validate_supported_station(station_id: str):
    if station_id not in SUPPORTED_STATION_IDS:
        raise HTTPException(
            status_code=404,
            detail="NASA station not found"
        )


def validate_mix_payload(payload: MixRequest):
    validate_supported_station(payload.station_id)

    try:
        validate_mix_name(payload.name)
        validate_mix_settings(payload.settings)
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        ) from error


@app.get("/")
def home():
    return {
        "message": "Welcome to EarthPulse API",
        "team": "Team Vertex",
        "challenge": "The Earth Information Jukebox"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "project": "EarthPulse",
        "backend": "FastAPI"
    }


@app.get("/api/sonification")
def sonification():
    if not IMAGE_PATH.is_file():
        raise HTTPException(
            status_code=404,
            detail="NASA visualization image not found"
        )

    result = generate_sonification(IMAGE_PATH)

    return {
        "status": "success",
        "project": "EarthPulse",
        "source": {
            "title": "Change in Night Lights between 2012 and 2023",
            "organization": "NASA Scientific Visualization Studio",
            "url": "https://svs.gsfc.nasa.gov/5313/"
        },
        "analysis_type": "Relative image brightness sonification",
        "scientific_note": (
            "Frequencies represent relative visible brightness "
            "within an image frame, not calibrated satellite "
            "radiance or direct environmental measurements."
        ),
        "data": result
    }


@app.post(
    "/api/auth/register",
    response_model=PublicUser,
    status_code=201
)
def register(
    request: RegisterRequest,
    db_path: Path = Depends(get_auth_db_path)
):
    password_hash = hash_password(request.password)

    try:
        user_id = create_user(
            email=str(request.email),
            password_hash=password_hash,
            db_path=db_path
        )
    except sqlite3.IntegrityError as exc:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        ) from exc

    user = get_user_by_id(user_id, db_path)

    if user is None:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve registered user"
        )

    return user


@app.post(
    "/api/auth/login",
    response_model=AuthSessionResponse
)
def login(
    request: Request,
    response: Response,
    credentials: LoginRequest,
    db_path: Path = Depends(get_auth_db_path)
):
    validate_origin(request)

    user = get_user_by_email(
        str(credentials.email),
        db_path
    )

    stored_hash = (
        user["password_hash"]
        if user is not None
        else DUMMY_PASSWORD_HASH
    )

    password_valid = verify_password(
        credentials.password,
        stored_hash
    )

    if not password_valid or user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_session(user["id"], db_path)

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=SESSION_TTL_SECONDS,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/"
    )

    return {
        "user": user,
        "csrf_token": create_csrf_token(token)
    }


@app.get(
    "/api/auth/me",
    response_model=AuthSessionResponse
)
def current_user(
    request: Request,
    db_path: Path = Depends(get_auth_db_path)
):
    token, user = get_authenticated_session(
        request,
        db_path
    )

    return {
        "user": user,
        "csrf_token": create_csrf_token(token)
    }


@app.post(
    "/api/auth/logout",
    response_model=LogoutResponse
)
def logout(
    request: Request,
    response: Response,
    db_path: Path = Depends(get_auth_db_path)
):
    validate_origin(request)

    token, _ = get_authenticated_session(
        request,
        db_path
    )

    verify_csrf(request, token)

    revoke_session(token, db_path)

    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        secure=COOKIE_SECURE,
        httponly=True,
        samesite="lax"
    )

    return {"status": "logged_out"}


@app.get(
    "/api/user/favorites",
    response_model=FavoriteListResponse
)
def get_favorites(
    request: Request,
    db_path: Path = Depends(get_auth_db_path)
):
    _, user = get_authenticated_session(
        request,
        db_path
    )

    favorites = list_favorites(
        user["id"],
        db_path
    )

    return {
        "favorites": favorites,
        "count": len(favorites)
    }


@app.post(
    "/api/user/favorites",
    response_model=FavoriteAddResponse
)
def save_favorite(
    request: Request,
    favorite: FavoriteRequest,
    db_path: Path = Depends(get_auth_db_path)
):
    user = authenticate_mutation(
        request,
        db_path
    )

    validate_supported_station(favorite.station_id)

    added = add_favorite(
        user["id"],
        favorite.station_id,
        db_path
    )

    return {
        "station_id": favorite.station_id,
        "added": added
    }


@app.delete(
    "/api/user/favorites/{station_id}",
    response_model=FavoriteRemoveResponse
)
def delete_favorite(
    request: Request,
    station_id: str,
    db_path: Path = Depends(get_auth_db_path)
):
    user = authenticate_mutation(
        request,
        db_path
    )

    validate_supported_station(station_id)

    removed = remove_favorite(
        user["id"],
        station_id,
        db_path
    )

    return {
        "station_id": station_id,
        "removed": removed
    }


@app.get(
    "/api/user/mixes",
    response_model=MixListResponse
)
def get_user_mixes(
    request: Request,
    db_path: Path = Depends(get_auth_db_path)
):
    _, user = get_authenticated_session(
        request,
        db_path
    )

    mixes = list_mixes(user["id"], db_path)

    return {
        "mixes": mixes,
        "count": len(mixes)
    }


@app.get(
    "/api/user/mixes/{mix_id}",
    response_model=MixResponse
)
def get_user_mix(
    request: Request,
    mix_id: int,
    db_path: Path = Depends(get_auth_db_path)
):
    _, user = get_authenticated_session(
        request,
        db_path
    )

    if mix_id <= 0:
        raise HTTPException(
            status_code=404,
            detail="Mix not found"
        )

    mix = get_mix(user["id"], mix_id, db_path)

    if mix is None:
        raise HTTPException(
            status_code=404,
            detail="Mix not found"
        )

    return mix


@app.post(
    "/api/user/mixes",
    response_model=MixResponse,
    status_code=201
)
def save_user_mix(
    request: Request,
    payload: MixRequest,
    db_path: Path = Depends(get_auth_db_path)
):
    user = authenticate_mutation(
        request,
        db_path
    )

    validate_mix_payload(payload)

    return create_mix(
        user["id"],
        payload.name,
        payload.station_id,
        payload.settings,
        db_path
    )


@app.put(
    "/api/user/mixes/{mix_id}",
    response_model=MixResponse
)
def update_user_mix(
    request: Request,
    mix_id: int,
    payload: MixRequest,
    db_path: Path = Depends(get_auth_db_path)
):
    user = authenticate_mutation(
        request,
        db_path
    )

    if mix_id <= 0:
        raise HTTPException(
            status_code=404,
            detail="Mix not found"
        )

    validate_mix_payload(payload)

    mix = update_mix(
        user["id"],
        mix_id,
        payload.name,
        payload.station_id,
        payload.settings,
        db_path
    )

    if mix is None:
        raise HTTPException(
            status_code=404,
            detail="Mix not found"
        )

    return mix


@app.delete(
    "/api/user/mixes/{mix_id}",
    response_model=MixDeleteResponse
)
def remove_user_mix(
    request: Request,
    mix_id: int,
    db_path: Path = Depends(get_auth_db_path)
):
    user = authenticate_mutation(
        request,
        db_path
    )

    if mix_id <= 0:
        raise HTTPException(
            status_code=404,
            detail="Mix not found"
        )

    deleted = delete_mix(
        user["id"],
        mix_id,
        db_path
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Mix not found"
        )

    return {
        "mix_id": mix_id,
        "deleted": True
    }
