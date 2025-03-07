from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

class Habit(Base):
    """
    Habit Model
    
    Represents a habit that a user wants to track. Each habit has properties that define
    its frequency, category, and completion status. Includes last_completed timestamp
    for managing habit resets and streaks.
    """
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    frequency = Column(String, nullable=False)  # daily, weekly, monthly
    time_of_day = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    streak = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    category = Column(String, nullable=False)
    reminder_time = Column(String)
    is_archived = Column(Boolean, default=False)
    last_completed = Column(DateTime(timezone=True), nullable=True)
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")