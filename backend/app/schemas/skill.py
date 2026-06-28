from datetime import datetime
from pydantic import BaseModel


class SkillCreate(BaseModel):
    name: str
    description: str | None = None
    source_type: str = "manual"
    source_relative_id: int | None = None
    personality: dict | None = None
    communication_style: dict | None = None
    knowledge_domains: list | None = None
    expression_patterns: dict | None = None
    memory_tree: list | None = None
    system_prompt: str | None = None


class SkillUpdate(BaseModel):
    name: str | None = None
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
    source_type: str
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
