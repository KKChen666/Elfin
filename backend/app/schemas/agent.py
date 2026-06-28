from datetime import datetime
from pydantic import BaseModel


class AgentCreate(BaseModel):
    name: str
    description: str | None = None
    avatar_url: str | None = None
    system_prompt: str | None = None
    config: dict | None = None
    skill_ids: list[int] | None = None  # 创建时关联的技能


class AgentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    avatar_url: str | None = None
    system_prompt: str | None = None
    config: dict | None = None
    is_active: bool | None = None


class AgentSkillAdd(BaseModel):
    skill_id: int
    weight: float = 1.0


class AgentOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    avatar_url: str | None = None
    system_prompt: str | None = None
    config: dict | None = None
    is_active: bool
    skills: list[dict] | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
