
import json
import re
import sqlite3

from contextlib import closing

from backend.auth_database import (
    DEFAULT_DB_PATH,
    initialize_database
)
from backend.user_favorites import (
    validate_station_id,
    validate_user_id
)

MAX_MIX_NAME_LENGTH = 80
MAX_TRACKS = 16

REQUIRED_SETTINGS = {
    "master_volume",
    "is_muted",
    "is_looping",
    "overlay_active",
    "speech_active",
    "tracks"
}


def validate_mix_id(mix_id):
    if (
        isinstance(mix_id, bool)
        or not isinstance(mix_id, int)
        or mix_id <= 0
    ):
        raise ValueError("Invalid mix ID")

    return mix_id


def validate_mix_name(name):
    if not isinstance(name, str):
        raise ValueError("Mix name must be a string")

    normalized = name.strip()

    if not normalized or len(normalized) > MAX_MIX_NAME_LENGTH:
        raise ValueError("Mix name must contain 1 to 80 characters")

    if any(ord(character) < 32 or ord(character) == 127 for character in normalized):
        raise ValueError("Mix name contains invalid characters")

    return normalized


def validate_volume(value):
    if (
        isinstance(value, bool)
        or not isinstance(value, int)
        or not 0 <= value <= 100
    ):
        raise ValueError("Volume must be an integer from 0 to 100")

    return value


def validate_mix_settings(settings):
    if not isinstance(settings, dict):
        raise ValueError("Mix settings must be an object")

    if set(settings) != REQUIRED_SETTINGS:
        raise ValueError("Mix settings have missing or unknown fields")

    master_volume = validate_volume(settings["master_volume"])

    flags = (
        "is_muted",
        "is_looping",
        "overlay_active",
        "speech_active"
    )

    for flag in flags:
        if not isinstance(settings[flag], bool):
            raise ValueError(f"{flag} must be a boolean")

    tracks = settings["tracks"]

    if not isinstance(tracks, dict) or len(tracks) > MAX_TRACKS:
        raise ValueError("Invalid track settings")

    normalized_tracks = {}

    for track_id, track in tracks.items():
        if (
            not isinstance(track_id, str)
            or re.fullmatch(
                r"[A-Za-z][A-Za-z0-9_-]{0,63}",
                track_id
            ) is None
        ):
            raise ValueError("Invalid track ID")

        if not isinstance(track, dict):
            raise ValueError("Track settings must be objects")

        if set(track) != {"volume", "muted"}:
            raise ValueError("Invalid track settings fields")

        if not isinstance(track["muted"], bool):
            raise ValueError("Track muted must be a boolean")

        normalized_tracks[track_id] = {
            "volume": validate_volume(track["volume"]),
            "muted": track["muted"]
        }

    return {
        "master_volume": master_volume,
        "is_muted": settings["is_muted"],
        "is_looping": settings["is_looping"],
        "overlay_active": settings["overlay_active"],
        "speech_active": settings["speech_active"],
        "tracks": normalized_tracks
    }


def initialize_mixes(db_path=DEFAULT_DB_PATH):
    initialize_database(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.execute("PRAGMA foreign_keys = ON")

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS user_mixes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                station_id TEXT NOT NULL,
                settings_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
            """
        )

        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_user_mixes_user
            ON user_mixes(user_id, updated_at DESC, id DESC)
            """
        )

        connection.commit()


def row_to_mix(row):
    if row is None:
        return None

    result = dict(row)
    result["settings"] = json.loads(
        result.pop("settings_json")
    )

    return result


def create_mix(
    user_id,
    name,
    station_id,
    settings,
    db_path=DEFAULT_DB_PATH
):
    validate_user_id(user_id)
    normalized_name = validate_mix_name(name)
    validate_station_id(station_id)
    normalized_settings = validate_mix_settings(settings)

    initialize_mixes(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.execute("PRAGMA foreign_keys = ON")

        cursor = connection.execute(
            """
            INSERT INTO user_mixes (
                user_id,
                name,
                station_id,
                settings_json
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                user_id,
                normalized_name,
                station_id,
                json.dumps(
                    normalized_settings,
                    ensure_ascii=False,
                    sort_keys=True
                )
            )
        )

        mix_id = cursor.lastrowid
        connection.commit()

    return get_mix(user_id, mix_id, db_path)


def get_mix(
    user_id,
    mix_id,
    db_path=DEFAULT_DB_PATH
):
    validate_user_id(user_id)
    validate_mix_id(mix_id)
    initialize_mixes(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.row_factory = sqlite3.Row

        row = connection.execute(
            """
            SELECT *
            FROM user_mixes
            WHERE id = ? AND user_id = ?
            """,
            (mix_id, user_id)
        ).fetchone()

        return row_to_mix(row)


def list_mixes(
    user_id,
    db_path=DEFAULT_DB_PATH
):
    validate_user_id(user_id)
    initialize_mixes(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.row_factory = sqlite3.Row

        rows = connection.execute(
            """
            SELECT *
            FROM user_mixes
            WHERE user_id = ?
            ORDER BY updated_at DESC, id DESC
            """,
            (user_id,)
        ).fetchall()

        return [row_to_mix(row) for row in rows]


def update_mix(
    user_id,
    mix_id,
    name,
    station_id,
    settings,
    db_path=DEFAULT_DB_PATH
):
    validate_user_id(user_id)
    validate_mix_id(mix_id)
    normalized_name = validate_mix_name(name)
    validate_station_id(station_id)
    normalized_settings = validate_mix_settings(settings)

    initialize_mixes(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        cursor = connection.execute(
            """
            UPDATE user_mixes
            SET name = ?,
                station_id = ?,
                settings_json = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
            """,
            (
                normalized_name,
                station_id,
                json.dumps(
                    normalized_settings,
                    ensure_ascii=False,
                    sort_keys=True
                ),
                mix_id,
                user_id
            )
        )

        connection.commit()

        if cursor.rowcount == 0:
            return None

    return get_mix(user_id, mix_id, db_path)


def delete_mix(
    user_id,
    mix_id,
    db_path=DEFAULT_DB_PATH
):
    validate_user_id(user_id)
    validate_mix_id(mix_id)
    initialize_mixes(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        cursor = connection.execute(
            """
            DELETE FROM user_mixes
            WHERE id = ? AND user_id = ?
            """,
            (mix_id, user_id)
        )

        connection.commit()

        return cursor.rowcount == 1
