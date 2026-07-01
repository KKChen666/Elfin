from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.relative import Relative, RelativeRelationship
from app.models.user import User
from app.schemas.relative import (
    RelativeCreate,
    RelativeRelationshipCreate,
    RelativeRelationshipOut,
    RelativeRelationshipUpdate,
    RelativeUpdate,
    RelativeOut,
)


def get_all_relatives(db: Session, user: User) -> list[RelativeOut]:
    relatives = (
        db.query(Relative)
        .filter(Relative.user_id == user.id)
        .order_by(Relative.created_at.desc())
        .all()
    )
    return [RelativeOut.model_validate(r) for r in relatives]


def get_relative(db: Session, user: User, relative_id: int) -> RelativeOut:
    relative = (
        db.query(Relative)
        .filter(Relative.id == relative_id, Relative.user_id == user.id)
        .first()
    )
    if not relative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="亲友不存在"
        )
    return RelativeOut.model_validate(relative)


def create_relative(db: Session, user: User, data: RelativeCreate) -> RelativeOut:
    relative = Relative(
        user_id=user.id,
        name=data.name,
        birthday=data.birthday,
        is_lunar=data.is_lunar,
        relation=data.relation,
        phone=data.phone,
        hobbies=data.hobbies,
        clothing_size=data.clothing_size,
        shoe_size=data.shoe_size,
        notes=data.notes,
        mbti=data.mbti,
        address=data.address,
        zodiac=data.zodiac,
        chinese_zodiac=data.chinese_zodiac,
        avatar=data.avatar.model_dump(),
    )
    db.add(relative)
    db.commit()
    db.refresh(relative)
    return RelativeOut.model_validate(relative)


def update_relative(
    db: Session, user: User, relative_id: int, data: RelativeUpdate
) -> RelativeOut:
    relative = (
        db.query(Relative)
        .filter(Relative.id == relative_id, Relative.user_id == user.id)
        .first()
    )
    if not relative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="亲友不存在"
        )
    update_data = data.model_dump(exclude_unset=True)
    if "avatar" in update_data and update_data["avatar"] is not None:
        update_data["avatar"] = (
            data.avatar.model_dump() if hasattr(data.avatar, "model_dump") else data.avatar
        )
    for key, value in update_data.items():
        setattr(relative, key, value)
    db.commit()
    db.refresh(relative)
    return RelativeOut.model_validate(relative)


def delete_relative(db: Session, user: User, relative_id: int) -> None:
    relative = (
        db.query(Relative)
        .filter(Relative.id == relative_id, Relative.user_id == user.id)
        .first()
    )
    if not relative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="亲友不存在"
        )
    db.delete(relative)
    db.commit()


def get_relationships(db: Session, user: User) -> list[RelativeRelationshipOut]:
    relationships = (
        db.query(RelativeRelationship)
        .filter(RelativeRelationship.user_id == user.id)
        .order_by(RelativeRelationship.updated_at.desc())
        .all()
    )
    return [RelativeRelationshipOut.model_validate(item) for item in relationships]


def upsert_relationship(
    db: Session,
    user: User,
    data: RelativeRelationshipCreate,
) -> RelativeRelationshipOut:
    a_id, b_id = _normalize_relative_pair(data.relative_a_id, data.relative_b_id)
    _ensure_relatives_belong_to_user(db, user, [a_id, b_id])

    relationship = (
        db.query(RelativeRelationship)
        .filter(
            RelativeRelationship.user_id == user.id,
            RelativeRelationship.relative_a_id == a_id,
            RelativeRelationship.relative_b_id == b_id,
        )
        .first()
    )
    relation_label = data.relation_label
    reverse_relation_label = data.reverse_relation_label
    if (data.relative_a_id, data.relative_b_id) != (a_id, b_id):
        relation_label = data.reverse_relation_label or data.relation_label
        reverse_relation_label = data.relation_label

    if relationship:
        relationship.relation_label = relation_label
        relationship.reverse_relation_label = reverse_relation_label
        relationship.note = data.note
        relationship.strength = data.strength
    else:
        relationship = RelativeRelationship(
            user_id=user.id,
            relative_a_id=a_id,
            relative_b_id=b_id,
            relation_label=relation_label,
            reverse_relation_label=reverse_relation_label,
            note=data.note,
            strength=data.strength,
        )
        db.add(relationship)

    db.commit()
    db.refresh(relationship)
    return RelativeRelationshipOut.model_validate(relationship)


def update_relationship(
    db: Session,
    user: User,
    relationship_id: int,
    data: RelativeRelationshipUpdate,
) -> RelativeRelationshipOut:
    relationship = _get_relationship(db, user, relationship_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(relationship, key, value)
    db.commit()
    db.refresh(relationship)
    return RelativeRelationshipOut.model_validate(relationship)


def delete_relationship(db: Session, user: User, relationship_id: int) -> None:
    relationship = _get_relationship(db, user, relationship_id)
    db.delete(relationship)
    db.commit()


def _get_relationship(
    db: Session,
    user: User,
    relationship_id: int,
) -> RelativeRelationship:
    relationship = (
        db.query(RelativeRelationship)
        .filter(
            RelativeRelationship.id == relationship_id,
            RelativeRelationship.user_id == user.id,
        )
        .first()
    )
    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="关系不存在"
        )
    return relationship


def _normalize_relative_pair(a_id: int, b_id: int) -> tuple[int, int]:
    if a_id == b_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能给同一个亲友建立关系",
        )
    return (a_id, b_id) if a_id < b_id else (b_id, a_id)


def _ensure_relatives_belong_to_user(
    db: Session,
    user: User,
    relative_ids: list[int],
) -> None:
    count = (
        db.query(Relative)
        .filter(Relative.user_id == user.id, Relative.id.in_(relative_ids))
        .count()
    )
    if count != len(set(relative_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="部分亲友不存在",
        )


def get_stats(db: Session, user: User) -> dict:
    relatives = db.query(Relative).filter(Relative.user_id == user.id).all()
    family_relations = [
        "grandpa", "grandma", "grandpa_maternal", "grandma_maternal",
        "father", "mother", "uncle", "aunt", "brother", "sister",
        "son", "daughter", "spouse", "cousin",
    ]
    friend_relations = ["friend", "best_friend", "neighbor"]
    colleague_relations = ["colleague", "boss", "client"]
    classmate_relations = ["classmate", "schoolmate", "teacher"]

    total = len(relatives)
    family = sum(1 for r in relatives if r.relation in family_relations)
    friend = sum(1 for r in relatives if r.relation in friend_relations)
    colleague = sum(1 for r in relatives if r.relation in colleague_relations)
    classmate = sum(1 for r in relatives if r.relation in classmate_relations)
    with_chat_style = sum(1 for r in relatives if r.chat_style is not None)

    # 按关系分类统计
    category_counts = {}
    for r in relatives:
        category_counts[r.relation] = category_counts.get(r.relation, 0) + 1

    return {
        "totalRelatives": total,
        "familyCount": family,
        "friendCount": friend,
        "colleagueCount": colleague,
        "classmateCount": classmate,
        "withChatStyle": with_chat_style,
        "categoryCounts": category_counts,
    }
