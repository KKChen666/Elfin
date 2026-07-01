from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.relative import Relative, ReminderEvent
from app.models.user import User
from app.schemas.relative import ReminderEventCreate, ReminderEventOut, ReminderEventUpdate
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/reminders", tags=["提醒"])


def _event_out(event: ReminderEvent) -> ReminderEventOut:
    return ReminderEventOut(
        id=event.id,
        title=event.title,
        date=event.event_date,
        relative_id=event.relative_id,
        advance_days=event.advance_days or [],
        note=event.note,
        is_enabled=event.is_enabled,
        created_at=event.created_at,
        updated_at=event.updated_at,
    )


def _ensure_relative_owner(db: Session, user: User, relative_id: int | None) -> None:
    if relative_id is None:
        return
    exists = (
        db.query(Relative.id)
        .filter(Relative.id == relative_id, Relative.user_id == user.id)
        .first()
    )
    if not exists:
        raise HTTPException(status_code=404, detail="亲友不存在")


def _get_event(db: Session, user: User, event_id: int) -> ReminderEvent:
    event = (
        db.query(ReminderEvent)
        .filter(ReminderEvent.id == event_id, ReminderEvent.user_id == user.id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="提醒不存在")
    return event


@router.get("", response_model=list[ReminderEventOut])
def list_reminders(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    events = (
        db.query(ReminderEvent)
        .filter(ReminderEvent.user_id == user.id)
        .order_by(ReminderEvent.event_date.asc(), ReminderEvent.created_at.desc())
        .all()
    )
    return [_event_out(event) for event in events]


@router.post("", response_model=ReminderEventOut, status_code=201)
def create_reminder(
    data: ReminderEventCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_relative_owner(db, user, data.relative_id)
    event = ReminderEvent(
        user_id=user.id,
        relative_id=data.relative_id,
        title=data.title.strip(),
        event_date=data.date,
        advance_days=sorted(set(day for day in data.advance_days if day >= 0)),
        note=data.note.strip() if data.note else None,
        is_enabled=data.is_enabled,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return _event_out(event)


@router.put("/{event_id}", response_model=ReminderEventOut)
def update_reminder(
    event_id: int,
    data: ReminderEventUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = _get_event(db, user, event_id)
    if "relative_id" in data.model_fields_set:
        _ensure_relative_owner(db, user, data.relative_id)
        event.relative_id = data.relative_id
    if "title" in data.model_fields_set and data.title is not None:
        event.title = data.title.strip()
    if "date" in data.model_fields_set and data.date is not None:
        event.event_date = data.date
    if "advance_days" in data.model_fields_set and data.advance_days is not None:
        event.advance_days = sorted(set(day for day in data.advance_days if day >= 0))
    if "note" in data.model_fields_set:
        event.note = data.note.strip() if data.note else None
    if "is_enabled" in data.model_fields_set and data.is_enabled is not None:
        event.is_enabled = data.is_enabled
    event.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(event)
    return _event_out(event)


@router.delete("/{event_id}", status_code=204)
def delete_reminder(
    event_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = _get_event(db, user, event_id)
    db.delete(event)
    db.commit()
