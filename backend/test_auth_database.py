
import sqlite3

import pytest

from backend.auth_database import (
    initialize_database,
    create_user,
    get_user_by_email,
    get_user_by_id
)
from backend.auth_security import (
    hash_password,
    verify_password
)


def test_database_initialization(tmp_path):
    db_path = tmp_path / "test.sqlite3"

    initialize_database(db_path)

    assert db_path.exists()


def test_create_user(tmp_path):
    db_path = tmp_path / "test.sqlite3"

    password = "EarthsonicSecure2026!"
    password_hash = hash_password(password)

    user_id = create_user(
        "test@example.com",
        password_hash,
        db_path
    )

    user = get_user_by_email(
        "test@example.com",
        db_path
    )

    assert user["id"] == user_id
    assert user["email"] == "test@example.com"
    assert user["password_hash"] != password
    assert verify_password(
        password,
        user["password_hash"]
    )


def test_duplicate_email_rejected(tmp_path):
    db_path = tmp_path / "test.sqlite3"

    password_hash = hash_password(
        "EarthsonicSecure2026!"
    )

    create_user(
        "test@example.com",
        password_hash,
        db_path
    )

    with pytest.raises(sqlite3.IntegrityError):
        create_user(
            "TEST@example.com",
            password_hash,
            db_path
        )


def test_user_lookup_by_id(tmp_path):
    db_path = tmp_path / "test.sqlite3"

    user_id = create_user(
        "user@example.com",
        hash_password("EarthsonicSecure2026!"),
        db_path
    )

    user = get_user_by_id(user_id, db_path)

    assert user is not None
    assert user["email"] == "user@example.com"


def test_unknown_user_returns_none(tmp_path):
    db_path = tmp_path / "test.sqlite3"

    user = get_user_by_email(
        "missing@example.com",
        db_path
    )

    assert user is None


def test_email_normalization(tmp_path):
    db_path = tmp_path / "test.sqlite3"

    create_user(
        "  USER@Example.COM  ",
        hash_password("EarthsonicSecure2026!"),
        db_path
    )

    user = get_user_by_email(
        "user@example.com",
        db_path
    )

    assert user["email"] == "user@example.com"
