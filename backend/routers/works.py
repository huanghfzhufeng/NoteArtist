from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional

from database import get_db
from models import Work, Persona, User
from schemas.work import WorkResponse, WorksResponse
from deps import get_current_user
from services.storage import get_storage_service

router = APIRouter()


@router.get("", response_model=WorksResponse)
async def get_works(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    personaId: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's works with pagination and optional persona filter"""
    # Build query
    query = select(Work).where(Work.user_id == current_user.id)
    count_query = select(func.count(Work.id)).where(Work.user_id == current_user.id)
    
    # Filter by persona if specified
    if personaId:
        query = query.where(Work.persona_id == personaId)
        count_query = count_query.where(Work.persona_id == personaId)
    
    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Get paginated works, sorted by created_at desc
    offset = (page - 1) * pageSize
    query = query.order_by(desc(Work.created_at)).offset(offset).limit(pageSize)
    
    result = await db.execute(query)
    works = result.scalars().all()
    
    # Build response with persona info
    works_response = []
    for work in works:
        # Get persona if exists - 验证归属权
        persona_response = None
        if work.persona_id:
            persona_result = await db.execute(
                select(Persona).where(
                    Persona.id == work.persona_id,
                    Persona.user_id == current_user.id  # 确保只能看到自己的 persona
                )
            )
            persona = persona_result.scalar_one_or_none()
            if persona:
                persona_response = {
                    "id": persona.id,
                    "name": persona.name,
                    "identity": persona.identity,
                    "targetAudience": persona.target_audience,
                    "languageStyle": persona.language_style,
                    "coreValues": persona.core_values,
                    "commonTags": persona.common_tags or [],
                    "isActive": persona.is_active,
                    "userId": persona.user_id,
                    "createdAt": persona.created_at,
                    "updatedAt": persona.updated_at
                }
        
        works_response.append(WorkResponse(
            id=work.id,
            imageUrl=work.image_url,
            title=work.title,
            content=work.content,
            tags=work.tags or [],
            originalContent=work.original_content,
            promptUsed=work.prompt_used,
            personaId=work.persona_id,
            persona=persona_response,
            userId=work.user_id,
            createdAt=work.created_at
        ))
    
    return WorksResponse(works=works_response, total=total)


@router.get("/{work_id}", response_model=WorkResponse)
async def get_work(
    work_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific work by ID"""
    result = await db.execute(
        select(Work).where(Work.id == work_id, Work.user_id == current_user.id)
    )
    work = result.scalar_one_or_none()
    
    if not work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="作品不存在")
    
    # Get persona if exists - 验证归属权
    persona_response = None
    if work.persona_id:
        persona_result = await db.execute(
            select(Persona).where(
                Persona.id == work.persona_id,
                Persona.user_id == current_user.id  # 确保只能看到自己的 persona
            )
        )
        persona = persona_result.scalar_one_or_none()
        if persona:
            persona_response = {
                "id": persona.id,
                "name": persona.name,
                "identity": persona.identity,
                "targetAudience": persona.target_audience,
                "languageStyle": persona.language_style,
                "coreValues": persona.core_values,
                "commonTags": persona.common_tags or [],
                "isActive": persona.is_active,
                "userId": persona.user_id,
                "createdAt": persona.created_at,
                "updatedAt": persona.updated_at
            }
    
    return WorkResponse(
        id=work.id,
        imageUrl=work.image_url,
        title=work.title,
        content=work.content,
        tags=work.tags or [],
        originalContent=work.original_content,
        promptUsed=work.prompt_used,
        personaId=work.persona_id,
        persona=persona_response,
        userId=work.user_id,
        createdAt=work.created_at
    )


@router.delete("/{work_id}")
async def delete_work(
    work_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a work"""
    result = await db.execute(
        select(Work).where(Work.id == work_id, Work.user_id == current_user.id)
    )
    work = result.scalar_one_or_none()
    
    if not work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="作品不存在")
    
    # Delete image from storage
    try:
        storage = get_storage_service()
        storage.delete_image(work.image_url)
    except Exception:
        pass  # Continue even if storage deletion fails
    
    await db.delete(work)
    await db.commit()
    
    return {"message": "删除成功"}
