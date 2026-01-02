from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from uuid import uuid4

from database import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    gemini_api_key = Column(String(255), nullable=True)  # 加密存储
    imagen_api_key = Column(String(255), nullable=True)  # 加密存储
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="settings")
