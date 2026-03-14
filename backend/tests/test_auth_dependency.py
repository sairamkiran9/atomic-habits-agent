"""
Integration tests for the authentication dependency protecting GET /api/user.

Each test exercises a different token scenario to verify that the endpoint
correctly accepts valid tokens and rejects invalid / expired ones.
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import timedelta

import pytest
from httpx import AsyncClient

from app.core.security import create_access_token


# ---------------------------------------------------------------------------
# GET /api/user
# ---------------------------------------------------------------------------


async def test_get_user_valid_token(
    client: AsyncClient,
    registered_user: dict,
    auth_headers: dict,
):
    """A request with a valid Bearer token returns HTTP 200 and the correct email."""
    response = await client.get("/api/user", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == registered_user["email"]


async def test_get_user_no_token(client: AsyncClient, registered_user: dict):
    """A request without an Authorization header returns HTTP 401 or 403."""
    response = await client.get("/api/user")
    assert response.status_code in (401, 403)


async def test_get_user_invalid_token(client: AsyncClient, registered_user: dict):
    """A request with a garbage Bearer token value returns HTTP 401 or 403."""
    headers = {"Authorization": "Bearer invalid_token"}
    response = await client.get("/api/user", headers=headers)
    assert response.status_code in (401, 403)


async def test_get_user_expired_token(
    client: AsyncClient,
    registered_user: dict,
    test_user_data: dict,
):
    """A request with an already-expired token returns HTTP 401 or 403."""
    expired_token = create_access_token(
        data={"sub": test_user_data["email"]},
        expires_delta=timedelta(minutes=-1),
    )
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = await client.get("/api/user", headers=headers)
    assert response.status_code in (401, 403)


async def test_get_user_malformed_bearer(client: AsyncClient, registered_user: dict):
    """A request whose Authorization header does not use the Bearer scheme returns HTTP 401 or 403."""
    headers = {"Authorization": "NotBearer sometoken"}
    response = await client.get("/api/user", headers=headers)
    assert response.status_code in (401, 403)
