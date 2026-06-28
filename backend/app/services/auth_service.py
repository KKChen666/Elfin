from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, Token, UserOut
from app.utils.auth import hash_password, verify_password, create_access_token


def register_user(db: Session, data: UserRegister) -> UserOut:
    existing = db.query(User).filter(User.username == data.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在",
        )
    user = User(
        username=data.username,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


def login_user(db: Session, data: UserLogin) -> Token:
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )
    token = create_access_token({"sub": user.id})
    return Token(access_token=token)
