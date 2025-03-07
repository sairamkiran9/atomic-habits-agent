import asyncio
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta, time
from passlib.context import CryptContext
import random

# Add the backend directory to Python path
backend_dir = str(Path(__file__).parent.parent.parent)
sys.path.append(backend_dir)

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.user import User
from app.models.habit import Habit
from app.models.habit_log import HabitLog

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Sample data for users and their habits
USERS = [
    {
        "email": "vinayak@example.com",
        "full_name": "Vinayak Shankar",
        "password": "password123",  # In real app, use strong passwords
        "habits": [
            {
                "title": "Morning Exercise",
                "description": "30 minutes of strength training and cardio",
                "frequency": "daily",
                "category": "Fitness",  # Changed from Health to Fitness
                "time_of_day": "06:00",
                "reminder_time": "05:45",
                "streak": 12,
                "completion_rate": 0.85
            },
            {
                "title": "Meditation",
                "description": "15 minutes mindfulness meditation",
                "frequency": "daily",
                "category": "Mindfulness",  # Changed from Mental Health to Mindfulness
                "time_of_day": "07:00",
                "reminder_time": "06:55",
                "streak": 8,
                "completion_rate": 0.75
            },
            {
                "title": "Code Review",
                "description": "Review and refactor code for personal projects",
                "frequency": "daily",
                "category": "Career",  # Changed from Professional to Career
                "time_of_day": "10:00",
                "reminder_time": "09:55",
                "streak": 5,
                "completion_rate": 0.7
            },
            {
                "title": "Reading",
                "description": "Read technical books or articles",
                "frequency": "daily",
                "category": "Learning",  # This was already correct
                "time_of_day": "21:00",
                "reminder_time": "20:55",
                "streak": 15,
                "completion_rate": 0.8
            }
        ]
    }
]

async def create_habit_logs(session: AsyncSession, habit: Habit, completion_rate: float, start_date: datetime):
    """Create habit logs for the past 30 days with specified completion rate"""
    current_date = start_date
    end_date = datetime.utcnow()
    
    while current_date <= end_date:
        # For weekly habits, only create logs for the appropriate day of week
        if habit.frequency == "weekly" and current_date.weekday() != 0:  # Monday as default
            current_date += timedelta(days=1)
            continue
            
        # Determine if habit was completed based on completion rate
        completed = random.random() < completion_rate
        
        # Create completion time during the day if completed
        completion_time = None
        if completed:
            hour, minute = map(int, habit.time_of_day.split(':'))
            # Random completion within 30 minutes of scheduled time
            random_minutes = random.randint(-30, 30)
            completion_time = (datetime.combine(current_date.date(), time(hour, minute)) + 
                             timedelta(minutes=random_minutes)).time()
        
        # Create log entry
        log = HabitLog(
            habit_id=habit.id,
            date=current_date.date(),
            completed=completed,
            completion_time=completion_time,
            notes=(
                f"Completed at {completion_time.strftime('%I:%M %p')} ✅" if completed 
                else "Missed today's habit ❌"
            )
        )
        session.add(log)
        
        # Update streak if completed
        if completed and current_date.date() == datetime.utcnow().date() - timedelta(days=1):
            habit.streak = habit.streak + 1
            habit.last_completed = datetime.combine(current_date.date(), completion_time)
        
        current_date += timedelta(days=1)

async def populate_db():
    """Populate database with sample users, habits, and habit logs"""
    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    # Create async session factory
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    try:
        async with async_session() as session:
            for user_data in USERS:
                # Check if user already exists
                existing_user = await session.get(User, 1)  # Assuming Vinayak's ID is 1
                if existing_user:
                    print(f"User {user_data['email']} already exists, skipping...")
                    continue

                # Create user
                hashed_password = pwd_context.hash(user_data["password"])
                user = User(
                    email=user_data["email"],
                    full_name=user_data["full_name"],
                    hashed_password=hashed_password,
                )
                session.add(user)
                await session.flush()

                # Create habits and their logs for user
                for habit_data in user_data["habits"]:
                    habit = Habit(
                        user_id=user.id,
                        title=habit_data["title"],
                        description=habit_data["description"],
                        frequency=habit_data["frequency"],
                        category=habit_data["category"],
                        time_of_day=habit_data["time_of_day"],
                        reminder_time=habit_data["reminder_time"],
                        streak=0,  # Will be updated through logs
                        completed=False,
                        is_archived=False,
                        created_at=datetime.utcnow() - timedelta(days=30)
                    )
                    session.add(habit)
                    await session.flush()
                    
                    # Create habit logs for the past 30 days
                    start_date = datetime.utcnow() - timedelta(days=30)
                    await create_habit_logs(
                        session,
                        habit,
                        habit_data["completion_rate"],
                        start_date
                    )

            await session.commit()
            print("Sample data populated successfully!")

    except Exception as e:
        print(f"Error populating database: {e}")
        raise
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(populate_db())