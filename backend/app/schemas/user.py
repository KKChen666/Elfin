from datetime import datetime
from pydantic import BaseModel, Field


class UserRegister(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    created_at: datetime

    model_config = {"from_attributes": True}


class LLMSettingsIn(BaseModel):
    api_key: str | None = None
    api_base: str | None = None
    model: str | None = None
    timeout: int | None = Field(default=None, ge=5, le=300)


class LLMSettingsOut(BaseModel):
    api_key_masked: str | None = None
    api_base: str
    model: str
    timeout: int
    is_configured: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
