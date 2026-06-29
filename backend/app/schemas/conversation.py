from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class ConversationCreate(BaseModel):
    title: str | None = None
    type: Literal["direct", "group"] = "direct"
    agent_ids: list[int] = Field(..., min_length=1)  # 参与的 Agent ID 列表


class ConversationOut(BaseModel):
    id: int
    title: str | None = None
    type: str
    participants: list[dict] | None = None
    last_message: dict | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)


class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_type: str
    sender_id: int
    sender_name: str | None = None
    content: str
    metadata_json: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
