from fastapi import HTTPException


class NoteArtistException(HTTPException):
    """Base exception class"""
    pass


class AuthenticationError(NoteArtistException):
    """Authentication error"""
    def __init__(self, detail: str = "认证失败"):
        super().__init__(status_code=401, detail=detail)


class AuthorizationError(NoteArtistException):
    """Authorization error"""
    def __init__(self, detail: str = "无权限访问"):
        super().__init__(status_code=403, detail=detail)


class NotFoundError(NoteArtistException):
    """Resource not found"""
    def __init__(self, resource: str):
        super().__init__(status_code=404, detail=f"{resource}不存在")


class ValidationError(NoteArtistException):
    """Data validation error"""
    def __init__(self, detail: str):
        super().__init__(status_code=422, detail=detail)


class APIKeyNotConfiguredError(NoteArtistException):
    """API Key not configured"""
    def __init__(self):
        super().__init__(status_code=400, detail="请先配置 API Key")


class ExternalAPIError(NoteArtistException):
    """External API call error"""
    def __init__(self, service: str, detail: str):
        super().__init__(status_code=502, detail=f"{service} 服务错误: {detail}")


class StorageError(NoteArtistException):
    """Storage service error"""
    def __init__(self, detail: str):
        super().__init__(status_code=500, detail=f"存储服务错误: {detail}")
