from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime

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
    HabitFrequency
)

router = APIRouter()

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
    
    Parameters:
    - skip: Number of habits to skip (pagination)
    - limit: Maximum number of habits to return
    - include_archived: Whether to include archived habits
    - category: Filter by habit category
    - frequency: Filter by habit frequency
    - completed: Filter by completion status
    """
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
    
    The habit requires:
    - title: String (1-100 characters)
    - description: String (1-500 characters)
    - frequency: daily/weekly/monthly
    - category: Mindfulness/Learning/Productivity/Health/Fitness/Career/Social/Other
    Optional fields:
    - time_of_day: String
    - reminder_time: String (time format)
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
    
    All fields are optional:
    - title: String (1-100 characters)
    - description: String (1-500 characters)
    - frequency: daily/weekly/monthly
    - category: Mindfulness/Learning/Productivity/Health/Fitness/Career/Social/Other
    - time_of_day: String
    - reminder_time: String
    - completed: Boolean
    - is_archived: Boolean
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
    
    # If completion status changes, handle streak
    if 'completed' in update_data and update_data['completed'] != habit.completed:
        if update_data['completed']:
            habit.streak += 1
        else:
            habit.streak = max(0, habit.streak - 1)
    
    for key, value in update_data.items():
        setattr(habit, key, value)
    
    await db.commit()
    await db.refresh(habit)
    
    return habit

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