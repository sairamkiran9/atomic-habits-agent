from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.models.user import User
from app.schemas.user import UserResponse
from app.core.security import get_current_user
from app.db.session import get_session

router = APIRouter()
security = HTTPBearer()

@router.get("",
    response_model=UserResponse,
    responses={
        200: {
            "description": "Get current user profile",
            "content": {
                "application/json": {
                    "example": {
                        "email": "user@example.com",
                        "full_name": "John Doe",
                        "id": 1,
                        "created_at": "2024-02-13T12:00:00"
                    }
                }
            }
        },
        401: {
            "description": "Not authenticated",
            "content": {
                "application/json": {
                    "example": {"detail": "Not authenticated"}
                }
            }
        }
    }
)
async def get_current_user_profile(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = Depends(get_session)
) -> Any:
    """
    Get current user profile.
    Requires JWT token in Authorization header.
    """
    user = await get_current_user(credentials.credentials, db)
    return UserResponse.model_validate(user)