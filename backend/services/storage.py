from minio import Minio
from minio.error import S3Error
import io
import base64
import imghdr
from datetime import timedelta
from typing import Optional

from config import settings
from exceptions import StorageError


class StorageService:
    def __init__(self, endpoint: str, access_key: str, secret_key: str, bucket: str, secure: bool = False):
        self.client = Minio(
            endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure
        )
        self.bucket = bucket
        self.max_size = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024  # 转换为字节
        self._ensure_bucket()

    def _ensure_bucket(self):
        """Ensure bucket exists (私有存储，不设置公共读策略)"""
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
                # 不设置公共读策略，所有访问通过预签名 URL
        except S3Error as e:
            print(f"Warning: Could not ensure bucket: {e}")

    def _validate_image(self, image_data: bytes) -> str:
        """验证图片大小和类型，返回 content_type"""
        # 检查大小
        if len(image_data) > self.max_size:
            raise StorageError(f"图片大小超过限制 ({settings.MAX_IMAGE_SIZE_MB}MB)")
        
        # 检查类型
        image_type = imghdr.what(None, h=image_data)
        if image_type not in ['png', 'jpeg', 'webp']:
            raise StorageError("不支持的图片格式，仅支持 PNG、JPEG、WebP")
        
        content_type_map = {
            'png': 'image/png',
            'jpeg': 'image/jpeg',
            'webp': 'image/webp'
        }
        return content_type_map.get(image_type, 'image/png')

    def upload_image(self, user_id: str, work_id: str, base64_data: str) -> str:
        """Upload image and return URL path"""
        try:
            # Handle data URL format
            if ',' in base64_data:
                base64_data = base64_data.split(',')[1]
            
            # Decode Base64
            try:
                image_data = base64.b64decode(base64_data)
            except Exception:
                raise StorageError("无效的 Base64 图片数据")
            
            # 验证图片
            content_type = self._validate_image(image_data)
            
            # 根据类型确定扩展名
            ext_map = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp'}
            ext = ext_map.get(content_type, 'png')
            
            # Upload to MinIO
            object_name = f"works/{user_id}/{work_id}.{ext}"
            self.client.put_object(
                self.bucket,
                object_name,
                io.BytesIO(image_data),
                len(image_data),
                content_type=content_type
            )
            
            return f"/{self.bucket}/{object_name}"
        except StorageError:
            raise
        except Exception as e:
            raise StorageError(f"上传图片失败: {str(e)}")

    def get_presigned_url(self, object_name: str, expires: int = 3600) -> str:
        """Get presigned URL for object (私有访问)"""
        try:
            # Remove leading slash and bucket name if present
            if object_name.startswith('/'):
                object_name = object_name[1:]
            if object_name.startswith(f"{self.bucket}/"):
                object_name = object_name[len(self.bucket) + 1:]
            
            return self.client.presigned_get_object(
                self.bucket,
                object_name,
                expires=timedelta(seconds=expires)
            )
        except Exception as e:
            raise StorageError(f"获取预签名URL失败: {str(e)}")

    def delete_image(self, object_name: str) -> bool:
        """Delete image from storage"""
        try:
            # Remove leading slash and bucket name if present
            if object_name.startswith('/'):
                object_name = object_name[1:]
            if object_name.startswith(f"{self.bucket}/"):
                object_name = object_name[len(self.bucket) + 1:]
            
            self.client.remove_object(self.bucket, object_name)
            return True
        except Exception as e:
            print(f"Warning: Could not delete image: {e}")
            return False

    def get_image_url(self, object_name: str) -> str:
        """Get presigned URL for image (私有访问，使用预签名 URL)"""
        return self.get_presigned_url(object_name)


# Singleton instance
_storage_service: Optional[StorageService] = None


def get_storage_service() -> StorageService:
    """Get or create storage service singleton"""
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            bucket=settings.MINIO_BUCKET,
            secure=settings.MINIO_SECURE
        )
    return _storage_service
