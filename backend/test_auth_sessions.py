
import hashlib
import sqlite3

from backend.auth_database import create_user
from backend.auth_security import hash_password
from backend.auth_sessions import (
    create_session,
    get_session_user_id,
    revoke_session
)


def make_user(db_path):
    return create_user(
        "tester@example.com",
        hash_password("EarthsonicSecure2026!"),
        db_path
    )


def test_create_session(tmp_path):
    db_path = tmp_path / "test.sqlite3"
    user_id = make_user(db_path)

    token = create_session(user_id, db_path)

    assert isinstance(token, str)
    assert len(token) >= 32
    assert get_session_user_id(token, db_path) == user_id


def test_session_token_not_stored_plaintext(tmp_path):
    db_path = tmp_path / "test.sqlite3"
    user_id = make_user(db_path)

    token = create_session(user_id, db_path)

    with sqlite3.connect(db_path) as connection:
        stored_hash = connection.execute(
            "SELECT token_hash FROM auth_sessions"
        ).fetchone()[0]

    expected_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    assert stored_hash == expected_hash
    assert stored_hash != token


def test_session_tokens_are_unique(tmp_path):
    db_path = tmp_path / "test.sqlite3"
    user_id = make_user(db_path)

    token_one = create_session(user_id, db_path)
    token_two = create_session(user_id, db_path)

    assert token_one != token_two


def test_invalid_token(tmp_path):
    db_path = tmp_path / "test.sqlite3"
    make_user(db_path)

    assert get_session_user_id(
        "invalid-session-token",
        db_path
    ) is None


def test_logout_revokes_session(tmp_path):
    db_path = tmp_path / "test.sqlite3"
    user_id = make_user(db_path)

    token = create_session(user_id, db_path)

    assert revoke_session(token, db_path)
    assert get_session_user_id(token, db_path) is None


def test_expired_session(tmp_path):
    db_path = tmp_path / "test.sqlite3"
    user_id = make_user(db_path)

    token = create_session(user_id, db_path)

    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            UPDATE auth_sessions
            SET expires_at = 0
            """
        )

        connection.commit()

    assert get_session_user_id(token, db_path) is None
