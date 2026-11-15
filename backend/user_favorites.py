
import re
import sqlite3

from contextlib import closing

from backend.auth_database import (
    DEFAULT_DB_PATH,
    initialize_database
)


def validate_user_id(user_id: int) -> int:
    if (
        isinstance(user_id, bool)
        or not isinstance(user_id, int)
        or user_id <= 0
    ):
        raise ValueError("Invalid user ID")

    return user_id


def validate_station_id(station_id: str) -> str:
    if (
        not isinstance(station_id, str)
        or re.fullmatch(r"svs-[0-9]{4,6}", station_id) is None
    ):
        raise ValueError("Invalid NASA station ID")

    return station_id


def initialize_favorites(db_path=DEFAULT_DB_PATH):
    initialize_database(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.execute("PRAGMA foreign_keys = ON")

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS user_favorites (
                user_id INTEGER NOT NULL,
                station_id TEXT NOT NULL,
                created_at TEXT NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, station_id),
                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
            """
        )

        connection.commit()


def add_favorite(
    user_id: int,
    station_id: str,
    db_path=DEFAULT_DB_PATH
) -> bool:
    validate_user_id(user_id)
    validate_station_id(station_id)

    initialize_favorites(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.execute("PRAGMA foreign_keys = ON")

        cursor = connection.execute(
            """
            INSERT INTO user_favorites (
                user_id,
                station_id
            )
            VALUES (?, ?)
            ON CONFLICT(user_id, station_id)
            DO NOTHING
            """,
            (user_id, station_id)
        )

        connection.commit()

        return cursor.rowcount == 1


def list_favorites(
    user_id: int,
    db_path=DEFAULT_DB_PATH
) -> list[dict]:
    validate_user_id(user_id)
    initialize_favorites(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.row_factory = sqlite3.Row

        rows = connection.execute(
            """
            SELECT station_id, created_at
            FROM user_favorites
            WHERE user_id = ?
            ORDER BY created_at DESC, station_id ASC
            """,
            (user_id,)
        ).fetchall()

        return [dict(row) for row in rows]


def remove_favorite(
    user_id: int,
    station_id: str,
    db_path=DEFAULT_DB_PATH
) -> bool:
    validate_user_id(user_id)
    validate_station_id(station_id)

    initialize_favorites(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.execute("PRAGMA foreign_keys = ON")

        cursor = connection.execute(
            """
            DELETE FROM user_favorites
            WHERE user_id = ?
              AND station_id = ?
            """,
            (user_id, station_id)
        )

        connection.commit()

        return cursor.rowcount == 1
