from pydantic import BaseModel, Field
from typing import Optional, List


class GenerateRequest(BaseModel):
    content: str = Field(..., min_length=1)
    systemPrompt: str = Field(..., min_length=1)
    personaId: Optional[str] = None


class GenerateResponse(BaseModel):
    imageBase64: str
    title: str
    content: str
    tags: List[str]
    debugPrompt: str


class SaveWorkRequest(BaseModel):
    imageBase64: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    tags: List[str] = Field(default=[])
    originalContent: str = Field(..., min_length=1)
    promptUsed: str = Field(..., min_length=1)
    personaId: Optional[str] = None


class SaveWorkResponse(BaseModel):
    id: str
    imageUrl: str
    message: str
