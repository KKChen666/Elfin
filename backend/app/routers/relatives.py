from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.relative import (
    RelativeCreate,
    RelativeRelationshipCreate,
    RelativeRelationshipOut,
    RelativeRelationshipUpdate,
    RelativeUpdate,
    RelativeOut,
)
from app.services.relative_service import (
    get_all_relatives,
    get_relative,
    create_relative,
    update_relative,
    delete_relative,
    delete_relationship,
    get_stats,
    get_relationships,
    update_relationship,
    upsert_relationship,
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


@router.get("/relationships/network", response_model=list[RelativeRelationshipOut])
def list_relationships(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_relationships(db, user)


@router.post("/relationships/network", response_model=RelativeRelationshipOut, status_code=201)
def create_relationship(
    data: RelativeRelationshipCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return upsert_relationship(db, user, data)


@router.put("/relationships/network/{relationship_id}", response_model=RelativeRelationshipOut)
def update_network_relationship(
    relationship_id: int,
    data: RelativeRelationshipUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_relationship(db, user, relationship_id, data)


@router.delete("/relationships/network/{relationship_id}", status_code=204)
def delete_network_relationship(
    relationship_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delete_relationship(db, user, relationship_id)


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
