from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.config import settings
from app.schemas.user import LLMSettingsIn, LLMSettingsOut, UserRegister, UserLogin, UserOut, Token
from app.services.auth_service import register_user, login_user
from app.utils.auth import get_current_user
from app.utils.secrets import decrypt_secret, encrypt_secret, is_encrypted_secret, mask_secret

router = APIRouter(prefix="/api/auth", tags=["认证"])


@router.post("/register", response_model=UserOut)
def register(data: UserRegister, db: Session = Depends(get_db)):
    return register_user(db, data)


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    return login_user(db, data)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


def _build_llm_settings_out(user: User) -> LLMSettingsOut:
    api_key = decrypt_secret(user.llm_api_key)
    return LLMSettingsOut(
        api_key_masked=mask_secret(user.llm_api_key),
        api_base=user.llm_api_base or settings.LLM_API_BASE,
        model=user.llm_model or settings.LLM_MODEL,
        timeout=user.llm_timeout or settings.LLM_TIMEOUT,
        is_configured=bool(api_key),
    )


@router.get("/llm-settings", response_model=LLMSettingsOut)
def get_llm_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _encrypt_plaintext_api_key_if_needed(current_user, db)
    return _build_llm_settings_out(current_user)


@router.put("/llm-settings", response_model=LLMSettingsOut)
def update_llm_settings(
    data: LLMSettingsIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if "api_key" in data.model_fields_set:
        api_key = data.api_key.strip() if data.api_key else ""
        current_user.llm_api_key = encrypt_secret(api_key)

    if "api_base" in data.model_fields_set:
        api_base = data.api_base.strip() if data.api_base else ""
        current_user.llm_api_base = api_base or None

    if "model" in data.model_fields_set:
        model = data.model.strip() if data.model else ""
        current_user.llm_model = model or None

    if "timeout" in data.model_fields_set:
        current_user.llm_timeout = data.timeout

    db.commit()
    db.refresh(current_user)
    return _build_llm_settings_out(current_user)


def _encrypt_plaintext_api_key_if_needed(user: User, db: Session) -> None:
    if not user.llm_api_key or is_encrypted_secret(user.llm_api_key):
        return
    user.llm_api_key = encrypt_secret(user.llm_api_key)
    db.commit()
    db.refresh(user)
