"""
Test configuration and fixtures for the Atomic Habits API test suite.
"""
import sys
import os

# Ensure the backend directory is on the Python path so all app imports work.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
import pytest_asyncio
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from httpx import AsyncClient, ASGITransport

from main import app
from app.db.session import get_session
# Import base and all models so they are registered with Base.metadata.
from app.db.base import Base  # noqa: F401  (registers User, Habit, HabitLog)

# ---------------------------------------------------------------------------
# In-memory SQLite engine used for all tests
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ---------------------------------------------------------------------------
# Session-scoped table lifecycle
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture(scope="session", autouse=True)
async def create_tables():
    """Create all tables once before the test session; drop them after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# ---------------------------------------------------------------------------
# Per-test data isolation – truncate all tables before each test
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture(autouse=True)
async def truncate_tables(create_tables):
    """
    Delete all rows from every table before each test so tests are fully
    isolated even though the schema is created only once per session.

    We disable foreign-key checks while truncating to avoid constraint
    errors from deletion order.
    """
    async with test_engine.begin() as conn:
        # SQLite pragma to disable FK enforcement during cleanup.
        await conn.execute(text("PRAGMA foreign_keys = OFF"))
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())
        await conn.execute(text("PRAGMA foreign_keys = ON"))


# ---------------------------------------------------------------------------
# Per-test DB session
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture()
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Provide a fresh AsyncSession for each test.
    """
    async with TestSessionLocal() as session:
        yield session


# ---------------------------------------------------------------------------
# Dependency override – redirect the app's get_session to the test session
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture()
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Provide an AsyncClient wired to the FastAPI test app.
    The app's get_session dependency is overridden to use the test session.
    """
    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Convenience fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def test_user_data() -> dict:
    """Return a dict with valid registration payload."""
    return {
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "Testpass1",
    }


@pytest_asyncio.fixture()
async def registered_user(client: AsyncClient, test_user_data: dict) -> dict:
    """Register a user and return the response JSON."""
    response = await client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == 201, response.text
    return response.json()


@pytest_asyncio.fixture()
async def auth_headers(client: AsyncClient, registered_user: dict, test_user_data: dict) -> dict:
    """Log in and return Authorization headers for the test user."""
    login_payload = {
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture()
async def test_habit(client: AsyncClient, auth_headers: dict) -> dict:
    """Create a single habit via the API and return the response JSON."""
    habit_data = {
        "title": "Morning Run",
        "description": "Run 5km every morning",
        "frequency": "daily",
        "category": "Fitness",
    }
    response = await client.post("/api/habits", json=habit_data, headers=auth_headers)
    assert response.status_code == 201, response.text
    return response.json()
