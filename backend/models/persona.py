from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Index, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4

from database import Base


class Persona(Base):
    __tablename__ = "personas"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(100), nullable=False)
    identity = Column(Text, nullable=False)  # 身份定位
    target_audience = Column(Text, nullable=False)  # 目标受众
    language_style = Column(Text, nullable=False)  # 语言风格
    core_values = Column(Text, nullable=False)  # 核心价值观
    common_tags = Column(ARRAY(String), default=[])  # 常用话题标签
    is_active = Column(Boolean, default=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="personas")
    works = relationship("Work", back_populates="persona")

    # Indexes
    __table_args__ = (
        Index("ix_personas_user_id", "user_id"),
    )
