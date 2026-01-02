from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Settings, User
from schemas.settings import SettingsUpdate, SettingsResponse
from deps import get_current_user

router = APIRouter()


def mask_api_key(key: str | None) -> str | None:
    """Mask API key for display, showing only last 4 characters"""
    if not key:
        return None
    if len(key) <= 4:
        return "****"
    return "*" * (len(key) - 4) + key[-4:]


@router.get("", response_model=SettingsResponse)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's API settings with masked keys"""
    result = await db.execute(
        select(Settings).where(Settings.user_id == current_user.id)
    )
    settings = result.scalar_one_or_none()
    
    # Create settings if not exists
    if not settings:
        settings = Settings(user_id=current_user.id)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return SettingsResponse(
        id=settings.id,
        geminiApiKey=mask_api_key(settings.gemini_api_key),
        imagenApiKey=mask_api_key(settings.imagen_api_key),
        userId=settings.user_id
    )


@router.put("", response_model=SettingsResponse)
async def update_settings(
    settings_update: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's API settings"""
    result = await db.execute(
        select(Settings).where(Settings.user_id == current_user.id)
    )
    settings = result.scalar_one_or_none()
    
    # Create settings if not exists
    if not settings:
        settings = Settings(user_id=current_user.id)
        db.add(settings)
    
    # Update only provided fields (skip masked values)
    if settings_update.geminiApiKey is not None:
        # Don't update if it's a masked value
        if not settings_update.geminiApiKey.startswith("*"):
            settings.gemini_api_key = settings_update.geminiApiKey
    
    if settings_update.imagenApiKey is not None:
        # Don't update if it's a masked value
        if not settings_update.imagenApiKey.startswith("*"):
            settings.imagen_api_key = settings_update.imagenApiKey
    
    await db.commit()
    await db.refresh(settings)
    
    return SettingsResponse(
        id=settings.id,
        geminiApiKey=mask_api_key(settings.gemini_api_key),
        imagenApiKey=mask_api_key(settings.imagen_api_key),
        userId=settings.user_id
    )
