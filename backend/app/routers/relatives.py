from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.relative import RelativeCreate, RelativeUpdate, RelativeOut
from app.services.relative_service import (
    get_all_relatives,
    get_relative,
    create_relative,
    update_relative,
    delete_relative,
    get_stats,
)
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/relatives", tags=["亲友管理"])


@router.get("", response_model=list[RelativeOut])
def list_relatives(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_all_relatives(db, user)


@router.post("", response_model=RelativeOut, status_code=201)
def create(
    data: RelativeCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_relative(db, user, data)


@router.get("/{relative_id}", response_model=RelativeOut)
def get_one(
    relative_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_relative(db, user, relative_id)


@router.put("/{relative_id}", response_model=RelativeOut)
def update(
    relative_id: int,
    data: RelativeUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_relative(db, user, relative_id, data)


@router.delete("/{relative_id}", status_code=204)
def delete(
    relative_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delete_relative(db, user, relative_id)


@router.get("/stats/summary")
def stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_stats(db, user)
