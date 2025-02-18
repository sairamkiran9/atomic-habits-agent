from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from typing import ClassVar

class Settings(BaseSettings):
    # JWT Settings
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Class variable (not a field)
    PROJECT_ROOT: ClassVar[str] = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
    
    # Database settings
    DATABASE_URL: str = f"sqlite+aiosqlite:///{PROJECT_ROOT}/atomic_habits.db"

    # Optional: Add this if you want to use PYTHONPATH from .env
    # PYTHONPATH: str | None = None

    class Config:
        env_file = ".env"
        # Allow extra fields in the environment
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()