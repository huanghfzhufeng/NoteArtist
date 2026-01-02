from openai import OpenAI
import json
from typing import Dict, Any, Optional
import logging

from config import settings
from exceptions import ExternalAPIError

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for calling Gemini API via Antigravity OpenAI-compatible proxy"""

    def __init__(self):
        self.client = OpenAI(
            base_url=f"{settings.OPENAI_API_BASE}/v1",
            api_key=settings.OPENAI_API_KEY
        )
        self.model = settings.TEXT_MODEL
    
    def generate_content(
        self,
        prompt: str,
        system_instruction: str = "",
        json_mode: bool = False
    ) -> Any:
        """Generate content using Gemini API via Antigravity OpenAI-compatible proxy"""

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        try:
            logger.info(f"Generating content with model: {self.model}")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages
            )

            text = response.choices[0].message.content

            if not text:
                raise ExternalAPIError("Gemini", "未生成内容")

            if json_mode:
                # Clean up JSON response
                cleaned_text = text.replace("```json\n", "").replace("\n```", "").replace("```json", "").replace("```", "").strip()
                return json.loads(cleaned_text)

            return text

        except json.JSONDecodeError as e:
            logger.exception(f"JSON decode error: {e}")
            raise ExternalAPIError("Gemini", f"JSON解析失败: {str(e)}")
        except Exception as e:
            logger.exception(f"Content generation failed: {e}")
            raise ExternalAPIError("Gemini", f"请求失败: {str(e)}")
    
    async def analyze_content_and_generate_copy(
        self,
        content: str,
        system_prompt: str,
        persona: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze content and generate image prompt + copy"""
        
        # Build persona info string
        persona_info = ""
        if persona:
            persona_info = f"""
【账号人设信息】:
- 身份定位: {persona.get('identity', '')}
- 目标受众: {persona.get('targetAudience', '')}
- 语言风格: {persona.get('languageStyle', '')}
- 核心价值观: {persona.get('coreValues', '')}
- 常用话题标签: {', '.join(persona.get('commonTags', []))}
"""
        
        analysis_system_prompt = f"""
你是一个 AI 视觉提示词工程师和文案创作者。
用户的【系统提示词】定义了一种特定的视觉风格和任务角色。
用户的【内容】是需要被可视化的信息。
{persona_info}
你的任务是：
1. 扮演【系统提示词】中的角色，深入理解【内容】。
2. 生成一个详细的英文 Image Prompt（用于传给 Imagen 生成图片），必须严格描述【系统提示词】中要求的视觉风格和【内容】的核心逻辑图示。
3. 基于【内容】{'和【账号人设信息】' if persona else ''}写一个小红书风格的文案。
   {'- 标题要吸引【目标受众】' if persona else ''}
   {'- 正文要体现【核心价值观】，使用【语言风格】' if persona else ''}
   {'- 标签要包含【常用话题标签】中的相关标签' if persona else ''}

请返回纯 JSON 格式：
{{
  "image_prompt": "详细的英文绘画提示词...",
  "xhs_title": "小红书标题",
  "xhs_content": "小红书正文",
  "xhs_tags": ["标签1", "标签2"]
}}
"""
        
        analysis_prompt = f"""
【系统提示词 (Style/Role)】:
{system_prompt}

【需要可视化的内容 (Content)】:
{content}
"""
        
        result = self.generate_content(
            prompt=analysis_prompt,
            system_instruction=analysis_system_prompt,
            json_mode=True
        )
        
        return result
