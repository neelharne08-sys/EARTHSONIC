
import sqlite3
from contextlib import closing
from pathlib import Path

DEFAULT_DB_PATH = (
    Path(__file__).resolve().parent
    / "data"
    / "earthsonic.sqlite3"
)


def normalize_email(email: str) -> str:
    if not isinstance(email, str):
        raise TypeError("Email must be a string")

    normalized = email.strip().lower()

    if not normalized:
        raise ValueError("Email cannot be empty")

    return normalized


def initialize_database(db_path=DEFAULT_DB_PATH):
    db_path = Path(db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


def create_user(
    email: str,
    password_hash: str,
    db_path=DEFAULT_DB_PATH
):
    normalized_email = normalize_email(email)

    if (
        not isinstance(password_hash, str)
        or not password_hash.startswith("$argon2")
    ):
        raise ValueError("A valid Argon2 hash is required")

    initialize_database(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        cursor = connection.execute(
            """
            INSERT INTO users (email, password_hash)
            VALUES (?, ?)
            """,
            (normalized_email, password_hash)
        )

        connection.commit()

        return cursor.lastrowid


def get_user_by_email(
    email: str,
    db_path=DEFAULT_DB_PATH
):
    normalized_email = normalize_email(email)
    initialize_database(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.row_factory = sqlite3.Row

        row = connection.execute(
            """
            SELECT id, email, password_hash, created_at
            FROM users
            WHERE email = ?
            """,
            (normalized_email,)
        ).fetchone()

        return dict(row) if row else None


def get_user_by_id(
    user_id: int,
    db_path=DEFAULT_DB_PATH
):
    initialize_database(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.row_factory = sqlite3.Row

        row = connection.execute(
            """
            SELECT id, email, password_hash, created_at
            FROM users
            WHERE id = ?
            """,
            (user_id,)
        ).fetchone()

        return dict(row) if row else None
