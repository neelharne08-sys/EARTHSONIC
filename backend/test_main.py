from backend.auth_security import hash_password

import pytest
from fastapi.testclient import TestClient
from backend import main as backend_main
from backend.auth_database import create_user
from backend.auth_sessions import create_session
from backend.main import app

client = TestClient(app)


@pytest.fixture
def authorized_client(monkeypatch, tmp_path):
    db_path = tmp_path / 'science-test.sqlite3'
    monkeypatch.setattr(backend_main, 'get_auth_db_path', lambda: db_path)
    user_id = create_user('science-test@example.com', hash_password('EarthsonicTestPassword2026!'), db_path)
    session_token = create_session(user_id, db_path)
    member_client = TestClient(app)
    member_client.cookies.set('earthsonic_session', session_token)
    return member_client


def test_science_routes_require_login():
    assert client.get('/api/sonification').status_code == 401
    assert client.get('/api/science/temperature').status_code == 401
    assert client.get('/api/science/climate').status_code == 401


def test_health_endpoint():
    response = client.get("/api/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "ok"
    assert data["project"] == "EarthPulse"
    assert data["backend"] == "FastAPI"


def test_sonification_endpoint(authorized_client):
    response = authorized_client.get("/api/sonification")

    assert response.status_code == 200

    result = response.json()

    assert result["status"] == "success"
    assert result["project"] == "EarthPulse"
    assert result["analysis_type"] == "Relative image brightness sonification"

    data = result["data"]

    assert data["samples"] == 100
    assert len(data["brightness"]) == 100
    assert len(data["frequencies"]) == 100

    assert all(
        0 <= value <= 1
        for value in data["brightness"]
    )

    assert all(
        180 <= frequency <= 760
        for frequency in data["frequencies"]
    )


def test_cors_preflight():
    response = client.options(
        "/api/sonification",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
    )

    assert response.status_code == 200

    assert (
        response.headers["access-control-allow-origin"]
        == "http://localhost:5173"
    )

    assert "GET" in response.headers["access-control-allow-methods"]


def test_missing_image_returns_404(monkeypatch, tmp_path, authorized_client):
    missing_image = tmp_path / "missing.jpg"

    monkeypatch.setattr(
        "backend.main.IMAGE_PATH",
        missing_image
    )

    response = authorized_client.get("/api/sonification")

    assert response.status_code == 404

    assert response.json()["detail"] == (
        "NASA visualization image not found"
    )
