from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Index, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4

from database import Base


class Work(Base):
    __tablename__ = "works"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    image_url = Column(Text, nullable=False)  # MinIO path or Base64
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(ARRAY(String), default=[])
    original_content = Column(Text, nullable=False)  # 原始输入内容
    prompt_used = Column(Text, nullable=False)  # 使用的图像提示词
    persona_id = Column(String, ForeignKey("personas.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="works")
    persona = relationship("Persona", back_populates="works")

    # Indexes
    __table_args__ = (
        Index("ix_works_user_created", "user_id", "created_at"),
        Index("ix_works_persona_id", "persona_id"),
    )
