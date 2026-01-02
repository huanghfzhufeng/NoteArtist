from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Persona, Work, User
from schemas.generate import GenerateRequest, GenerateResponse, SaveWorkRequest, SaveWorkResponse
from deps import get_current_user
from services.gemini import GeminiService
from services.imagen import ImagenService
from services.storage import get_storage_service
from exceptions import ExternalAPIError, StorageError
from config import settings

router = APIRouter()


@router.post("", response_model=GenerateResponse)
async def generate_content(
    request: GenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate image and copy from content using AI"""
    
    # Check if API is configured in .env
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="系统未配置 API Key，请联系管理员"
        )
    
    # Get persona if specified - 验证归属权
    persona_data = None
    if request.personaId:
        persona_result = await db.execute(
            select(Persona).where(
                Persona.id == request.personaId,
                Persona.user_id == current_user.id  # 确保 persona 属于当前用户
            )
        )
        persona = persona_result.scalar_one_or_none()
        if not persona:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="人设不存在或无权访问"
            )
        persona_data = {
            "identity": persona.identity,
            "targetAudience": persona.target_audience,
            "languageStyle": persona.language_style,
            "coreValues": persona.core_values,
            "commonTags": persona.common_tags or []
        }
    
    try:
        # Step 1: Use Gemini to analyze content and generate prompts (uses .env config)
        gemini = GeminiService()
        analysis = await gemini.analyze_content_and_generate_copy(
            content=request.content,
            system_prompt=request.systemPrompt,
            persona=persona_data
        )
        
        image_prompt = analysis.get("image_prompt", "")
        xhs_title = analysis.get("xhs_title", "")
        xhs_content = analysis.get("xhs_content", "")
        xhs_tags = analysis.get("xhs_tags", [])
        
        if not image_prompt:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI 未能生成图像提示词"
            )
        
        # Step 2: Use Imagen to generate image (uses .env config)
        imagen = ImagenService()
        image_base64 = await imagen.generate_image(image_prompt)
        
        return GenerateResponse(
            imageBase64=image_base64,
            title=xhs_title,
            content=xhs_content,
            tags=xhs_tags,
            debugPrompt=image_prompt
        )
        
    except ExternalAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"生成失败: {str(e)}"
        )



@router.post("/save", response_model=SaveWorkResponse)
async def save_generated_work(
    request: SaveWorkRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save generated content as a work"""
    try:
        # Upload image to storage
        storage = get_storage_service()
        
        # Create work record first to get ID
        work = Work(
            user_id=current_user.id,
            title=request.title,
            content=request.content,
            tags=request.tags,
            original_content=request.originalContent,
            prompt_used=request.promptUsed,
            persona_id=request.personaId,
            image_url=""  # Will be updated after upload
        )
        db.add(work)
        await db.flush()  # Get the ID
        
        # Upload image
        image_url = storage.upload_image(current_user.id, work.id, request.imageBase64)
        work.image_url = image_url
        
        await db.commit()
        await db.refresh(work)
        
        return SaveWorkResponse(
            id=work.id,
            imageUrl=image_url,
            message="保存成功"
        )
        
    except StorageError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"保存失败: {str(e)}"
        )
