import httpx
from typing import Optional

from exceptions import ExternalAPIError


class ImagenService:
    """Service for calling Google Imagen API"""
    
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
    MODEL = "imagen-4.0-generate-001"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def generate_image(self, prompt: str, sample_count: int = 1) -> str:
        """Generate image using Imagen API and return Base64 data"""
        url = f"{self.BASE_URL}/{self.MODEL}:predict?key={self.api_key}"
        
        payload = {
            "instances": [{"prompt": prompt}],
            "parameters": {"sampleCount": sample_count}
        }
        
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(url, json=payload)
                
                if response.status_code != 200:
                    error_detail = response.text
                    raise ExternalAPIError("Imagen", f"API返回错误: {response.status_code} - {error_detail}")
                
                data = response.json()
                predictions = data.get("predictions", [])
                
                if not predictions:
                    raise ExternalAPIError("Imagen", "未生成图像")
                
                base64_image = predictions[0].get("bytesBase64Encoded")
                
                if not base64_image:
                    raise ExternalAPIError("Imagen", "图像数据为空")
                
                return f"data:image/png;base64,{base64_image}"
                
        except httpx.RequestError as e:
            raise ExternalAPIError("Imagen", f"请求失败: {str(e)}")
