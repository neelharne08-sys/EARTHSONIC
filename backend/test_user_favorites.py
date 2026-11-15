
import pytest

from fastapi.testclient import TestClient

from backend.main import app, get_auth_db_path


@pytest.fixture
def favorites_client(tmp_path):
    db_path = tmp_path / "favorites_api.sqlite3"

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


def create_and_login(
    client,
    email="user@example.com"
):
    registered = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "EarthsonicSecure2026!"
        }
    )

    assert registered.status_code == 201

    logged_in = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "EarthsonicSecure2026!"
        }
    )

    assert logged_in.status_code == 200

    return logged_in.json()["csrf_token"]


def test_get_requires_login(favorites_client):
    response = favorites_client.get(
        "/api/user/favorites"
    )

    assert response.status_code == 401


def test_add_requires_login(favorites_client):
    response = favorites_client.post(
        "/api/user/favorites",
        json={"station_id": "svs-4950"}
    )

    assert response.status_code == 401


def test_delete_requires_login(favorites_client):
    response = favorites_client.delete(
        "/api/user/favorites/svs-4950"
    )

    assert response.status_code == 401


def test_initial_favorites_empty(favorites_client):
    create_and_login(favorites_client)

    response = favorites_client.get(
        "/api/user/favorites"
    )

    assert response.status_code == 200

    assert response.json() == {
        "favorites": [],
        "count": 0
    }


def test_add_favorite(favorites_client):
    csrf = create_and_login(favorites_client)

    response = favorites_client.post(
        "/api/user/favorites",
        headers={"X-CSRF-Token": csrf},
        json={"station_id": "svs-4950"}
    )

    assert response.status_code == 200
    assert response.json()["added"] is True

    saved = favorites_client.get(
        "/api/user/favorites"
    )

    assert saved.status_code == 200
    assert saved.json()["count"] == 1
    assert saved.json()["favorites"][0]["station_id"] == (
        "svs-4950"
    )


def test_duplicate_favorite(favorites_client):
    csrf = create_and_login(favorites_client)

    headers = {"X-CSRF-Token": csrf}
    payload = {"station_id": "svs-4950"}

    first = favorites_client.post(
        "/api/user/favorites",
        headers=headers,
        json=payload
    )

    second = favorites_client.post(
        "/api/user/favorites",
        headers=headers,
        json=payload
    )

    assert first.json()["added"] is True
    assert second.json()["added"] is False

    result = favorites_client.get(
        "/api/user/favorites"
    )

    assert result.json()["count"] == 1


def test_delete_favorite(favorites_client):
    csrf = create_and_login(favorites_client)

    favorites_client.post(
        "/api/user/favorites",
        headers={"X-CSRF-Token": csrf},
        json={"station_id": "svs-4950"}
    )

    response = favorites_client.delete(
        "/api/user/favorites/svs-4950",
        headers={"X-CSRF-Token": csrf}
    )

    assert response.status_code == 200
    assert response.json()["removed"] is True

    result = favorites_client.get(
        "/api/user/favorites"
    )

    assert result.json()["count"] == 0


def test_unknown_station_rejected(favorites_client):
    csrf = create_and_login(favorites_client)

    response = favorites_client.post(
        "/api/user/favorites",
        headers={"X-CSRF-Token": csrf},
        json={"station_id": "svs-99999"}
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "NASA station not found"
    )


def test_invalid_csrf_prevents_add(favorites_client):
    create_and_login(favorites_client)

    response = favorites_client.post(
        "/api/user/favorites",
        headers={"X-CSRF-Token": "wrong-token"},
        json={"station_id": "svs-4950"}
    )

    assert response.status_code == 403

    result = favorites_client.get(
        "/api/user/favorites"
    )

    assert result.json()["count"] == 0


def test_invalid_csrf_prevents_delete(favorites_client):
    csrf = create_and_login(favorites_client)

    favorites_client.post(
        "/api/user/favorites",
        headers={"X-CSRF-Token": csrf},
        json={"station_id": "svs-4950"}
    )

    response = favorites_client.delete(
        "/api/user/favorites/svs-4950",
        headers={"X-CSRF-Token": "wrong-token"}
    )

    assert response.status_code == 403

    result = favorites_client.get(
        "/api/user/favorites"
    )

    assert result.json()["count"] == 1


def test_users_have_separate_favorites(favorites_client):
    first_csrf = create_and_login(
        favorites_client,
        "first@example.com"
    )

    favorites_client.post(
        "/api/user/favorites",
        headers={"X-CSRF-Token": first_csrf},
        json={"station_id": "svs-4950"}
    )

    with TestClient(app) as second_client:
        create_and_login(
            second_client,
            "second@example.com"
        )

        result = second_client.get(
            "/api/user/favorites"
        )

        assert result.status_code == 200
        assert result.json()["count"] == 0

    original = favorites_client.get(
        "/api/user/favorites"
    )

    assert original.json()["count"] == 1


def test_cannot_delete_another_users_favorite(
    favorites_client
):
    csrf = create_and_login(
        favorites_client,
        "first@example.com"
    )

    favorites_client.post(
        "/api/user/favorites",
        headers={"X-CSRF-Token": csrf},
        json={"station_id": "svs-4950"}
    )

    with TestClient(app) as second_client:
        second_csrf = create_and_login(
            second_client,
            "second@example.com"
        )

        response = second_client.delete(
            "/api/user/favorites/svs-4950",
            headers={"X-CSRF-Token": second_csrf}
        )

        assert response.status_code == 200
        assert response.json()["removed"] is False

    result = favorites_client.get(
        "/api/user/favorites"
    )

    assert result.json()["count"] == 1


def test_delete_cors_preflight(favorites_client):
    response = favorites_client.options(
        "/api/user/favorites/svs-4950",
        headers={
            "Origin": "http://localhost:5174",
            "Access-Control-Request-Method": "DELETE",
            "Access-Control-Request-Headers": "x-csrf-token"
        }
    )

    assert response.status_code == 200

    assert (
        response.headers["access-control-allow-origin"]
        == "http://localhost:5174"
    )

    assert "DELETE" in (
        response.headers["access-control-allow-methods"]
    )


def test_disallowed_origin_rejected(favorites_client):
    csrf = create_and_login(favorites_client)

    response = favorites_client.post(
        "/api/user/favorites",
        headers={
            "Origin": "https://untrusted.example",
            "X-CSRF-Token": csrf
        },
        json={"station_id": "svs-4950"}
    )

    assert response.status_code == 403


def test_five_digit_station_supported(favorites_client):
    csrf = create_and_login(favorites_client)

    response = favorites_client.post(
        "/api/user/favorites",
        headers={"X-CSRF-Token": csrf},
        json={"station_id": "svs-13786"}
    )

    assert response.status_code == 200
    assert response.json()["added"] is True
