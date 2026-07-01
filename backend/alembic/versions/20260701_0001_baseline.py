"""baseline schema

Revision ID: 20260701_0001
Revises:
Create Date: 2026-07-01
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260701_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("username", sa.String(50), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("llm_api_key", sa.Text(), nullable=True),
        sa.Column("llm_api_base", sa.String(500), nullable=True),
        sa.Column("llm_model", sa.String(100), nullable=True),
        sa.Column("llm_timeout", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "relatives",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("birthday", sa.Date(), nullable=False),
        sa.Column("is_lunar", sa.Boolean(), nullable=True),
        sa.Column("relation", sa.String(50), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("hobbies", sa.Text(), nullable=True),
        sa.Column("clothing_size", sa.String(20), nullable=True),
        sa.Column("shoe_size", sa.String(20), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("mbti", sa.String(10), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("zodiac", sa.String(20), nullable=True),
        sa.Column("chinese_zodiac", sa.String(20), nullable=True),
        sa.Column("avatar", sa.JSON(), nullable=False),
        sa.Column("avatar_image_url", sa.String(500), nullable=True),
        sa.Column("chat_style", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "relative_relationships",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("relative_a_id", sa.Integer(), sa.ForeignKey("relatives.id", ondelete="CASCADE"), nullable=False),
        sa.Column("relative_b_id", sa.Integer(), sa.ForeignKey("relatives.id", ondelete="CASCADE"), nullable=False),
        sa.Column("relation_label", sa.String(50), nullable=False),
        sa.Column("reverse_relation_label", sa.String(50), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("strength", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "reminder_events",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("relative_id", sa.Integer(), sa.ForeignKey("relatives.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("event_date", sa.Date(), nullable=False),
        sa.Column("advance_days", sa.JSON(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("is_enabled", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("relative_id", sa.Integer(), sa.ForeignKey("relatives.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("sender", sa.Enum("user", "avatar", name="sender_enum"), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "chat_memory_chunks",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("relative_id", sa.Integer(), sa.ForeignKey("relatives.id", ondelete="CASCADE"), nullable=False),
        sa.Column("speaker", sa.String(100), nullable=False),
        sa.Column("trigger_text", sa.Text(), nullable=True),
        sa.Column("reply_text", sa.Text(), nullable=False),
        sa.Column("context_before", sa.JSON(), nullable=True),
        sa.Column("context_after", sa.JSON(), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("embedding", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "skills",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("source_type", sa.String(20), nullable=False),
        sa.Column("source_relative_id", sa.Integer(), sa.ForeignKey("relatives.id", ondelete="SET NULL"), nullable=True),
        sa.Column("personality", sa.JSON(), nullable=True),
        sa.Column("communication_style", sa.JSON(), nullable=True),
        sa.Column("knowledge_domains", sa.JSON(), nullable=True),
        sa.Column("expression_patterns", sa.JSON(), nullable=True),
        sa.Column("memory_tree", sa.JSON(), nullable=True),
        sa.Column("system_prompt", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "agents",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("system_prompt", sa.Text(), nullable=True),
        sa.Column("config", sa.JSON(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "agent_skills",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("agent_id", sa.Integer(), sa.ForeignKey("agents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("skill_id", sa.Integer(), sa.ForeignKey("skills.id", ondelete="CASCADE"), nullable=False),
        sa.Column("weight", sa.Float(), nullable=True),
    )
    op.create_table(
        "conversations",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(200), nullable=True),
        sa.Column("type", sa.Enum("direct", "group", name="conversation_type"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("is_archived", sa.Boolean(), nullable=False),
        sa.Column("archived_at", sa.DateTime(), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_table(
        "conversation_participants",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("conversation_id", sa.Integer(), sa.ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("agent_id", sa.Integer(), sa.ForeignKey("agents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("joined_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("conversation_id", sa.Integer(), sa.ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sender_type", sa.Enum("user", "agent", name="sender_type"), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    for table_name in [
        "messages",
        "conversation_participants",
        "conversations",
        "agent_skills",
        "agents",
        "skills",
        "chat_memory_chunks",
        "chat_messages",
        "reminder_events",
        "relative_relationships",
        "relatives",
        "users",
    ]:
        op.drop_table(table_name)
