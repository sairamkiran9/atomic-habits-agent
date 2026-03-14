"""
Integration tests for the habit-reset endpoint and verifying that the
GET /api/habits list does NOT auto-reset.

Endpoint under test: POST /api/habits/reset

Time is simulated by directly updating habit rows in the test database
via SQLAlchemy after habits are created through the API.
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import datetime, timedelta, timezone

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.habit import Habit

# ---------------------------------------------------------------------------
# Shared habit payload
# ---------------------------------------------------------------------------

DAILY_HABIT = {
    "title": "Daily Habit",
    "description": "Done every day",
    "frequency": "daily",
    "category": "Health",
}

WEEKLY_HABIT = {
    "title": "Weekly Habit",
    "description": "Done every week",
    "frequency": "weekly",
    "category": "Health",
}

MONTHLY_HABIT = {
    "title": "Monthly Habit",
    "description": "Done every month",
    "frequency": "monthly",
    "category": "Health",
}

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

NOW_UTC = datetime.now(timezone.utc)


async def _set_habit_state(
    db_session: AsyncSession,
    habit_id: int,
    *,
    last_completed: datetime | None,
    completed: bool,
    streak: int = 1,
    created_at: datetime | None = None,
    is_archived: bool = False,
) -> None:
    """Directly update habit state in the database."""
    values: dict = {
        "completed": completed,
        "streak": streak,
        "is_archived": is_archived,
    }
    if last_completed is not None:
        values["last_completed"] = last_completed
    if created_at is not None:
        values["created_at"] = created_at
    await db_session.execute(
        update(Habit).where(Habit.id == habit_id).values(**values)
    )
    await db_session.commit()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


async def test_reset_no_habits(client: AsyncClient, auth_headers: dict):
    """Calling reset when the user has no habits returns reset_count=0."""
    response = await client.post("/api/habits/reset", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["reset_count"] == 0


async def test_reset_daily_habit_completed_today(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """A daily habit completed today must NOT be reset."""
    resp = await client.post("/api/habits", json=DAILY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    await _set_habit_state(
        db_session,
        habit_id,
        last_completed=NOW_UTC,
        completed=True,
    )

    reset_resp = await client.post("/api/habits/reset", headers=auth_headers)
    assert reset_resp.json()["reset_count"] == 0

    get_resp = await client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    assert get_resp.json()["completed"] is True


async def test_reset_daily_habit_completed_yesterday(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """A daily habit last completed yesterday must be reset (completed → False)."""
    resp = await client.post("/api/habits", json=DAILY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    yesterday = NOW_UTC - timedelta(days=1)
    await _set_habit_state(
        db_session,
        habit_id,
        last_completed=yesterday,
        completed=True,
    )

    reset_resp = await client.post("/api/habits/reset", headers=auth_headers)
    assert reset_resp.json()["reset_count"] == 1

    get_resp = await client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    assert get_resp.json()["completed"] is False


async def test_reset_daily_streak_kept_when_completed_yesterday(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Completing yesterday keeps the streak intact (missed only 1 day = still on track)."""
    resp = await client.post("/api/habits", json=DAILY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    yesterday = NOW_UTC - timedelta(days=1)
    await _set_habit_state(
        db_session,
        habit_id,
        last_completed=yesterday,
        completed=True,
        streak=5,
    )

    await client.post("/api/habits/reset", headers=auth_headers)

    get_resp = await client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    assert get_resp.json()["streak"] == 5


async def test_reset_daily_streak_reset_when_missed_2_days(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """A daily habit last completed 3 days ago should have its streak zeroed."""
    resp = await client.post("/api/habits", json=DAILY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    three_days_ago = NOW_UTC - timedelta(days=3)
    await _set_habit_state(
        db_session,
        habit_id,
        last_completed=three_days_ago,
        completed=True,
        streak=10,
    )

    await client.post("/api/habits/reset", headers=auth_headers)

    get_resp = await client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    assert get_resp.json()["streak"] == 0


async def test_reset_weekly_habit_completed_this_week(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """A weekly habit completed within the current week must NOT be reset."""
    resp = await client.post("/api/habits", json=WEEKLY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    # Start of the current ISO week (Monday).
    week_start = NOW_UTC - timedelta(days=NOW_UTC.weekday())
    await _set_habit_state(
        db_session,
        habit_id,
        last_completed=week_start,
        completed=True,
    )

    reset_resp = await client.post("/api/habits/reset", headers=auth_headers)
    assert reset_resp.json()["reset_count"] == 0


async def test_reset_weekly_habit_completed_last_week(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """A weekly habit completed 8 days ago (last week) must be reset."""
    resp = await client.post("/api/habits", json=WEEKLY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    eight_days_ago = NOW_UTC - timedelta(days=8)
    await _set_habit_state(
        db_session,
        habit_id,
        last_completed=eight_days_ago,
        completed=True,
    )

    reset_resp = await client.post("/api/habits/reset", headers=auth_headers)
    assert reset_resp.json()["reset_count"] == 1

    get_resp = await client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    assert get_resp.json()["completed"] is False


async def test_reset_weekly_streak_reset_if_missed_two_weeks(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """A weekly habit completed 15 days ago (missed a whole week) should have streak=0."""
    resp = await client.post("/api/habits", json=WEEKLY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    fifteen_days_ago = NOW_UTC - timedelta(days=15)
    await _set_habit_state(
        db_session,
        habit_id,
        last_completed=fifteen_days_ago,
        completed=True,
        streak=4,
    )

    await client.post("/api/habits/reset", headers=auth_headers)

    get_resp = await client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    assert get_resp.json()["streak"] == 0


async def test_reset_monthly_habit_completed_this_month(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """A monthly habit completed within the current calendar month must NOT be reset."""
    resp = await client.post("/api/habits", json=MONTHLY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    # First day of the current month.
    this_month_start = NOW_UTC.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    await _set_habit_state(
        db_session,
        habit_id,
        last_completed=this_month_start,
        completed=True,
    )

    reset_resp = await client.post("/api/habits/reset", headers=auth_headers)
    assert reset_resp.json()["reset_count"] == 0


async def test_reset_monthly_habit_completed_last_month(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """A monthly habit last completed in the previous month must be reset."""
    resp = await client.post("/api/habits", json=MONTHLY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    # First day of the previous month.
    if NOW_UTC.month == 1:
        prev_month_dt = NOW_UTC.replace(
            year=NOW_UTC.year - 1, month=12, day=1, hour=0, minute=0, second=0, microsecond=0
        )
    else:
        prev_month_dt = NOW_UTC.replace(
            month=NOW_UTC.month - 1, day=1, hour=0, minute=0, second=0, microsecond=0
        )

    await _set_habit_state(
        db_session,
        habit_id,
        last_completed=prev_month_dt,
        completed=True,
    )

    reset_resp = await client.post("/api/habits/reset", headers=auth_headers)
    assert reset_resp.json()["reset_count"] == 1

    get_resp = await client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    assert get_resp.json()["completed"] is False


async def test_reset_monthly_streak_boundary_jan(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """
    Monthly habit last completed in November (two months before January)
    should have streak reset to 0 because December was missed.

    Uses a fixed date in January to test the year-boundary logic.
    """
    resp = await client.post("/api/habits", json=MONTHLY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    # Simulate last_completed = November of the previous year.
    november_last_year = NOW_UTC.replace(
        year=NOW_UTC.year - 1, month=11, day=1, hour=0, minute=0, second=0, microsecond=0
    )

    await _set_habit_state(
        db_session,
        habit_id,
        last_completed=november_last_year,
        completed=True,
        streak=6,
    )

    await client.post("/api/habits/reset", headers=auth_headers)

    get_resp = await client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    body = get_resp.json()
    # The habit was completed more than one month ago so it should be reset.
    assert body["completed"] is False
    # Streak should be 0 because at least one period was missed.
    assert body["streak"] == 0


async def test_reset_archived_habit_not_reset(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Archived habits must be skipped by the reset logic."""
    resp = await client.post("/api/habits", json=DAILY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    yesterday = NOW_UTC - timedelta(days=1)
    await _set_habit_state(
        db_session,
        habit_id,
        last_completed=yesterday,
        completed=True,
        is_archived=True,
    )

    reset_resp = await client.post("/api/habits/reset", headers=auth_headers)
    assert reset_resp.json()["reset_count"] == 0


async def test_reset_null_last_completed_uses_created_at(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """When last_completed is NULL the reset logic falls back to created_at."""
    resp = await client.post("/api/habits", json=DAILY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    yesterday = NOW_UTC - timedelta(days=1)
    # Set last_completed to None; created_at will be set to yesterday.
    await db_session.execute(
        update(Habit).where(Habit.id == habit_id).values(
            last_completed=None,
            completed=True,
            streak=1,
            created_at=yesterday,
        )
    )
    await db_session.commit()

    reset_resp = await client.post("/api/habits/reset", headers=auth_headers)
    # created_at is yesterday, so the daily habit should be reset.
    assert reset_resp.json()["reset_count"] == 1

    get_resp = await client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    assert get_resp.json()["completed"] is False


async def test_reset_unauthenticated(client: AsyncClient):
    """Calling reset without a token returns HTTP 401 or 403."""
    response = await client.post("/api/habits/reset")
    assert response.status_code in (401, 403)


async def test_list_habits_does_not_auto_reset(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """
    GET /api/habits must NOT trigger a reset.  If a completed habit has
    last_completed set to yesterday, it should still appear as completed=True
    when we simply list habits (without calling /reset first).
    """
    resp = await client.post("/api/habits", json=DAILY_HABIT, headers=auth_headers)
    habit_id = resp.json()["id"]

    yesterday = NOW_UTC - timedelta(days=1)
    await _set_habit_state(
        db_session,
        habit_id,
        last_completed=yesterday,
        completed=True,
    )

    # List habits WITHOUT calling /reset.
    list_resp = await client.get("/api/habits", headers=auth_headers)
    assert list_resp.status_code == 200
    habits = list_resp.json()
    target = next((h for h in habits if h["id"] == habit_id), None)
    assert target is not None
    assert target["completed"] is True, (
        "GET /api/habits must not auto-reset habits; completed should remain True."
    )
