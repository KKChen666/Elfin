from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class SkillCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    source_type: Literal["manual", "chat_import", "merge", "creator"] = "manual"
    source_relative_id: int | None = None
    personality: dict | None = None
    communication_style: dict | None = None
    knowledge_domains: list | None = None
    expression_patterns: dict | None = None
    memory_tree: list | None = None
    system_prompt: str | None = None


class SkillUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    personality: dict | None = None
    communication_style: dict | None = None
    knowledge_domains: list | None = None
    expression_patterns: dict | None = None
    memory_tree: list | None = None
    system_prompt: str | None = None
    is_active: bool | None = None


class SkillOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    source_type: Literal["manual", "chat_import", "merge", "creator"]
    source_relative_id: int | None = None
    personality: dict | None = None
    communication_style: dict | None = None
    knowledge_domains: list | None = None
    expression_patterns: dict | None = None
    memory_tree: list | None = None
    system_prompt: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
