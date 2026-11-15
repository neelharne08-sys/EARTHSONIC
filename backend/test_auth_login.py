
import pytest

from fastapi.testclient import TestClient

from backend.main import (
    app,
    get_auth_db_path,
    SESSION_COOKIE_NAME
)


@pytest.fixture
def auth_client(tmp_path):
    db_path = tmp_path / "auth.sqlite3"

    app.dependency_overrides[get_auth_db_path] = (
        lambda: db_path
    )

    try:
        with TestClient(app) as client:
            yield client
    finally:
        app.dependency_overrides.pop(
            get_auth_db_path,
            None
        )


def register_test_user(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "tester@example.com",
            "password": "EarthsonicSecure2026!"
        }
    )

    assert response.status_code == 201


def login_test_user(client):
    return client.post(
        "/api/auth/login",
        json={
            "email": "tester@example.com",
            "password": "EarthsonicSecure2026!"
        }
    )


def test_login_success(auth_client):
    register_test_user(auth_client)

    response = login_test_user(auth_client)

    assert response.status_code == 200
    assert response.json()["user"]["email"] == (
        "tester@example.com"
    )
    assert "csrf_token" in response.json()
    assert "password_hash" not in response.text


def test_login_cookie_is_httponly(auth_client):
    register_test_user(auth_client)

    response = login_test_user(auth_client)

    cookie = response.headers["set-cookie"].lower()

    assert SESSION_COOKIE_NAME in cookie
    assert "httponly" in cookie
    assert "samesite=lax" in cookie


def test_wrong_password(auth_client):
    register_test_user(auth_client)

    response = auth_client.post(
        "/api/auth/login",
        json={
            "email": "tester@example.com",
            "password": "WrongPassword2026!"
        }
    )

    assert response.status_code == 401


def test_unknown_user(auth_client):
    response = auth_client.post(
        "/api/auth/login",
        json={
            "email": "missing@example.com",
            "password": "EarthsonicSecure2026!"
        }
    )

    assert response.status_code == 401


def test_get_current_user(auth_client):
    register_test_user(auth_client)
    login_test_user(auth_client)

    response = auth_client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json()["user"]["email"] == (
        "tester@example.com"
    )
    assert "csrf_token" in response.json()


def test_current_user_without_login(auth_client):
    response = auth_client.get("/api/auth/me")

    assert response.status_code == 401


def test_logout_success(auth_client):
    register_test_user(auth_client)

    login_response = login_test_user(auth_client)

    csrf_token = login_response.json()["csrf_token"]

    response = auth_client.post(
        "/api/auth/logout",
        headers={
            "X-CSRF-Token": csrf_token
        }
    )

    assert response.status_code == 200
    assert response.json()["status"] == "logged_out"

    me_response = auth_client.get("/api/auth/me")

    assert me_response.status_code == 401


def test_logout_invalid_csrf(auth_client):
    register_test_user(auth_client)
    login_test_user(auth_client)

    response = auth_client.post(
        "/api/auth/logout",
        headers={
            "X-CSRF-Token": "invalid-token"
        }
    )

    assert response.status_code == 403

    me_response = auth_client.get("/api/auth/me")

    assert me_response.status_code == 200


def test_logout_without_login(auth_client):
    response = auth_client.post(
        "/api/auth/logout",
        headers={
            "X-CSRF-Token": "invalid-token"
        }
    )

    assert response.status_code == 401


def test_disallowed_login_origin(auth_client):
    register_test_user(auth_client)

    response = auth_client.post(
        "/api/auth/login",
        headers={
            "Origin": "https://untrusted.example"
        },
        json={
            "email": "tester@example.com",
            "password": "EarthsonicSecure2026!"
        }
    )

    assert response.status_code == 403


def test_disallowed_logout_origin(auth_client):
    register_test_user(auth_client)

    login_response = login_test_user(auth_client)

    csrf_token = login_response.json()["csrf_token"]

    response = auth_client.post(
        "/api/auth/logout",
        headers={
            "Origin": "https://untrusted.example",
            "X-CSRF-Token": csrf_token
        }
    )

    assert response.status_code == 403


def test_auth_cors_credentials(auth_client):
    response = auth_client.options(
        "/api/auth/login",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
        }
    )

    assert response.status_code == 200

    assert (
        response.headers["access-control-allow-origin"]
        == "http://localhost:5173"
    )

    assert (
        response.headers["access-control-allow-credentials"]
        == "true"
    )
