from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.db.session import get_session
from app.core.auth import get_current_user
from app.models.habit import Habit
from app.models.user import User
from app.schemas.user import UserResponse
from app.schemas.habit import (
    HabitCreate,
    HabitResponse,
    HabitUpdate
)

router = APIRouter()

@router.get("", response_model=List[HabitResponse])
async def list_habits(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    include_archived: bool = Query(False),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Retrieve all habits for the current user.
    
    Parameters:
    - skip: Number of habits to skip (pagination)
    - limit: Maximum number of habits to return
    - include_archived: Whether to include archived habits
    """
    query = select(Habit).where(Habit.user_id == current_user.id)
    
    if not include_archived:
        query = query.where(Habit.is_archived == False)
    
    query = query.offset(skip).limit(limit)
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
    for key, value in habit_update.model_dump(exclude_unset=True).items():
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
    Delete a specific habit by ID.
    """
    # Delete the habit directly
    result = await db.execute(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == current_user.id
        )
    )
    habit = result.scalar_one_or_none()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Hard delete
    await db.delete(habit)
    await db.commit()
    
    return None