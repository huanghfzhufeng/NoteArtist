from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import os
import secrets


class Settings(BaseSettings):
    # Database - 必须通过环境变量配置
    DATABASE_URL: str = ""
    
    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    # MinIO - 必须通过环境变量配置
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = ""
    MINIO_SECRET_KEY: str = ""
    MINIO_BUCKET: str = "noteartist-images"
    MINIO_SECURE: bool = False
    
    # JWT - 生产环境必须通过环境变量配置
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    
    # CORS - 生产环境应限制具体域名
    CORS_ORIGINS: str = "http://localhost:3000"
    
    # 上传限制
    MAX_IMAGE_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: List[str] = ["image/png", "image/jpeg", "image/webp"]
    
    # 速率限制
    RATE_LIMIT_REQUESTS: int = 10
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    
    @field_validator('DATABASE_URL')
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v:
            # 开发环境默认值
            return "postgresql+asyncpg://noteartist:noteartist123@db:5432/noteartist"
        return v
    
    @field_validator('JWT_SECRET')
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        if not v:
            # 开发环境生成随机密钥（每次重启会变化）
            print("WARNING: JWT_SECRET not set, using random secret. Set JWT_SECRET env var for production!")
            return secrets.token_urlsafe(32)
        if len(v) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters")
        return v
    
    @field_validator('MINIO_ACCESS_KEY')
    @classmethod
    def validate_minio_access_key(cls, v: str) -> str:
        if not v:
            return "minioadmin"  # 开发环境默认
        return v
    
    @field_validator('MINIO_SECRET_KEY')
    @classmethod
    def validate_minio_secret_key(cls, v: str) -> str:
        if not v:
            return "minioadmin123"  # 开发环境默认
        return v
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
