
import pytest

from backend.auth_security import hash_password, verify_password


def test_password_hashing():
    password = "EarthsonicSecure2026!"
    hashed = hash_password(password)

    assert hashed != password
    assert hashed.startswith("$argon2")
    assert verify_password(password, hashed)


def test_wrong_password():
    hashed = hash_password("EarthsonicSecure2026!")

    assert not verify_password("WrongPassword123!", hashed)


def test_password_hashes_use_random_salts():
    password = "EarthsonicSecure2026!"

    first_hash = hash_password(password)
    second_hash = hash_password(password)

    assert first_hash != second_hash


def test_short_password_rejected():
    with pytest.raises(ValueError):
        hash_password("short")


def test_invalid_hash_rejected():
    assert not verify_password("EarthsonicSecure2026!", "invalid-hash")
