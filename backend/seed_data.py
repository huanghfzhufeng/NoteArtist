"""
Seed data script - 预导入提示词模板和示例人设
运行方式: docker exec -it noteartist-backend python seed_data.py
"""
import asyncio
from sqlalchemy import select
from database import async_session_maker, init_db
from models import Prompt, Persona, User

# 预设提示词模板
PRESET_PROMPTS = [
    {
        "name": "手绘笔记风格",
        "content": """Create a hand-drawn note style illustration with:
- Warm cream/beige paper background texture
- Black ink hand-drawn elements and doodles
- Colorful highlights in yellow, pink, and mint green
- Cute icons and decorative elements
- Clean, organized layout with visual hierarchy
- Mix of text boxes, arrows, and bullet points
- Playful but professional aesthetic
- Chinese social media style (Xiaohongshu)""",
        "category": "视觉风格",
        "is_preset": True
    },
    {
        "name": "极简线条风格",
        "content": """Create a minimalist line art illustration with:
- Pure white background
- Simple black line drawings
- Minimal color accents (one or two colors max)
- Clean geometric shapes
- Lots of white space
- Modern and sophisticated feel
- Focus on essential elements only""",
        "category": "视觉风格",
        "is_preset": True
    },
    {
        "name": "水彩插画风格",
        "content": """Create a watercolor style illustration with:
- Soft, flowing watercolor textures
- Pastel color palette (soft pink, blue, lavender)
- Gentle gradients and color bleeds
- Delicate hand-painted feel
- Dreamy and romantic atmosphere
- Artistic brush strokes visible
- Light and airy composition""",
        "category": "视觉风格",
        "is_preset": True
    },
    {
        "name": "复古海报风格",
        "content": """Create a vintage poster style illustration with:
- Retro color palette (mustard, teal, coral, cream)
- Bold typography and graphic elements
- Halftone dot patterns
- Distressed/aged texture overlay
- 1950s-1970s aesthetic
- Strong visual impact
- Nostalgic and warm feeling""",
        "category": "视觉风格",
        "is_preset": True
    },
    {
        "name": "科技未来风格",
        "content": """Create a futuristic tech style illustration with:
- Dark background with neon accents
- Glowing lines and circuit patterns
- Holographic and gradient effects
- Geometric and angular shapes
- Cyberpunk color scheme (cyan, magenta, purple)
- High-tech and innovative feel
- Digital and sleek aesthetic""",
        "category": "视觉风格",
        "is_preset": True
    },
    {
        "name": "可爱卡通风格",
        "content": """Create a cute cartoon style illustration with:
- Bright and cheerful colors
- Kawaii/cute character elements
- Rounded shapes and soft edges
- Playful expressions and poses
- Pastel rainbow palette
- Sparkles and decorative elements
- Fun and approachable vibe""",
        "category": "视觉风格",
        "is_preset": True
    }
]

# 示例人设
DEMO_PERSONAS = [
    {
        "name": "职场导师",
        "identity": "资深互联网产品经理，10年大厂经验",
        "target_audience": "职场新人、产品经理、互联网从业者",
        "language_style": "专业但不枯燥，善用案例，偶尔幽默吐槽",
        "core_values": "用户第一、数据驱动、持续学习",
        "common_tags": ["职场", "产品经理", "互联网", "成长", "干货"],
        "is_active": True
    },
    {
        "name": "生活美学家",
        "identity": "独立生活方式博主，热爱记录生活中的小确幸",
        "target_audience": "都市白领、文艺青年、生活品质追求者",
        "language_style": "温暖治愈、细腻感性、富有诗意",
        "core_values": "慢生活、品质感、仪式感、自我关爱",
        "common_tags": ["生活", "日常", "治愈", "美好", "记录"],
        "is_active": False
    },
    {
        "name": "学习达人",
        "identity": "终身学习者，擅长高效学习方法分享",
        "target_audience": "学生党、考研考公人群、自我提升者",
        "language_style": "逻辑清晰、干货满满、鼓励式表达",
        "core_values": "效率优先、科学方法、坚持不懈",
        "common_tags": ["学习", "效率", "方法论", "自律", "成长"],
        "is_active": False
    }
]


async def seed_presets():
    """导入预设提示词（全局，不绑定用户）"""
    await init_db()
    
    async with async_session_maker() as session:
        # 检查是否已有预设
        result = await session.execute(
            select(Prompt).where(Prompt.is_preset == True)
        )
        existing = result.scalars().all()
        
        if existing:
            print(f"已存在 {len(existing)} 个预设提示词，跳过导入")
            return
        
        # 导入预设提示词
        for prompt_data in PRESET_PROMPTS:
            prompt = Prompt(**prompt_data)
            session.add(prompt)
        
        await session.commit()
        print(f"✅ 成功导入 {len(PRESET_PROMPTS)} 个预设提示词模板")


async def seed_demo_user_data(username: str = None):
    """为指定用户或所有用户导入示例人设"""
    await init_db()
    
    async with async_session_maker() as session:
        # 查找用户
        if username:
            result = await session.execute(
                select(User).where(User.username == username)
            )
            users = [result.scalar_one_or_none()]
            users = [u for u in users if u]
        else:
            # 获取所有用户
            result = await session.execute(select(User))
            users = result.scalars().all()
        
        if not users:
            print(f"❌ 没有找到用户")
            return
        
        for user in users:
            # 检查是否已有人设
            result = await session.execute(
                select(Persona).where(Persona.user_id == user.id)
            )
            existing = result.scalars().all()
            
            if existing:
                print(f"用户 '{user.username}' 已有 {len(existing)} 个人设，跳过导入")
                continue
            
            # 导入示例人设
            for persona_data in DEMO_PERSONAS:
                persona = Persona(user_id=user.id, **persona_data)
                session.add(persona)
            
            print(f"✅ 成功为用户 '{user.username}' 导入 {len(DEMO_PERSONAS)} 个示例人设")
        
        await session.commit()


async def main():
    print("🚀 开始导入种子数据...")
    print("-" * 40)
    
    # 导入预设提示词
    await seed_presets()
    
    # 如果有用户，导入示例人设
    await seed_demo_user_data()  # 为所有用户导入
    
    print("-" * 40)
    print("✨ 种子数据导入完成！")


if __name__ == "__main__":
    asyncio.run(main())
