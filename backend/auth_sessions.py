
import hashlib
import secrets
import sqlite3
import time

from contextlib import closing

from backend.auth_database import (
    DEFAULT_DB_PATH,
    initialize_database
)

SESSION_TTL_SECONDS = 8 * 60 * 60


def hash_session_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def initialize_sessions(db_path=DEFAULT_DB_PATH):
    initialize_database(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS auth_sessions (
                token_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
            """
        )

        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS
            idx_auth_sessions_expires_at
            ON auth_sessions(expires_at)
            """
        )

        connection.commit()


def create_session(
    user_id: int,
    db_path=DEFAULT_DB_PATH,
    ttl_seconds: int = SESSION_TTL_SECONDS
) -> str:
    if (
        not isinstance(user_id, int)
        or isinstance(user_id, bool)
        or user_id <= 0
    ):
        raise ValueError("Invalid user ID")

    if (
        not isinstance(ttl_seconds, int)
        or ttl_seconds <= 0
    ):
        raise ValueError("Invalid session lifetime")

    initialize_sessions(db_path)

    token = secrets.token_urlsafe(32)
    now = int(time.time())
    expires_at = now + ttl_seconds

    with closing(sqlite3.connect(db_path)) as connection:
        connection.execute("PRAGMA foreign_keys = ON")

        connection.execute(
            """
            INSERT INTO auth_sessions (
                token_hash,
                user_id,
                created_at,
                expires_at
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                hash_session_token(token),
                user_id,
                now,
                expires_at
            )
        )

        connection.commit()

    return token


def get_session_user_id(
    token: str,
    db_path=DEFAULT_DB_PATH
):
    if not isinstance(token, str) or not token:
        return None

    initialize_sessions(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        row = connection.execute(
            """
            SELECT s.user_id
            FROM auth_sessions AS s
            JOIN users AS u ON u.id = s.user_id
            WHERE s.token_hash = ?
              AND s.expires_at > ?
            """,
            (
                hash_session_token(token),
                int(time.time())
            )
        ).fetchone()

    return row[0] if row else None


def revoke_session(
    token: str,
    db_path=DEFAULT_DB_PATH
) -> bool:
    if not isinstance(token, str) or not token:
        return False

    initialize_sessions(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        cursor = connection.execute(
            """
            DELETE FROM auth_sessions
            WHERE token_hash = ?
            """,
            (hash_session_token(token),)
        )

        connection.commit()

        return cursor.rowcount > 0
