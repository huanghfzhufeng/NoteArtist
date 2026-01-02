from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class PersonaCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    identity: str = Field(..., min_length=1)
    targetAudience: str = Field(..., min_length=1)
    languageStyle: str = Field(..., min_length=1)
    coreValues: str = Field(..., min_length=1)
    commonTags: List[str] = Field(default=[])


class PersonaUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    identity: Optional[str] = None
    targetAudience: Optional[str] = None
    languageStyle: Optional[str] = None
    coreValues: Optional[str] = None
    commonTags: Optional[List[str]] = None
    isActive: Optional[bool] = None


class PersonaResponse(BaseModel):
    id: str
    name: str
    identity: str
    targetAudience: str
    languageStyle: str
    coreValues: str
    commonTags: List[str]
    isActive: bool
    userId: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class PersonasResponse(BaseModel):
    personas: List[PersonaResponse]
