from datetime import datetime
from pydantic import BaseModel


class ChatMessageCreate(BaseModel):
    content: str
    sender: str  # 'user' or 'avatar'


class ChatMessageOut(BaseModel):
    id: int
    relative_id: int
    content: str
    sender: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class AvatarResponseOut(BaseModel):
    content: str


class ChatStyleOut(BaseModel):
    chat_style: dict
