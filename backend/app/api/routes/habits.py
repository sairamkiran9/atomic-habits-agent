from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timedelta, timezone
import pytz

from app.db.session import get_session
from app.core.auth import get_current_user
from app.models.habit import Habit
from app.models.user import User
from app.schemas.user import UserResponse
from app.schemas.habit import (
    HabitCreate,
    HabitResponse,
    HabitUpdate,
    HabitCategory,
    HabitFrequency,
    ResetResponse,
    ArchiveResponse
)

router = APIRouter()

@router.post("/reset", response_model=ResetResponse)
async def reset_habits(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Reset habits based on their frequency and last completion time.
    Daily habits reset every day, weekly habits reset every week,
    and monthly habits reset every month.
    """
    now = datetime.now(timezone.utc)
    reset_count = 0
    
    # Get all active habits for the user
    result = await db.execute(
        select(Habit).where(
            Habit.user_id == current_user.id,
            Habit.is_archived == False
        )
    )
    habits = result.scalars().all()
    
    for habit in habits:
        should_reset = False
        last_completed = habit.last_completed or habit.created_at
        
        # Convert to UTC for consistent comparison
        if last_completed.tzinfo is None:
            last_completed = last_completed.replace(tzinfo=timezone.utc)
        
        # Check if habit needs to be reset based on frequency
        if habit.frequency == "daily":
            # Reset if last completion was not today
            should_reset = last_completed.date() < now.date()
            
        elif habit.frequency == "weekly":
            # Reset if last completion was in a different week
            week_start = now - timedelta(days=now.weekday())
            should_reset = last_completed.date() < week_start.date()
            
        elif habit.frequency == "monthly":
            # Reset if last completion was in a different month
            should_reset = (
                last_completed.year != now.year or 
                last_completed.month != now.month
            )
        
        if should_reset and habit.completed:
            habit.completed = False
            reset_count += 1
            
            # Only reset streak if they missed the last period
            time_diff = now - last_completed
            if (habit.frequency == "daily" and time_diff.days > 1) or \
               (habit.frequency == "weekly" and time_diff.days > 7) or \
               (habit.frequency == "monthly" and time_diff.days > 31):
                if habit.streak > 0:
                    habit.streak = 0
    
    if reset_count > 0:
        await db.commit()
    
    return ResetResponse(
        reset_count=reset_count,
        message=f"Reset {reset_count} habits"
    )

@router.get("", response_model=List[HabitResponse])
async def list_habits(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    include_archived: bool = Query(False),
    category: Optional[HabitCategory] = None,
    frequency: Optional[HabitFrequency] = None,
    completed: Optional[bool] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Retrieve habits for the current user with optional filtering.
    """
    # First reset habits if needed
    await reset_habits(current_user, db)
    
    conditions = [Habit.user_id == current_user.id]
    
    if not include_archived:
        conditions.append(Habit.is_archived == False)
    if category:
        conditions.append(Habit.category == category)
    if frequency:
        conditions.append(Habit.frequency == frequency)
    if completed is not None:
        conditions.append(Habit.completed == completed)
    
    query = (
        select(Habit)
        .where(and_(*conditions))
        .order_by(Habit.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(query)
    habits = result.scalars().all()
    
    return habits

@router.post("", response_model=HabitResponse, status_code=201)
async def create_habit(
    habit: HabitCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Create a new habit for the current user.
    """
    db_habit = Habit(
        user_id=current_user.id,
        streak=0,
        completed=False,
        is_archived=False,
        **habit.model_dump()
    )
    
    db.add(db_habit)
    await db.commit()
    await db.refresh(db_habit)
    
    return db_habit

@router.get("/{habit_id}", response_model=HabitResponse)
async def get_habit(
    habit_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Retrieve a specific habit by ID.
    """
    result = await db.execute(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == current_user.id
        )
    )
    habit = result.scalar_one_or_none()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    return habit

@router.put("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: int,
    habit_update: HabitUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Update a specific habit by ID.
    """
    result = await db.execute(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == current_user.id
        )
    )
    habit = result.scalar_one_or_none()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Update habit attributes
    update_data = habit_update.model_dump(exclude_unset=True)
    
    # Handle completion and last_completed
    if 'completed' in update_data:
        if update_data['completed']:
            habit.completed = True
            habit.last_completed = datetime.now(timezone.utc)
            habit.streak += 1
        else:
            habit.completed = False
            # Don't reset last_completed when unchecking to preserve streak calculation
            habit.streak = max(0, habit.streak - 1)
    
    # Update other fields
    for key, value in update_data.items():
        if key != 'completed':  # Skip completed as it's handled above
            setattr(habit, key, value)
    
    await db.commit()
    await db.refresh(habit)
    
    return habit

@router.post("/{habit_id}/archive", response_model=ArchiveResponse)
async def toggle_archive_habit(
    habit_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Toggle the archive status of a habit (archive or unarchive).
    """
    result = await db.execute(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == current_user.id
        )
    )
    habit = result.scalar_one_or_none()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Toggle archive status
    habit.is_archived = not habit.is_archived
    action = "archived" if habit.is_archived else "unarchived"
    
    await db.commit()
    
    return ArchiveResponse(
        id=habit.id,
        title=habit.title,
        is_archived=habit.is_archived,
        message=f"Habit '{habit.title}' has been {action}"
    )

@router.delete("/{habit_id}", status_code=204)
async def delete_habit(
    habit_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Permanently delete a habit by ID.
    """
    result = await db.execute(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == current_user.id
        )
    )
    habit = result.scalar_one_or_none()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    await db.delete(habit)
    await db.commit()
    
    return None