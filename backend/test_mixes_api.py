
import copy

import pytest

from fastapi.testclient import TestClient

from backend.main import app, get_auth_db_path


@pytest.fixture
def client(tmp_path):
    db_path = tmp_path / "mixes_api_test.sqlite3"

    app.dependency_overrides[get_auth_db_path] = (
        lambda: db_path
    )

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(
            get_auth_db_path,
            None
        )


def mix_payload(name="Forest Symphony"):
    return {
        "name": name,
        "station_id": "svs-4950",
        "settings": {
            "master_volume": 85,
            "is_muted": False,
            "is_looping": True,
            "overlay_active": True,
            "speech_active": True,
            "tracks": {
                "harp": {
                    "volume": 80,
                    "muted": False
                },
                "woodwind": {
                    "volume": 65,
                    "muted": False
                }
            }
        }
    }


def create_and_login(
    client,
    email="explorer@example.com"
):
    registration = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "EarthsonicSecure2026!"
        }
    )

    assert registration.status_code == 201

    login = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "EarthsonicSecure2026!"
        }
    )

    assert login.status_code == 200

    return login.json()["csrf_token"]


def save_mix(client, csrf, payload=None):
    response = client.post(
        "/api/user/mixes",
        headers={"X-CSRF-Token": csrf},
        json=payload or mix_payload()
    )

    assert response.status_code == 201

    return response.json()


def test_list_requires_login(client):
    response = client.get("/api/user/mixes")

    assert response.status_code == 401


def test_get_requires_login(client):
    response = client.get("/api/user/mixes/1")

    assert response.status_code == 401


def test_create_requires_login(client):
    response = client.post(
        "/api/user/mixes",
        json=mix_payload()
    )

    assert response.status_code == 401


def test_update_requires_login(client):
    response = client.put(
        "/api/user/mixes/1",
        json=mix_payload()
    )

    assert response.status_code == 401


def test_delete_requires_login(client):
    response = client.delete("/api/user/mixes/1")

    assert response.status_code == 401


def test_create_and_fetch_mix(client):
    csrf = create_and_login(client)

    saved = save_mix(client, csrf)

    assert saved["name"] == "Forest Symphony"
    assert saved["station_id"] == "svs-4950"
    assert saved["settings"] == mix_payload()["settings"]
    assert saved["id"] > 0
    assert saved["created_at"]
    assert saved["updated_at"]
    assert "user_id" not in saved

    response = client.get(
        f"/api/user/mixes/{saved['id']}"
    )

    assert response.status_code == 200
    assert response.json() == saved


def test_list_mixes(client):
    csrf = create_and_login(client)

    first = save_mix(
        client,
        csrf,
        mix_payload("First Symphony")
    )

    second = save_mix(
        client,
        csrf,
        mix_payload("Second Symphony")
    )

    response = client.get("/api/user/mixes")

    assert response.status_code == 200

    data = response.json()

    assert data["count"] == 2
    assert len(data["mixes"]) == 2
    assert data["mixes"][0]["id"] == second["id"]
    assert data["mixes"][1]["id"] == first["id"]


def test_update_mix(client):
    csrf = create_and_login(client)

    saved = save_mix(client, csrf)

    changed = mix_payload("Ocean Symphony")
    changed["station_id"] = "svs-5425"
    changed["settings"]["master_volume"] = 45
    changed["settings"]["is_looping"] = False

    response = client.put(
        f"/api/user/mixes/{saved['id']}",
        headers={"X-CSRF-Token": csrf},
        json=changed
    )

    assert response.status_code == 200

    updated = response.json()

    assert updated["id"] == saved["id"]
    assert updated["name"] == "Ocean Symphony"
    assert updated["station_id"] == "svs-5425"
    assert updated["settings"]["master_volume"] == 45
    assert updated["settings"]["is_looping"] is False
    assert updated["created_at"] == saved["created_at"]


def test_delete_mix(client):
    csrf = create_and_login(client)

    saved = save_mix(client, csrf)

    response = client.delete(
        f"/api/user/mixes/{saved['id']}",
        headers={"X-CSRF-Token": csrf}
    )

    assert response.status_code == 200

    assert response.json() == {
        "mix_id": saved["id"],
        "deleted": True
    }

    missing = client.get(
        f"/api/user/mixes/{saved['id']}"
    )

    assert missing.status_code == 404


def test_missing_mix_returns_404(client):
    csrf = create_and_login(client)

    get_response = client.get(
        "/api/user/mixes/999999"
    )

    put_response = client.put(
        "/api/user/mixes/999999",
        headers={"X-CSRF-Token": csrf},
        json=mix_payload()
    )

    delete_response = client.delete(
        "/api/user/mixes/999999",
        headers={"X-CSRF-Token": csrf}
    )

    assert get_response.status_code == 404
    assert put_response.status_code == 404
    assert delete_response.status_code == 404


def test_unknown_station_rejected(client):
    csrf = create_and_login(client)

    payload = mix_payload()
    payload["station_id"] = "svs-99999"

    response = client.post(
        "/api/user/mixes",
        headers={"X-CSRF-Token": csrf},
        json=payload
    )

    assert response.status_code == 404


def test_invalid_settings_rejected(client):
    csrf = create_and_login(client)

    invalid = copy.deepcopy(mix_payload())
    invalid["settings"]["master_volume"] = 200

    response = client.post(
        "/api/user/mixes",
        headers={"X-CSRF-Token": csrf},
        json=invalid
    )

    assert response.status_code == 422

    invalid_track = copy.deepcopy(mix_payload())
    invalid_track["settings"]["tracks"]["harp"]["muted"] = "no"

    response = client.post(
        "/api/user/mixes",
        headers={"X-CSRF-Token": csrf},
        json=invalid_track
    )

    assert response.status_code == 422


def test_invalid_name_rejected(client):
    csrf = create_and_login(client)

    payload = mix_payload()
    payload["name"] = "    "

    response = client.post(
        "/api/user/mixes",
        headers={"X-CSRF-Token": csrf},
        json=payload
    )

    assert response.status_code == 422


def test_missing_csrf_rejected(client):
    csrf = create_and_login(client)

    saved = save_mix(client, csrf)

    create_response = client.post(
        "/api/user/mixes",
        json=mix_payload()
    )

    update_response = client.put(
        f"/api/user/mixes/{saved['id']}",
        json=mix_payload("Changed")
    )

    delete_response = client.delete(
        f"/api/user/mixes/{saved['id']}"
    )

    assert create_response.status_code == 403
    assert update_response.status_code == 403
    assert delete_response.status_code == 403


def test_invalid_csrf_rejected(client):
    csrf = create_and_login(client)

    saved = save_mix(client, csrf)

    headers = {"X-CSRF-Token": "incorrect-token"}

    create_response = client.post(
        "/api/user/mixes",
        headers=headers,
        json=mix_payload()
    )

    update_response = client.put(
        f"/api/user/mixes/{saved['id']}",
        headers=headers,
        json=mix_payload("Changed")
    )

    delete_response = client.delete(
        f"/api/user/mixes/{saved['id']}",
        headers=headers
    )

    assert create_response.status_code == 403
    assert update_response.status_code == 403
    assert delete_response.status_code == 403

    existing = client.get(
        f"/api/user/mixes/{saved['id']}"
    )

    assert existing.status_code == 200
    assert existing.json()["name"] == "Forest Symphony"


def test_user_isolation(client):
    first_csrf = create_and_login(
        client,
        "first@example.com"
    )

    saved = save_mix(client, first_csrf)

    with TestClient(app) as second_client:
        second_csrf = create_and_login(
            second_client,
            "second@example.com"
        )

        listing = second_client.get(
            "/api/user/mixes"
        )

        reading = second_client.get(
            f"/api/user/mixes/{saved['id']}"
        )

        updating = second_client.put(
            f"/api/user/mixes/{saved['id']}",
            headers={"X-CSRF-Token": second_csrf},
            json=mix_payload("Unauthorized Change")
        )

        deleting = second_client.delete(
            f"/api/user/mixes/{saved['id']}",
            headers={"X-CSRF-Token": second_csrf}
        )

        assert listing.status_code == 200
        assert listing.json()["count"] == 0
        assert reading.status_code == 404
        assert updating.status_code == 404
        assert deleting.status_code == 404

    original = client.get(
        f"/api/user/mixes/{saved['id']}"
    )

    assert original.status_code == 200
    assert original.json()["name"] == "Forest Symphony"


def test_cors_put_preflight(client):
    response = client.options(
        "/api/user/mixes/1",
        headers={
            "Origin": "http://localhost:5174",
            "Access-Control-Request-Method": "PUT",
            "Access-Control-Request-Headers": (
                "content-type,x-csrf-token"
            )
        }
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == (
        "http://localhost:5174"
    )

    assert "PUT" in (
        response.headers["access-control-allow-methods"]
    )


def test_disallowed_origin_rejected(client):
    csrf = create_and_login(client)

    response = client.post(
        "/api/user/mixes",
        headers={
            "Origin": "https://untrusted.example",
            "X-CSRF-Token": csrf
        },
        json=mix_payload()
    )

    assert response.status_code == 403


def test_mixes_persist_after_relogin(client):
    csrf = create_and_login(client)

    saved = save_mix(client, csrf)

    logout = client.post(
        "/api/auth/logout",
        headers={"X-CSRF-Token": csrf}
    )

    assert logout.status_code == 200

    login = client.post(
        "/api/auth/login",
        json={
            "email": "explorer@example.com",
            "password": "EarthsonicSecure2026!"
        }
    )

    assert login.status_code == 200

    response = client.get("/api/user/mixes")

    assert response.status_code == 200
    assert response.json()["count"] == 1
    assert response.json()["mixes"][0]["id"] == saved["id"]


def test_duplicate_mix_names_allowed(client):
    csrf = create_and_login(client)

    first = save_mix(
        client,
        csrf,
        mix_payload("My Favorite Sound")
    )

    second = save_mix(
        client,
        csrf,
        mix_payload("My Favorite Sound")
    )

    assert first["id"] != second["id"]

    listing = client.get("/api/user/mixes")

    assert listing.json()["count"] == 2
