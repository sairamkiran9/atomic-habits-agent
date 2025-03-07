from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum

class HabitFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class HabitCategory(str, Enum):
    MINDFULNESS = "Mindfulness"
    LEARNING = "Learning"
    PRODUCTIVITY = "Productivity"
    HEALTH = "Health"
    FITNESS = "Fitness"
    CAREER = "Career"
    SOCIAL = "Social"
    OTHER = "Other"

class HabitBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    frequency: HabitFrequency
    category: HabitCategory
    time_of_day: Optional[str] = None
    reminder_time: Optional[str] = None

class HabitCreate(HabitBase):
    pass

class HabitUpdate(HabitBase):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    frequency: Optional[HabitFrequency] = None
    category: Optional[HabitCategory] = None
    time_of_day: Optional[str] = None
    reminder_time: Optional[str] = None
    completed: Optional[bool] = None
    is_archived: Optional[bool] = None
    last_completed: Optional[datetime] = None

class HabitInDB(HabitBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    streak: int = 0
    completed: bool = False
    is_archived: bool = False
    last_completed: Optional[datetime] = None

    class Config:
        from_attributes = True

class HabitResponse(HabitInDB):
    pass

class ResetResponse(BaseModel):
    reset_count: int
    message: str