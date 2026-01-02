import redis.asyncio as redis
from typing import Optional, Any
import json

from config import settings


# Cache Key naming conventions
CACHE_KEYS = {
    "user_session": "session:{user_id}",           # TTL: 24h
    "user_prompts": "prompts:{user_id}",           # TTL: 1h
    "user_personas": "personas:{user_id}",         # TTL: 1h
    "preset_prompts": "presets:all",               # TTL: 24h
    "api_rate_limit": "rate:{user_id}:{endpoint}", # TTL: 1min
}

# TTL values in seconds
TTL = {
    "session": 86400,      # 24 hours
    "prompts": 3600,       # 1 hour
    "personas": 3600,      # 1 hour
    "presets": 86400,      # 24 hours
    "rate_limit": 60,      # 1 minute
    "default": 3600,       # 1 hour
}


class CacheService:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url, decode_responses=True)

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            value = await self.redis.get(key)
            if value is None:
                return None
            # 尝试 JSON 解析，如果失败返回原始字符串
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
        except Exception:
            return None

    async def set(self, key: str, value: Any, expire: int = None, ttl: int = TTL["default"]) -> bool:
        """Set value in cache with TTL"""
        try:
            ttl_value = expire if expire is not None else ttl
            if isinstance(value, str):
                await self.redis.setex(key, ttl_value, value)
            else:
                await self.redis.setex(key, ttl_value, json.dumps(value, default=str))
            return True
        except Exception:
            return False

    async def incr(self, key: str) -> int:
        """Increment value"""
        try:
            return await self.redis.incr(key)
        except Exception:
            return 0

    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            await self.redis.delete(key)
            return True
        except Exception:
            return False

    async def invalidate_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        try:
            keys = await self.redis.keys(pattern)
            if keys:
                return await self.redis.delete(*keys)
            return 0
        except Exception:
            return 0

    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        try:
            return await self.redis.exists(key) > 0
        except Exception:
            return False

    async def close(self):
        """Close Redis connection"""
        await self.redis.close()


# Singleton instance
_cache_service: Optional[CacheService] = None


def get_cache_service() -> CacheService:
    """Get or create cache service singleton"""
    global _cache_service
    if _cache_service is None:
        _cache_service = CacheService(settings.REDIS_URL)
    return _cache_service
