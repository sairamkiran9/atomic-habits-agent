from app.models.base import Base
from app.models.user import User  # This import is needed to register models

# Import all models here
__all__ = ['Base', 'User']