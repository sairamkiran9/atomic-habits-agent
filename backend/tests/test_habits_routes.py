"""
Integration tests for all habit CRUD endpoints.

Endpoints under test:
- GET    /api/habits
- POST   /api/habits
- GET    /api/habits/{id}
- PUT    /api/habits/{id}
- POST   /api/habits/{id}/archive
- DELETE /api/habits/{id}
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
import pytest_asyncio
from httpx import AsyncClient

HABIT_DATA = {
    "title": "Morning Run",
    "description": "Run 5km every morning",
    "frequency": "daily",
    "category": "Fitness",
}


# ---------------------------------------------------------------------------
# Helper fixture – a second registered user with independent auth headers
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture()
async def second_user_headers(client: AsyncClient) -> dict:
    """Register a second user and return its auth headers."""
    reg_payload = {
        "email": "other@example.com",
        "full_name": "Other User",
        "password": "Otherpass1",
    }
    reg_response = await client.post("/api/auth/register", json=reg_payload)
    assert reg_response.status_code == 201, reg_response.text

    login_payload = {"email": reg_payload["email"], "password": reg_payload["password"]}
    login_response = await client.post("/api/auth/login", json=login_payload)
    assert login_response.status_code == 200, login_response.text

    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture()
async def second_user_habit(client: AsyncClient, second_user_headers: dict) -> dict:
    """Create a habit owned by the second user."""
    response = await client.post("/api/habits", json=HABIT_DATA, headers=second_user_headers)
    assert response.status_code == 201, response.text
    return response.json()


# ---------------------------------------------------------------------------
# List habits (GET /api/habits)
# ---------------------------------------------------------------------------


async def test_list_habits_empty(client: AsyncClient, auth_headers: dict):
    """Authenticated user with no habits gets an empty list."""
    response = await client.get("/api/habits", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


async def test_list_habits_returns_habit(
    client: AsyncClient, auth_headers: dict, test_habit: dict
):
    """After creating a habit the list endpoint includes it."""
    response = await client.get("/api/habits", headers=auth_headers)
    assert response.status_code == 200
    ids = [h["id"] for h in response.json()]
    assert test_habit["id"] in ids


async def test_list_habits_returns_own_only(
    client: AsyncClient,
    auth_headers: dict,
    second_user_habit: dict,
):
    """The list must NOT include habits that belong to a different user."""
    response = await client.get("/api/habits", headers=auth_headers)
    assert response.status_code == 200
    ids = [h["id"] for h in response.json()]
    assert second_user_habit["id"] not in ids


async def test_list_habits_pagination_skip(client: AsyncClient, auth_headers: dict):
    """skip=2 on a 3-habit list should return exactly 1 habit."""
    for i in range(3):
        data = {**HABIT_DATA, "title": f"Habit {i}"}
        await client.post("/api/habits", json=data, headers=auth_headers)

    response = await client.get("/api/habits?skip=2", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_list_habits_pagination_limit(client: AsyncClient, auth_headers: dict):
    """limit=1 should return at most 1 habit even when more exist."""
    for i in range(3):
        data = {**HABIT_DATA, "title": f"Habit Lim {i}"}
        await client.post("/api/habits", json=data, headers=auth_headers)

    response = await client.get("/api/habits?limit=1", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_list_habits_filter_category(client: AsyncClient, auth_headers: dict):
    """Filtering by category=Fitness should only return Fitness habits."""
    await client.post(
        "/api/habits",
        json={**HABIT_DATA, "title": "Fitness Habit", "category": "Fitness"},
        headers=auth_headers,
    )
    await client.post(
        "/api/habits",
        json={**HABIT_DATA, "title": "Health Habit", "category": "Health"},
        headers=auth_headers,
    )

    response = await client.get("/api/habits?category=Fitness", headers=auth_headers)
    assert response.status_code == 200
    habits = response.json()
    assert all(h["category"] == "Fitness" for h in habits)
    # We created at least one Fitness habit above.
    assert len(habits) >= 1


async def test_list_habits_filter_frequency(client: AsyncClient, auth_headers: dict):
    """Filtering by frequency=weekly should only return weekly habits."""
    await client.post(
        "/api/habits",
        json={**HABIT_DATA, "title": "Daily Habit", "frequency": "daily"},
        headers=auth_headers,
    )
    await client.post(
        "/api/habits",
        json={**HABIT_DATA, "title": "Weekly Habit", "frequency": "weekly"},
        headers=auth_headers,
    )

    response = await client.get("/api/habits?frequency=weekly", headers=auth_headers)
    assert response.status_code == 200
    habits = response.json()
    assert all(h["frequency"] == "weekly" for h in habits)
    assert len(habits) >= 1


async def test_list_habits_filter_completed(client: AsyncClient, auth_headers: dict):
    """Filtering by completed=true should only include completed habits."""
    # Create a habit and complete it.
    create_resp = await client.post("/api/habits", json=HABIT_DATA, headers=auth_headers)
    habit_id = create_resp.json()["id"]
    await client.put(
        f"/api/habits/{habit_id}",
        json={"completed": True},
        headers=auth_headers,
    )

    # Create a second habit and leave it incomplete.
    await client.post(
        "/api/habits",
        json={**HABIT_DATA, "title": "Incomplete Habit"},
        headers=auth_headers,
    )

    response = await client.get("/api/habits?completed=true", headers=auth_headers)
    assert response.status_code == 200
    habits = response.json()
    assert all(h["completed"] is True for h in habits)
    assert len(habits) >= 1


async def test_list_habits_excludes_archived_by_default(
    client: AsyncClient, auth_headers: dict
):
    """Archived habits must not appear in the default list response."""
    create_resp = await client.post("/api/habits", json=HABIT_DATA, headers=auth_headers)
    habit_id = create_resp.json()["id"]
    # Archive the habit.
    await client.post(f"/api/habits/{habit_id}/archive", headers=auth_headers)

    response = await client.get("/api/habits", headers=auth_headers)
    assert response.status_code == 200
    ids = [h["id"] for h in response.json()]
    assert habit_id not in ids


async def test_list_habits_includes_archived_with_flag(
    client: AsyncClient, auth_headers: dict
):
    """include_archived=true causes archived habits to appear in the list."""
    create_resp = await client.post("/api/habits", json=HABIT_DATA, headers=auth_headers)
    habit_id = create_resp.json()["id"]
    await client.post(f"/api/habits/{habit_id}/archive", headers=auth_headers)

    response = await client.get(
        "/api/habits?include_archived=true", headers=auth_headers
    )
    assert response.status_code == 200
    ids = [h["id"] for h in response.json()]
    assert habit_id in ids


async def test_list_habits_unauthenticated(client: AsyncClient):
    """Requesting the list without a token returns HTTP 401 or 403."""
    response = await client.get("/api/habits")
    assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Create habit (POST /api/habits)
# ---------------------------------------------------------------------------


async def test_create_habit_success(client: AsyncClient, auth_headers: dict):
    """A valid create request returns HTTP 201 with the expected fields."""
    response = await client.post("/api/habits", json=HABIT_DATA, headers=auth_headers)
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == HABIT_DATA["title"]
    assert body["frequency"] == HABIT_DATA["frequency"]
    assert body["category"] == HABIT_DATA["category"]


async def test_create_habit_sets_defaults(client: AsyncClient, auth_headers: dict):
    """A newly created habit always has streak=0, completed=False, is_archived=False."""
    response = await client.post("/api/habits", json=HABIT_DATA, headers=auth_headers)
    assert response.status_code == 201
    body = response.json()
    assert body["streak"] == 0
    assert body["completed"] is False
    assert body["is_archived"] is False


async def test_create_habit_invalid_category(client: AsyncClient, auth_headers: dict):
    """An invalid category value ('Sports') causes HTTP 422."""
    bad_data = {**HABIT_DATA, "category": "Sports"}
    response = await client.post("/api/habits", json=bad_data, headers=auth_headers)
    assert response.status_code == 422


async def test_create_habit_invalid_frequency(client: AsyncClient, auth_headers: dict):
    """An invalid frequency value ('hourly') causes HTTP 422."""
    bad_data = {**HABIT_DATA, "frequency": "hourly"}
    response = await client.post("/api/habits", json=bad_data, headers=auth_headers)
    assert response.status_code == 422


async def test_create_habit_unauthenticated(client: AsyncClient):
    """Creating a habit without a token returns HTTP 401 or 403."""
    response = await client.post("/api/habits", json=HABIT_DATA)
    assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Get single habit (GET /api/habits/{id})
# ---------------------------------------------------------------------------


async def test_get_habit_success(
    client: AsyncClient, auth_headers: dict, test_habit: dict
):
    """GET /{id} for an owned habit returns HTTP 200 with matching data."""
    habit_id = test_habit["id"]
    response = await client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == habit_id


async def test_get_habit_not_found(client: AsyncClient, auth_headers: dict):
    """GET for a non-existent ID returns HTTP 404."""
    response = await client.get("/api/habits/99999", headers=auth_headers)
    assert response.status_code == 404


async def test_get_habit_other_users_habit(
    client: AsyncClient, auth_headers: dict, second_user_habit: dict
):
    """GET for another user's habit returns HTTP 404 (ownership enforced)."""
    habit_id = second_user_habit["id"]
    response = await client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Update habit (PUT /api/habits/{id})
# ---------------------------------------------------------------------------


async def test_update_habit_title(
    client: AsyncClient, auth_headers: dict, test_habit: dict
):
    """PUT with a new title updates it and returns HTTP 200."""
    habit_id = test_habit["id"]
    response = await client.put(
        f"/api/habits/{habit_id}",
        json={"title": "Evening Walk"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Evening Walk"


async def test_update_habit_complete_increments_streak(
    client: AsyncClient, auth_headers: dict, test_habit: dict
):
    """Setting completed=True increments streak to 1 and sets last_completed."""
    habit_id = test_habit["id"]
    response = await client.put(
        f"/api/habits/{habit_id}",
        json={"completed": True},
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["streak"] == 1
    assert body["last_completed"] is not None


async def test_update_habit_uncomplete_decrements_streak(
    client: AsyncClient, auth_headers: dict, test_habit: dict
):
    """Setting completed=False after True decrements the streak back to 0."""
    habit_id = test_habit["id"]
    # First complete it.
    await client.put(
        f"/api/habits/{habit_id}", json={"completed": True}, headers=auth_headers
    )
    # Then uncomplete it.
    response = await client.put(
        f"/api/habits/{habit_id}", json={"completed": False}, headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["streak"] == 0


async def test_update_habit_streak_not_negative(
    client: AsyncClient, auth_headers: dict, test_habit: dict
):
    """Uncompleting a habit whose streak is already 0 keeps streak at 0."""
    habit_id = test_habit["id"]
    response = await client.put(
        f"/api/habits/{habit_id}", json={"completed": False}, headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["streak"] >= 0


async def test_update_habit_not_found(client: AsyncClient, auth_headers: dict):
    """PUT for a non-existent ID returns HTTP 404."""
    response = await client.put(
        "/api/habits/99999",
        json={"title": "Ghost"},
        headers=auth_headers,
    )
    assert response.status_code == 404


async def test_update_habit_ownership(
    client: AsyncClient, auth_headers: dict, second_user_habit: dict
):
    """PUT for another user's habit returns HTTP 404 (ownership enforced)."""
    habit_id = second_user_habit["id"]
    response = await client.put(
        f"/api/habits/{habit_id}",
        json={"title": "Hijacked Title"},
        headers=auth_headers,
    )
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Archive habit (POST /api/habits/{id}/archive)
# ---------------------------------------------------------------------------


async def test_archive_active_habit(
    client: AsyncClient, auth_headers: dict, test_habit: dict
):
    """Archiving an active habit sets is_archived=True."""
    habit_id = test_habit["id"]
    response = await client.post(
        f"/api/habits/{habit_id}/archive", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["is_archived"] is True


async def test_unarchive_archived_habit(
    client: AsyncClient, auth_headers: dict, test_habit: dict
):
    """Toggling archive twice returns the habit to is_archived=False."""
    habit_id = test_habit["id"]
    # Archive.
    await client.post(f"/api/habits/{habit_id}/archive", headers=auth_headers)
    # Unarchive (toggle again).
    response = await client.post(
        f"/api/habits/{habit_id}/archive", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["is_archived"] is False


async def test_archive_not_found(client: AsyncClient, auth_headers: dict):
    """Archiving a non-existent habit returns HTTP 404."""
    response = await client.post("/api/habits/99999/archive", headers=auth_headers)
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Delete habit (DELETE /api/habits/{id})
# ---------------------------------------------------------------------------


async def test_delete_habit_success(
    client: AsyncClient, auth_headers: dict, test_habit: dict
):
    """Deleting an owned habit returns HTTP 204 and subsequent GET returns 404."""
    habit_id = test_habit["id"]
    del_response = await client.delete(
        f"/api/habits/{habit_id}", headers=auth_headers
    )
    assert del_response.status_code == 204

    get_response = await client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    assert get_response.status_code == 404


async def test_delete_habit_not_found(client: AsyncClient, auth_headers: dict):
    """Deleting a non-existent habit returns HTTP 404."""
    response = await client.delete("/api/habits/99999", headers=auth_headers)
    assert response.status_code == 404


async def test_delete_habit_ownership(
    client: AsyncClient, auth_headers: dict, second_user_habit: dict
):
    """Deleting another user's habit returns HTTP 404 (ownership enforced)."""
    habit_id = second_user_habit["id"]
    response = await client.delete(f"/api/habits/{habit_id}", headers=auth_headers)
    assert response.status_code == 404
