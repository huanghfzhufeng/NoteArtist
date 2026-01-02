"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('username', sa.String(50), nullable=False),
        sa.Column('password', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

    # Create prompts table
    op.create_table(
        'prompts',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('is_preset', sa.Boolean(), nullable=True, default=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_prompts_user_category', 'prompts', ['user_id', 'category'])

    # Create personas table
    op.create_table(
        'personas',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('identity', sa.Text(), nullable=False),
        sa.Column('target_audience', sa.Text(), nullable=False),
        sa.Column('language_style', sa.Text(), nullable=False),
        sa.Column('core_values', sa.Text(), nullable=False),
        sa.Column('common_tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_personas_user_id', 'personas', ['user_id'])

    # Create works table
    op.create_table(
        'works',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('image_url', sa.Text(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('original_content', sa.Text(), nullable=False),
        sa.Column('prompt_used', sa.Text(), nullable=False),
        sa.Column('persona_id', sa.String(), nullable=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['persona_id'], ['personas.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_works_user_created', 'works', ['user_id', 'created_at'])
    op.create_index('ix_works_persona_id', 'works', ['persona_id'])

    # Create settings table
    op.create_table(
        'settings',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('gemini_api_key', sa.String(255), nullable=True),
        sa.Column('imagen_api_key', sa.String(255), nullable=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )


def downgrade() -> None:
    op.drop_table('settings')
    op.drop_index('ix_works_persona_id', table_name='works')
    op.drop_index('ix_works_user_created', table_name='works')
    op.drop_table('works')
    op.drop_index('ix_personas_user_id', table_name='personas')
    op.drop_table('personas')
    op.drop_index('ix_prompts_user_category', table_name='prompts')
    op.drop_table('prompts')
    op.drop_index('ix_users_username', table_name='users')
    op.drop_table('users')
