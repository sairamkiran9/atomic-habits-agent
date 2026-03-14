from pydantic_settings import BaseSettings
from functools import lru_cache
import os
import logging
from typing import ClassVar

logger = logging.getLogger(__name__)

_DEFAULT_SECRET_KEY = "your-secret-key-here"

class Settings(BaseSettings):
    # JWT Settings
    SECRET_KEY: str = _DEFAULT_SECRET_KEY
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
    s = Settings()
    if s.SECRET_KEY == _DEFAULT_SECRET_KEY:
        logger.warning(
            "SECRET_KEY is set to the insecure default value. "
            "Set the SECRET_KEY environment variable before deploying to production."
        )
    return s

settings = get_settings()