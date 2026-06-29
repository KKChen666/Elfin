from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1)
    sender: Literal["user", "avatar"]


class ChatMessageOut(BaseModel):
    id: int
    relative_id: int
    content: str
    sender: Literal["user", "avatar"]
    timestamp: datetime

    model_config = {"from_attributes": True}


class AvatarResponseOut(BaseModel):
    content: str


class ChatStyleOut(BaseModel):
    chat_style: dict
