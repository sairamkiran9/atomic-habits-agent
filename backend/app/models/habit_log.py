from datetime import date, time
from sqlalchemy import Column, Integer, ForeignKey, Date, Time, Boolean, String, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class HabitLog(Base):
    """
    HabitLog Model for tracking daily habit completion status and details.
    
    Attributes:
        id (int): Primary key
        habit_id (int): Foreign key to the associated Habit
        date (date): Date of the habit log
        completed (bool): Whether the habit was completed
        completion_time (time, optional): Time when the habit was completed
        notes (str, optional): Any additional notes for the day's habit
        habit (Habit): Relationship to the parent Habit
    """
    __tablename__ = "habit_logs"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)
    completion_time = Column(Time, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationship with Habit
    habit = relationship("Habit", back_populates="logs")

    class Config:
        orm_mode = True