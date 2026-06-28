from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserOut, Token
from app.services.auth_service import register_user, login_user
from app.utils.auth import get_current_user

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
