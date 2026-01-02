from pydantic import BaseModel
from typing import Optional


class SettingsUpdate(BaseModel):
    geminiApiKey: Optional[str] = None
    imagenApiKey: Optional[str] = None


class SettingsResponse(BaseModel):
    id: int
    geminiApiKey: Optional[str] = None  # Will be masked
    imagenApiKey: Optional[str] = None  # Will be masked
    userId: str
    systemConfigured: bool = False  # True if API is configured in .env

    class Config:
        from_attributes = True
