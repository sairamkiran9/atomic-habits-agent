"""
Unit tests for app.core.security utility functions.

Covers:
- verify_password
- get_password_hash
- create_access_token
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import datetime, timedelta, timezone

import pytest
from jose import jwt

from app.core.config import settings
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)


# ---------------------------------------------------------------------------
# Password hashing / verification
# ---------------------------------------------------------------------------


async def test_hash_and_verify_correct_password():
    """Hashing a password and verifying the same plain-text returns True."""
    password = "MySecurePass1"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) is True


async def test_verify_wrong_password():
    """Verifying a different plain-text against a hash returns False."""
    hashed = get_password_hash("CorrectPass1")
    assert verify_password("WrongPass1", hashed) is False


async def test_hash_is_unique():
    """Hashing the same password twice produces two different hashes (bcrypt salt)."""
    password = "SamePass1"
    hash1 = get_password_hash(password)
    hash2 = get_password_hash(password)
    assert hash1 != hash2


# ---------------------------------------------------------------------------
# JWT token creation
# ---------------------------------------------------------------------------


async def test_create_token_has_sub_claim():
    """Token payload must contain the 'sub' claim matching the input data."""
    email = "user@example.com"
    token = create_access_token(data={"sub": email})
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload["sub"] == email


async def test_create_token_default_expiry():
    """Without an explicit expires_delta the token should expire ~15 minutes from now."""
    before = datetime.utcnow()
    token = create_access_token(data={"sub": "user@example.com"})
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    exp = datetime.utcfromtimestamp(payload["exp"])
    expected = before + timedelta(minutes=15)
    # Allow a 5-second window for test execution time.
    assert abs((exp - expected).total_seconds()) < 5


async def test_create_token_custom_expiry():
    """Token expiry should reflect a custom expires_delta."""
    delta = timedelta(minutes=60)
    before = datetime.utcnow()
    token = create_access_token(data={"sub": "user@example.com"}, expires_delta=delta)
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    exp = datetime.utcfromtimestamp(payload["exp"])
    expected = before + delta
    # Allow a 5-second window for test execution time.
    assert abs((exp - expected).total_seconds()) < 5
