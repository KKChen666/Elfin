from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.relative import Relative
from app.models.user import User
from app.schemas.relative import RelativeCreate, RelativeUpdate, RelativeOut


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


def get_stats(db: Session, user: User) -> dict:
    relatives = db.query(Relative).filter(Relative.user_id == user.id).all()
    family_relations = [
        "father", "mother", "grandfather", "grandmother",
        "spouse", "child", "sibling", "uncle", "aunt",
        "cousin", "father_in_law", "mother_in_law",
        "brother_in_law", "sister_in_law",
    ]
    friend_relations = ["friend", "best_friend", "partner"]
    colleague_relations = ["colleague", "boss", "client"]
    classmate_relations = ["classmate", "schoolmate", "mentor"]

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
