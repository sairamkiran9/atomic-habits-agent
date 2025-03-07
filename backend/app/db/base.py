# Import base class for SQLAlchemy models
from app.db.base_class import Base

# Import all models here for SQLAlchemy to detect them
from app.models.user import User
from app.models.habit import Habit
from app.models.habit_log import HabitLog