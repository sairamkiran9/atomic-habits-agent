"""
Integration tests for the authentication routes.

Endpoints under test:
- POST /api/auth/register
- POST /api/auth/login
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------


async def test_register_success(client: AsyncClient, test_user_data: dict):
    """Valid registration payload returns HTTP 201 with user fields."""
    response = await client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == test_user_data["email"]
    assert body["full_name"] == test_user_data["full_name"]
    assert "id" in body


async def test_register_returns_no_password(client: AsyncClient, test_user_data: dict):
    """Registration response must not expose plain or hashed passwords."""
    response = await client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == 201
    body = response.json()
    assert "password" not in body
    assert "hashed_password" not in body


async def test_register_duplicate_email(client: AsyncClient, registered_user: dict, test_user_data: dict):
    """Registering the same email a second time returns HTTP 400."""
    response = await client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == 400


async def test_register_password_too_short(client: AsyncClient):
    """A 7-character password fails schema validation → HTTP 422."""
    payload = {
        "email": "short@example.com",
        "full_name": "Short Pass",
        "password": "Short1",  # 6 chars
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 422


async def test_register_no_uppercase(client: AsyncClient):
    """A password with no uppercase letter fails schema validation → HTTP 422."""
    payload = {
        "email": "noupper@example.com",
        "full_name": "No Upper",
        "password": "testpass1",
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 422


async def test_register_no_digit(client: AsyncClient):
    """A password with no digit fails schema validation → HTTP 422."""
    payload = {
        "email": "nodigit@example.com",
        "full_name": "No Digit",
        "password": "Testpassword",
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 422


async def test_register_invalid_email(client: AsyncClient):
    """A non-email string fails schema validation → HTTP 422."""
    payload = {
        "email": "notanemail",
        "full_name": "Bad Email",
        "password": "Validpass1",
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------


async def test_login_success(client: AsyncClient, registered_user: dict, test_user_data: dict):
    """Valid credentials return HTTP 200 with an access_token and bearer token_type."""
    login_payload = {
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


async def test_login_wrong_password(client: AsyncClient, registered_user: dict, test_user_data: dict):
    """Wrong password returns HTTP 401."""
    login_payload = {
        "email": test_user_data["email"],
        "password": "WrongPass1",
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401


async def test_login_unknown_email(client: AsyncClient):
    """An email that has never been registered returns HTTP 401."""
    login_payload = {
        "email": "ghost@example.com",
        "password": "Anypass1",
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
