from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class PromptCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)
    category: str = Field(default="自定义", max_length=50)


class PromptUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, max_length=50)


class PromptResponse(BaseModel):
    id: str
    name: str
    content: str
    category: str
    isPreset: bool
    userId: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class PromptsResponse(BaseModel):
    presets: List[PromptResponse] = []
    custom: List[PromptResponse] = []
