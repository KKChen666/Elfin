from datetime import datetime
from pydantic import BaseModel


class ConversationCreate(BaseModel):
    title: str | None = None
    type: str = "direct"  # direct or group
    agent_ids: list[int]  # 参与的 Agent ID 列表


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
    content: str


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
