import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = str(Path(__file__).parent.parent.parent)
sys.path.append(backend_dir)

from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.db.base_class import Base

# Import all models to ensure they are registered with SQLAlchemy
from app.db.base import Base  # noqa: F401
from app.models.user import User  # Make sure models are imported
from app.models.habit import Habit

async def init_db():
    # Create database directory if it doesn't exist
    db_path = settings.DATABASE_URL.replace('sqlite+aiosqlite:///', '')
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir)
    
    # Create async engine
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=True
    )
    
    async with engine.begin() as conn:
        # Drop all tables if they exist
        await conn.run_sync(Base.metadata.drop_all)
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()

    print("Database tables created successfully!")

if __name__ == "__main__":
    try:
        asyncio.run(init_db())
    except Exception as e:
        print(f"Error initializing database: {e}")