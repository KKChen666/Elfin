from __future__ import annotations

from datetime import datetime, date as Date
from pydantic import BaseModel, Field


class AvatarConfig(BaseModel):
    gender: int = 0
    faceShape: int = 0
    hairstyle: int = 0
    eyeStyle: int = 0
    mouthStyle: int = 0
    clothing: int = 0
    accessory: int = 0
    skinColor: str = "#FFD5B8"
    hairColor: str = "#3D2314"
    clothingColor: str = "#E8734A"


class RelativeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    birthday: Date
    is_lunar: bool = False
    relation: str = Field(..., max_length=50)
    phone: str | None = None
    hobbies: str | None = None
    clothing_size: str | None = None
    shoe_size: str | None = None
    notes: str | None = None
    mbti: str | None = None
    address: str | None = None
    zodiac: str | None = None
    chinese_zodiac: str | None = None
    avatar: AvatarConfig = AvatarConfig()


class RelativeUpdate(BaseModel):
    name: str | None = None
    birthday: Date | None = None
    is_lunar: bool | None = None
    relation: str | None = None
    phone: str | None = None
    hobbies: str | None = None
    clothing_size: str | None = None
    shoe_size: str | None = None
    notes: str | None = None
    mbti: str | None = None
    address: str | None = None
    zodiac: str | None = None
    chinese_zodiac: str | None = None
    avatar: AvatarConfig | None = None
    avatar_image_url: str | None = None
    chat_style: dict | None = None


class RelativeOut(BaseModel):
    id: int
    name: str
    birthday: Date
    is_lunar: bool
    relation: str
    phone: str | None = None
    hobbies: str | None = None
    clothing_size: str | None = None
    shoe_size: str | None = None
    notes: str | None = None
    mbti: str | None = None
    address: str | None = None
    zodiac: str | None = None
    chinese_zodiac: str | None = None
    avatar: dict
    avatar_image_url: str | None = None
    chat_style: dict | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RelativeRelationshipCreate(BaseModel):
    relative_a_id: int
    relative_b_id: int
    relation_label: str = Field(..., min_length=1, max_length=50)
    reverse_relation_label: str | None = Field(default=None, max_length=50)
    note: str | None = None
    strength: int = Field(default=3, ge=1, le=5)


class RelativeRelationshipUpdate(BaseModel):
    relation_label: str | None = Field(default=None, min_length=1, max_length=50)
    reverse_relation_label: str | None = Field(default=None, max_length=50)
    note: str | None = None
    strength: int | None = Field(default=None, ge=1, le=5)


class RelativeRelationshipOut(BaseModel):
    id: int
    relative_a_id: int
    relative_b_id: int
    relation_label: str
    reverse_relation_label: str | None = None
    note: str | None = None
    strength: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReminderEventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    date: Date
    relative_id: int | None = None
    advance_days: list[int] = Field(default_factory=lambda: [1, 3, 7])
    note: str | None = None
    is_enabled: bool = True


class ReminderEventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    date: Date | None = None
    relative_id: int | None = None
    advance_days: list[int] | None = None
    note: str | None = None
    is_enabled: bool | None = None


class ReminderEventOut(BaseModel):
    id: int
    title: str
    date: Date
    relative_id: int | None = None
    advance_days: list[int]
    note: str | None = None
    is_enabled: bool
    created_at: datetime
    updated_at: datetime
