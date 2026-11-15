
import pytest
from fastapi.testclient import TestClient

from backend.auth_database import get_user_by_email
from backend.auth_security import verify_password
from backend.main import app, get_auth_db_path


@pytest.fixture
def registration_client(tmp_path):
    db_path = tmp_path / "users.sqlite3"

    app.dependency_overrides[get_auth_db_path] = lambda: db_path

    try:
        with TestClient(app) as client:
            yield client, db_path
    finally:
        app.dependency_overrides.pop(get_auth_db_path, None)


def test_register_user(registration_client):
    client, db_path = registration_client

    response = client.post(
        "/api/auth/register",
        json={
            "email": "Test@Example.com",
            "password": "EarthsonicSecure2026!"
        }
    )

    assert response.status_code == 201

    data = response.json()

    assert data["email"] == "test@example.com"
    assert isinstance(data["id"], int)
    assert "created_at" in data
    assert "password" not in data
    assert "password_hash" not in data

    user = get_user_by_email("test@example.com", db_path)

    assert user is not None
    assert user["password_hash"].startswith("$argon2")
    assert verify_password(
        "EarthsonicSecure2026!",
        user["password_hash"]
    )


def test_duplicate_email(registration_client):
    client, _ = registration_client

    payload = {
        "email": "user@example.com",
        "password": "EarthsonicSecure2026!"
    }

    first = client.post("/api/auth/register", json=payload)

    second = client.post(
        "/api/auth/register",
        json={
            "email": "USER@example.com",
            "password": "AnotherSecurePassword2026!"
        }
    )

    assert first.status_code == 201
    assert second.status_code == 409
    assert second.json()["detail"] == "Email already registered"


def test_invalid_email(registration_client):
    client, _ = registration_client

    response = client.post(
        "/api/auth/register",
        json={
            "email": "not-an-email",
            "password": "EarthsonicSecure2026!"
        }
    )

    assert response.status_code == 422


def test_short_password(registration_client):
    client, _ = registration_client

    response = client.post(
        "/api/auth/register",
        json={
            "email": "user@example.com",
            "password": "short"
        }
    )

    assert response.status_code == 422


def test_registration_cors(registration_client):
    client, _ = registration_client

    response = client.options(
        "/api/auth/register",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST"
        }
    )

    assert response.status_code == 200

    assert (
        response.headers["access-control-allow-origin"]
        == "http://localhost:5173"
    )

    assert "POST" in response.headers["access-control-allow-methods"]
