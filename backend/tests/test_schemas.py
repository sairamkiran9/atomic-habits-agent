"""
Unit tests for Pydantic schema validators.

Covers:
- app.schemas.user.UserCreate
- app.schemas.habit.HabitCreate
- app.schemas.habit.HabitUpdate
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from pydantic import ValidationError

from app.schemas.user import UserCreate
from app.schemas.habit import HabitCreate, HabitUpdate


# ---------------------------------------------------------------------------
# UserCreate
# ---------------------------------------------------------------------------


async def test_user_create_valid():
    """Valid email, full_name, and password that satisfies all rules → no error."""
    user = UserCreate(
        email="valid@example.com",
        full_name="Valid User",
        password="Validpass1",
    )
    assert user.email == "valid@example.com"


async def test_user_create_password_too_short():
    """A password shorter than 8 characters raises ValidationError."""
    with pytest.raises(ValidationError):
        UserCreate(
            email="valid@example.com",
            full_name="Test User",
            password="Short1",  # 6 chars
        )


async def test_user_create_password_no_uppercase():
    """A password with no uppercase letter raises ValidationError with 'uppercase' hint."""
    with pytest.raises(ValidationError) as exc_info:
        UserCreate(
            email="valid@example.com",
            full_name="Test User",
            password="testpass1",  # all lowercase
        )
    assert "uppercase" in str(exc_info.value).lower()


async def test_user_create_password_no_digit():
    """A password with no digit raises ValidationError with 'digit' hint."""
    with pytest.raises(ValidationError) as exc_info:
        UserCreate(
            email="valid@example.com",
            full_name="Test User",
            password="Testpassword",  # no digit
        )
    assert "digit" in str(exc_info.value).lower()


async def test_user_create_invalid_email():
    """A non-email string raises ValidationError."""
    with pytest.raises(ValidationError):
        UserCreate(
            email="notanemail",
            full_name="Test User",
            password="Validpass1",
        )


# ---------------------------------------------------------------------------
# HabitCreate
# ---------------------------------------------------------------------------


async def test_habit_create_valid():
    """All fields valid → no error."""
    habit = HabitCreate(
        title="Morning Run",
        description="Run 5km every morning",
        frequency="daily",
        category="Fitness",
    )
    assert habit.title == "Morning Run"


async def test_habit_create_title_too_long():
    """A title exceeding 100 characters raises ValidationError."""
    with pytest.raises(ValidationError):
        HabitCreate(
            title="A" * 101,
            description="Some description",
            frequency="daily",
            category="Fitness",
        )


async def test_habit_create_description_too_long():
    """A description exceeding 500 characters raises ValidationError."""
    with pytest.raises(ValidationError):
        HabitCreate(
            title="Valid Title",
            description="D" * 501,
            frequency="daily",
            category="Fitness",
        )


async def test_habit_create_invalid_frequency():
    """An unsupported frequency value ('hourly') raises ValidationError."""
    with pytest.raises(ValidationError):
        HabitCreate(
            title="Valid Title",
            description="Some description",
            frequency="hourly",
            category="Fitness",
        )


async def test_habit_create_invalid_category():
    """An unsupported category value ('Sports') raises ValidationError."""
    with pytest.raises(ValidationError):
        HabitCreate(
            title="Valid Title",
            description="Some description",
            frequency="daily",
            category="Sports",
        )


# ---------------------------------------------------------------------------
# HabitUpdate
# ---------------------------------------------------------------------------


async def test_habit_update_all_optional():
    """HabitUpdate with no arguments is valid because all fields are optional."""
    update = HabitUpdate()
    # Every field should be None when omitted.
    assert update.title is None
    assert update.frequency is None
    assert update.category is None
    assert update.completed is None
