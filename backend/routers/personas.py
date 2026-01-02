from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, Persona
from schemas import PersonaCreate, PersonaUpdate, PersonaResponse, PersonasResponse
from deps import get_current_user


router = APIRouter()


@router.get("", response_model=PersonasResponse)
async def get_personas(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all personas for current user"""
    result = await db.execute(
        select(Persona).where(Persona.user_id == current_user.id).order_by(Persona.created_at.desc())
    )
    personas = result.scalars().all()
    
    return PersonasResponse(
        personas=[PersonaResponse(
            id=p.id,
            name=p.name,
            identity=p.identity,
            targetAudience=p.target_audience,
            languageStyle=p.language_style,
            coreValues=p.core_values,
            commonTags=p.common_tags or [],
            isActive=p.is_active,
            userId=p.user_id,
            createdAt=p.created_at,
            updatedAt=p.updated_at
        ) for p in personas]
    )


@router.post("", response_model=PersonaResponse)
async def create_persona(
    request: PersonaCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new persona"""
    persona = Persona(
        name=request.name,
        identity=request.identity,
        target_audience=request.targetAudience,
        language_style=request.languageStyle,
        core_values=request.coreValues,
        common_tags=request.commonTags,
        user_id=current_user.id
    )
    db.add(persona)
    await db.commit()
    await db.refresh(persona)
    
    return PersonaResponse(
        id=persona.id,
        name=persona.name,
        identity=persona.identity,
        targetAudience=persona.target_audience,
        languageStyle=persona.language_style,
        coreValues=persona.core_values,
        commonTags=persona.common_tags or [],
        isActive=persona.is_active,
        userId=persona.user_id,
        createdAt=persona.created_at,
        updatedAt=persona.updated_at
    )


@router.put("/{persona_id}", response_model=PersonaResponse)
async def update_persona(
    persona_id: str,
    request: PersonaUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a persona"""
    result = await db.execute(
        select(Persona).where(
            Persona.id == persona_id,
            Persona.user_id == current_user.id
        )
    )
    persona = result.scalar_one_or_none()
    
    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="人设不存在"
        )
    
    if request.name is not None:
        persona.name = request.name
    if request.identity is not None:
        persona.identity = request.identity
    if request.targetAudience is not None:
        persona.target_audience = request.targetAudience
    if request.languageStyle is not None:
        persona.language_style = request.languageStyle
    if request.coreValues is not None:
        persona.core_values = request.coreValues
    if request.commonTags is not None:
        persona.common_tags = request.commonTags
    if request.isActive is not None:
        # If setting this persona as active, deactivate others
        if request.isActive:
            await db.execute(
                select(Persona).where(
                    Persona.user_id == current_user.id,
                    Persona.id != persona_id
                )
            )
            # Deactivate all other personas
            other_result = await db.execute(
                select(Persona).where(
                    Persona.user_id == current_user.id,
                    Persona.id != persona_id
                )
            )
            for other in other_result.scalars().all():
                other.is_active = False
        persona.is_active = request.isActive
    
    await db.commit()
    await db.refresh(persona)
    
    return PersonaResponse(
        id=persona.id,
        name=persona.name,
        identity=persona.identity,
        targetAudience=persona.target_audience,
        languageStyle=persona.language_style,
        coreValues=persona.core_values,
        commonTags=persona.common_tags or [],
        isActive=persona.is_active,
        userId=persona.user_id,
        createdAt=persona.created_at,
        updatedAt=persona.updated_at
    )


@router.delete("/{persona_id}")
async def delete_persona(
    persona_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a persona"""
    result = await db.execute(
        select(Persona).where(
            Persona.id == persona_id,
            Persona.user_id == current_user.id
        )
    )
    persona = result.scalar_one_or_none()
    
    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="人设不存在"
        )
    
    await db.delete(persona)
    await db.commit()
    
    return {"success": True}


@router.post("/{persona_id}/activate", response_model=PersonaResponse)
async def activate_persona(
    persona_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Activate a persona and deactivate all others"""
    # Find the persona to activate
    result = await db.execute(
        select(Persona).where(
            Persona.id == persona_id,
            Persona.user_id == current_user.id
        )
    )
    persona = result.scalar_one_or_none()
    
    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="人设不存在"
        )
    
    # Deactivate all other personas for this user
    other_result = await db.execute(
        select(Persona).where(
            Persona.user_id == current_user.id,
            Persona.id != persona_id
        )
    )
    for other in other_result.scalars().all():
        other.is_active = False
    
    # Activate this persona
    persona.is_active = True
    
    await db.commit()
    await db.refresh(persona)
    
    return PersonaResponse(
        id=persona.id,
        name=persona.name,
        identity=persona.identity,
        targetAudience=persona.target_audience,
        languageStyle=persona.language_style,
        coreValues=persona.core_values,
        commonTags=persona.common_tags or [],
        isActive=persona.is_active,
        userId=persona.user_id,
        createdAt=persona.created_at,
        updatedAt=persona.updated_at
    )
