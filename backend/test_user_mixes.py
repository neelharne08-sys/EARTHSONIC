
import copy
import sqlite3

import pytest

from backend.auth_database import create_user
from backend.auth_security import hash_password
from backend.user_mixes import (
    create_mix,
    delete_mix,
    get_mix,
    initialize_mixes,
    list_mixes,
    update_mix
)


@pytest.fixture
def db_path(tmp_path):
    return tmp_path / "mixes_test.sqlite3"


@pytest.fixture
def users(db_path):
    password_hash = hash_password("EarthsonicSecure2026!")

    first = create_user(
        "first@example.com",
        password_hash,
        db_path
    )

    second = create_user(
        "second@example.com",
        password_hash,
        db_path
    )

    return first, second


@pytest.fixture
def settings():
    return {
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


def test_initialize_mixes(db_path):
    initialize_mixes(db_path)

    with sqlite3.connect(db_path) as connection:
        row = connection.execute(
            """
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
            AND name = 'user_mixes'
            """
        ).fetchone()

    assert row is not None


def test_create_and_read_mix(db_path, users, settings):
    mix = create_mix(
        users[0],
        "Forest Symphony",
        "svs-4950",
        settings,
        db_path
    )

    assert mix["id"] > 0
    assert mix["user_id"] == users[0]
    assert mix["name"] == "Forest Symphony"
    assert mix["station_id"] == "svs-4950"
    assert mix["settings"] == settings
    assert mix["created_at"]
    assert mix["updated_at"]

    saved = get_mix(users[0], mix["id"], db_path)

    assert saved == mix


def test_mix_name_is_trimmed(db_path, users, settings):
    mix = create_mix(
        users[0],
        "  Ocean Melody  ",
        "svs-5425",
        settings,
        db_path
    )

    assert mix["name"] == "Ocean Melody"


def test_list_mixes_newest_first(db_path, users, settings):
    first = create_mix(
        users[0],
        "First Mix",
        "svs-4950",
        settings,
        db_path
    )

    second = create_mix(
        users[0],
        "Second Mix",
        "svs-5425",
        settings,
        db_path
    )

    mixes = list_mixes(users[0], db_path)

    assert len(mixes) == 2
    assert mixes[0]["id"] == second["id"]
    assert mixes[1]["id"] == first["id"]


def test_update_mix(db_path, users, settings):
    original = create_mix(
        users[0],
        "Original",
        "svs-4950",
        settings,
        db_path
    )

    changed_settings = copy.deepcopy(settings)
    changed_settings["master_volume"] = 40
    changed_settings["is_looping"] = False
    changed_settings["tracks"]["harp"]["volume"] = 25

    updated = update_mix(
        users[0],
        original["id"],
        "Updated Symphony",
        "svs-5425",
        changed_settings,
        db_path
    )

    assert updated["id"] == original["id"]
    assert updated["name"] == "Updated Symphony"
    assert updated["station_id"] == "svs-5425"
    assert updated["settings"] == changed_settings
    assert updated["created_at"] == original["created_at"]


def test_get_missing_mix(db_path, users):
    result = get_mix(users[0], 999999, db_path)

    assert result is None


def test_update_missing_mix(db_path, users, settings):
    result = update_mix(
        users[0],
        999999,
        "Missing Mix",
        "svs-4950",
        settings,
        db_path
    )

    assert result is None


def test_delete_mix(db_path, users, settings):
    mix = create_mix(
        users[0],
        "Delete Me",
        "svs-4950",
        settings,
        db_path
    )

    deleted = delete_mix(
        users[0],
        mix["id"],
        db_path
    )

    assert deleted is True
    assert get_mix(users[0], mix["id"], db_path) is None


def test_delete_missing_mix(db_path, users):
    result = delete_mix(
        users[0],
        999999,
        db_path
    )

    assert result is False


def test_user_mixes_are_isolated(db_path, users, settings):
    first_mix = create_mix(
        users[0],
        "Private Forest",
        "svs-4950",
        settings,
        db_path
    )

    second_mix = create_mix(
        users[1],
        "Private Ocean",
        "svs-5425",
        settings,
        db_path
    )

    first_list = list_mixes(users[0], db_path)
    second_list = list_mixes(users[1], db_path)

    assert [mix["id"] for mix in first_list] == [
        first_mix["id"]
    ]

    assert [mix["id"] for mix in second_list] == [
        second_mix["id"]
    ]

    assert get_mix(
        users[1],
        first_mix["id"],
        db_path
    ) is None


def test_another_user_cannot_modify_mix(
    db_path,
    users,
    settings
):
    mix = create_mix(
        users[0],
        "Private Mix",
        "svs-4950",
        settings,
        db_path
    )

    updated = update_mix(
        users[1],
        mix["id"],
        "Stolen Mix",
        "svs-5425",
        settings,
        db_path
    )

    deleted = delete_mix(
        users[1],
        mix["id"],
        db_path
    )

    assert updated is None
    assert deleted is False

    original = get_mix(
        users[0],
        mix["id"],
        db_path
    )

    assert original["name"] == "Private Mix"


def test_invalid_mix_names(db_path, users, settings):
    invalid_names = [
        "",
        "   ",
        "x" * 81,
        "Bad\nName",
        123
    ]

    for name in invalid_names:
        with pytest.raises(ValueError):
            create_mix(
                users[0],
                name,
                "svs-4950",
                settings,
                db_path
            )


def test_invalid_station_ids(db_path, users, settings):
    invalid_stations = [
        "",
        "4950",
        "../private",
        "svs-abc",
        "SVS-4950"
    ]

    for station_id in invalid_stations:
        with pytest.raises(ValueError):
            create_mix(
                users[0],
                "Invalid Station",
                station_id,
                settings,
                db_path
            )


def test_invalid_settings(db_path, users, settings):
    invalid_settings = []

    bad_volume = copy.deepcopy(settings)
    bad_volume["master_volume"] = 101
    invalid_settings.append(bad_volume)

    bad_boolean = copy.deepcopy(settings)
    bad_boolean["is_muted"] = "false"
    invalid_settings.append(bad_boolean)

    bad_tracks = copy.deepcopy(settings)
    bad_tracks["tracks"] = []
    invalid_settings.append(bad_tracks)

    bad_track_volume = copy.deepcopy(settings)
    bad_track_volume["tracks"]["harp"]["volume"] = -5
    invalid_settings.append(bad_track_volume)

    bad_track_mute = copy.deepcopy(settings)
    bad_track_mute["tracks"]["harp"]["muted"] = 0
    invalid_settings.append(bad_track_mute)

    missing_field = copy.deepcopy(settings)
    del missing_field["speech_active"]
    invalid_settings.append(missing_field)

    extra_field = copy.deepcopy(settings)
    extra_field["unknown"] = "value"
    invalid_settings.append(extra_field)

    for invalid in invalid_settings:
        with pytest.raises(ValueError):
            create_mix(
                users[0],
                "Invalid Settings",
                "svs-4950",
                invalid,
                db_path
            )


def test_invalid_track_id(db_path, users, settings):
    invalid = copy.deepcopy(settings)

    invalid["tracks"] = {
        "../harp": {
            "volume": 80,
            "muted": False
        }
    }

    with pytest.raises(ValueError):
        create_mix(
            users[0],
            "Bad Track",
            "svs-4950",
            invalid,
            db_path
        )


def test_duplicate_mix_names_allowed(db_path, users, settings):
    create_mix(
        users[0],
        "My Mix",
        "svs-4950",
        settings,
        db_path
    )

    create_mix(
        users[0],
        "My Mix",
        "svs-5425",
        settings,
        db_path
    )

    assert len(list_mixes(users[0], db_path)) == 2


def test_nonexistent_user_rejected(db_path, settings):
    initialize_mixes(db_path)

    with pytest.raises(sqlite3.IntegrityError):
        create_mix(
            999999,
            "Unknown User",
            "svs-4950",
            settings,
            db_path
        )


def test_mixes_deleted_with_user(db_path, users, settings):
    create_mix(
        users[0],
        "Temporary Mix",
        "svs-4950",
        settings,
        db_path
    )

    with sqlite3.connect(db_path) as connection:
        connection.execute("PRAGMA foreign_keys = ON")

        connection.execute(
            "DELETE FROM users WHERE id = ?",
            (users[0],)
        )

        connection.commit()

    assert list_mixes(users[0], db_path) == []


def test_invalid_numeric_ids(db_path, users):
    for invalid_id in [0, -1, True, "1"]:
        with pytest.raises(ValueError):
            get_mix(
                users[0],
                invalid_id,
                db_path
            )

    with pytest.raises(ValueError):
        list_mixes(0, db_path)
