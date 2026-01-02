from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

from .persona import PersonaResponse


class WorkCreate(BaseModel):
    imageBase64: str
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    tags: List[str] = Field(default=[])
    personaId: Optional[str] = None
    originalContent: str = Field(..., min_length=1)
    promptUsed: str = Field(..., min_length=1)


class WorkResponse(BaseModel):
    id: str
    imageUrl: str
    title: str
    content: str
    tags: List[str]
    originalContent: str
    promptUsed: str
    personaId: Optional[str] = None
    persona: Optional[PersonaResponse] = None
    userId: str
    createdAt: datetime

    class Config:
        from_attributes = True


class WorksResponse(BaseModel):
    works: List[WorkResponse]
    total: int
