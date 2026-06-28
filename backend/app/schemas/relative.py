from datetime import datetime, date
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
    birthday: date
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
    birthday: date | None = None
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
    birthday: date
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
