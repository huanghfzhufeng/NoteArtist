from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import time

from database import get_db
from models import User, Settings
from schemas import LoginRequest, LoginResponse, RegisterRequest, UserResponse
from utils.security import verify_password, get_password_hash, create_access_token
from deps import get_current_user
from services.cache import get_cache_service
from config import settings as app_settings


router = APIRouter()


async def check_rate_limit(request: Request, action: str = "auth"):
    """检查速率限制"""
    client_ip = request.client.host if request.client else "unknown"
    cache = get_cache_service()
    
    if cache:
        key = f"rate_limit:{action}:{client_ip}"
        try:
            count = await cache.get(key)
            if count and int(count) >= app_settings.RATE_LIMIT_REQUESTS:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"请求过于频繁，请 {app_settings.RATE_LIMIT_WINDOW_SECONDS} 秒后重试"
                )
            
            # 增加计数
            if count:
                await cache.incr(key)
            else:
                await cache.set(key, "1", expire=app_settings.RATE_LIMIT_WINDOW_SECONDS)
        except HTTPException:
            raise
        except Exception:
            pass  # 缓存失败不阻止请求


async def record_failed_attempt(request: Request, username: str):
    """记录失败的登录尝试"""
    client_ip = request.client.host if request.client else "unknown"
    cache = get_cache_service()
    
    if cache:
        key = f"failed_login:{username}:{client_ip}"
        try:
            count = await cache.get(key)
            if count:
                await cache.incr(key)
                if int(count) >= 5:
                    # 锁定 15 分钟
                    await cache.set(key, str(int(count) + 1), expire=900)
            else:
                await cache.set(key, "1", expire=300)
        except Exception:
            pass


async def check_account_locked(request: Request, username: str) -> bool:
    """检查账户是否被锁定"""
    client_ip = request.client.host if request.client else "unknown"
    cache = get_cache_service()
    
    if cache:
        key = f"failed_login:{username}:{client_ip}"
        try:
            count = await cache.get(key)
            if count and int(count) >= 5:
                return True
        except Exception:
            pass
    return False


@router.post("/register", response_model=LoginResponse)
async def register(
    request_data: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    # 速率限制
    await check_rate_limit(request, "register")
    
    # Check if username exists
    result = await db.execute(select(User).where(User.username == request_data.username))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 验证密码强度
    if len(request_data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码长度至少 6 位"
        )
    
    # Create user
    hashed_password = get_password_hash(request_data.password)
    user = User(username=request_data.username, password=hashed_password)
    db.add(user)
    await db.flush()
    
    # Create default settings
    settings = Settings(user_id=user.id)
    db.add(settings)
    
    await db.commit()
    await db.refresh(user)
    
    # Generate token
    token = create_access_token(data={"sub": user.id})
    
    return LoginResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            username=user.username,
            createdAt=user.created_at
        )
    )


@router.post("/login", response_model=LoginResponse)
async def login(
    request_data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Login user and return JWT token"""
    # 速率限制
    await check_rate_limit(request, "login")
    
    # 检查账户锁定
    if await check_account_locked(request, request_data.username):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="登录失败次数过多，账户已临时锁定，请 15 分钟后重试"
        )
    
    # Find user
    result = await db.execute(select(User).where(User.username == request_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(request_data.password, user.password):
        # 记录失败尝试
        await record_failed_attempt(request, request_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )
    
    # Generate token
    token = create_access_token(data={"sub": user.id})
    
    return LoginResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            username=user.username,
            createdAt=user.created_at
        )
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (client should discard token)"""
    # TODO: 实现 token 黑名单机制
    return {"success": True}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        createdAt=current_user.created_at
    )
