from openai import OpenAI
import base64
import re
import logging

from config import settings
from exceptions import ExternalAPIError

logger = logging.getLogger(__name__)


class ImagenService:
    """Service for calling Image Generation via Antigravity OpenAI-compatible proxy"""

    def __init__(self):
        self.client = OpenAI(
            base_url=f"{settings.OPENAI_API_BASE}/v1",
            api_key=settings.OPENAI_API_KEY
        )
        self.model = settings.IMAGE_MODEL
        self.image_size = settings.IMAGE_SIZE
    
    async def generate_image(self, prompt: str, sample_count: int = 1) -> str:
        """Generate image using Imagen API via Antigravity OpenAI-compatible proxy"""

        try:
            logger.info(f"Generating image with model: {self.model}, size: {self.image_size}")
            logger.info(f"Using API base: {settings.OPENAI_API_BASE}")
            logger.info(f"Image prompt: {prompt[:100]}...")

            # Try using OpenAI images API format
            try:
                response = self.client.images.generate(
                    model=self.model,
                    prompt=prompt,
                    size=self.image_size,
                    n=sample_count
                )

                # Check if response has data
                if response.data and len(response.data) > 0:
                    image_data = response.data[0]

                    # Check for URL
                    if hasattr(image_data, 'url') and image_data.url:
                        logger.info(f"Received image URL: {image_data.url[:50]}...")
                        return image_data.url

                    # Check for base64
                    if hasattr(image_data, 'b64_json') and image_data.b64_json:
                        logger.info("Received base64 image data")
                        return f"data:image/png;base64,{image_data.b64_json}"

                raise ExternalAPIError("Imagen", "API 返回了空的图像数据")

            except Exception as api_error:
                logger.warning(f"Images API failed: {api_error}, trying chat completions API")

                # Fallback to chat completions API
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    timeout=60.0  # 增加超时时间到 60 秒
                )

                content = response.choices[0].message.content
            logger.info(f"Response content type: {type(content)}, length: {len(content) if content else 0}")
            
            if not content:
                raise ExternalAPIError("Imagen", "未生成图像，响应为空")
            
            content = content.strip()

            # Check if it's wrapped in markdown image syntax: ![image](data:image/...)
            markdown_match = re.match(r'!\[.*?\]\((data:image/[^)]+)\)', content)
            if markdown_match:
                logger.info("Detected markdown-wrapped image, extracting data URL")
                return markdown_match.group(1)

            # Check if it's already a data URL
            if content.startswith("data:image"):
                return content

            # Check if it's a URL
            if content.startswith("http"):
                return content

            # Check if it looks like base64 (长字符串，只包含 base64 字符)
            if len(content) > 100 and re.match(r'^[A-Za-z0-9+/=\s]+$', content.replace('\n', '')):
                clean_b64 = content.replace('\n', '').replace(' ', '')
                return f"data:image/png;base64,{clean_b64}"

            # If it's something else, log and raise error
            logger.error(f"Unexpected response format (first 200 chars): {content[:200]}")
            raise ExternalAPIError("Imagen", f"无法解析图像响应格式: {content[:100]}...")
                
        except ExternalAPIError:
            raise
        except Exception as e:
            logger.exception(f"Image generation failed: {e}")
            raise ExternalAPIError("Imagen", f"请求失败: {str(e)}")
