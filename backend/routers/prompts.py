from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, Prompt
from schemas import PromptCreate, PromptUpdate, PromptResponse, PromptsResponse
from deps import get_current_user


router = APIRouter()


@router.get("", response_model=PromptsResponse)
async def get_prompts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all prompts (presets and user's custom)"""
    # Get presets
    result = await db.execute(
        select(Prompt).where(Prompt.is_preset == True)
    )
    presets = result.scalars().all()
    
    # Get user's custom prompts
    result = await db.execute(
        select(Prompt).where(
            Prompt.user_id == current_user.id,
            Prompt.is_preset == False
        ).order_by(Prompt.created_at.desc())
    )
    custom = result.scalars().all()
    
    return PromptsResponse(
        presets=[PromptResponse(
            id=p.id,
            name=p.name,
            content=p.content,
            category=p.category,
            isPreset=p.is_preset,
            userId=p.user_id,
            createdAt=p.created_at,
            updatedAt=p.updated_at
        ) for p in presets],
        custom=[PromptResponse(
            id=p.id,
            name=p.name,
            content=p.content,
            category=p.category,
            isPreset=p.is_preset,
            userId=p.user_id,
            createdAt=p.created_at,
            updatedAt=p.updated_at
        ) for p in custom]
    )


@router.post("", response_model=PromptResponse)
async def create_prompt(
    request: PromptCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new custom prompt"""
    prompt = Prompt(
        name=request.name,
        content=request.content,
        category=request.category,
        is_preset=False,
        user_id=current_user.id
    )
    db.add(prompt)
    await db.commit()
    await db.refresh(prompt)
    
    return PromptResponse(
        id=prompt.id,
        name=prompt.name,
        content=prompt.content,
        category=prompt.category,
        isPreset=prompt.is_preset,
        userId=prompt.user_id,
        createdAt=prompt.created_at,
        updatedAt=prompt.updated_at
    )


@router.put("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: str,
    request: PromptUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a custom prompt"""
    result = await db.execute(
        select(Prompt).where(
            Prompt.id == prompt_id,
            Prompt.user_id == current_user.id,
            Prompt.is_preset == False
        )
    )
    prompt = result.scalar_one_or_none()
    
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模板不存在"
        )
    
    if request.name is not None:
        prompt.name = request.name
    if request.content is not None:
        prompt.content = request.content
    if request.category is not None:
        prompt.category = request.category
    
    await db.commit()
    await db.refresh(prompt)
    
    return PromptResponse(
        id=prompt.id,
        name=prompt.name,
        content=prompt.content,
        category=prompt.category,
        isPreset=prompt.is_preset,
        userId=prompt.user_id,
        createdAt=prompt.created_at,
        updatedAt=prompt.updated_at
    )


@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a custom prompt"""
    result = await db.execute(
        select(Prompt).where(
            Prompt.id == prompt_id,
            Prompt.user_id == current_user.id,
            Prompt.is_preset == False
        )
    )
    prompt = result.scalar_one_or_none()
    
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模板不存在"
        )
    
    await db.delete(prompt)
    await db.commit()
    
    return {"success": True}


@router.get("/categories")
async def get_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all unique categories"""
    result = await db.execute(
        select(Prompt.category).where(
            Prompt.user_id == current_user.id
        ).distinct()
    )
    categories = [row[0] for row in result.all()]
    
    return {"categories": categories}
