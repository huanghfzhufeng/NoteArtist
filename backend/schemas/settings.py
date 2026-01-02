from pydantic import BaseModel
from typing import Optional


class SettingsUpdate(BaseModel):
    geminiApiKey: Optional[str] = None
    imagenApiKey: Optional[str] = None


class SettingsResponse(BaseModel):
    id: str
    geminiApiKey: Optional[str] = None  # Will be masked
    imagenApiKey: Optional[str] = None  # Will be masked
    userId: str

    class Config:
        from_attributes = True
