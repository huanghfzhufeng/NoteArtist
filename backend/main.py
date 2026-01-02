from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from config import settings
from exceptions import NoteArtistException
from database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="NoteArtist API",
    description="AI Content Creation Studio API",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False
)

# CORS middleware - 限制具体方法和头
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# Global exception handler
@app.exception_handler(NoteArtistException)
async def noteartist_exception_handler(request: Request, exc: NoteArtistException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # 生产环境不暴露内部错误细节
    import logging
    logging.error(f"Internal error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "服务器内部错误，请稍后重试"}
    )


# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "NoteArtist API"}


# Import and include routers
from routers import auth, prompts, personas, works, settings as settings_router, generate

app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(prompts.router, prefix="/api/prompts", tags=["提示词"])
app.include_router(personas.router, prefix="/api/personas", tags=["人设"])
app.include_router(works.router, prefix="/api/works", tags=["作品"])
app.include_router(settings_router.router, prefix="/api/settings", tags=["设置"])
app.include_router(generate.router, prefix="/api/generate", tags=["生成"])
