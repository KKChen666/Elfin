from datetime import datetime, date
from sqlalchemy import (
    Integer, String, Boolean, Date, Text, DateTime, ForeignKey, JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Relative(Base):
    __tablename__ = "relatives"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    birthday: Mapped[date] = mapped_column(Date, nullable=False)
    is_lunar: Mapped[bool] = mapped_column(Boolean, default=False)
    relation: Mapped[str] = mapped_column(String(50), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    hobbies: Mapped[str | None] = mapped_column(Text, nullable=True)
    clothing_size: Mapped[str | None] = mapped_column(String(20), nullable=True)
    shoe_size: Mapped[str | None] = mapped_column(String(20), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    mbti: Mapped[str | None] = mapped_column(String(10), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    zodiac: Mapped[str | None] = mapped_column(String(20), nullable=True)
    chinese_zodiac: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # AvatarConfig 存为 JSON
    avatar: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    # 头像图片 URL（腾讯云 COS）
    avatar_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # ChatStyle 存为 JSON
    chat_style: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # 关系
    user = relationship("User", back_populates="relatives")
    chat_messages = relationship(
        "ChatMessage", back_populates="relative", cascade="all, delete-orphan"
    )


class RelativeRelationship(Base):
    __tablename__ = "relative_relationships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    relative_a_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("relatives.id", ondelete="CASCADE"), nullable=False
    )
    relative_b_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("relatives.id", ondelete="CASCADE"), nullable=False
    )
    relation_label: Mapped[str] = mapped_column(String(50), nullable=False)
    reverse_relation_label: Mapped[str | None] = mapped_column(String(50), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    strength: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User")
    relative_a = relationship("Relative", foreign_keys=[relative_a_id])
    relative_b = relationship("Relative", foreign_keys=[relative_b_id])


class ReminderEvent(Base):
    __tablename__ = "reminder_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    relative_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("relatives.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    advance_days: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User")
    relative = relationship("Relative")
