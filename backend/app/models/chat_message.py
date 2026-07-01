from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    relative_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("relatives.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    sender: Mapped[str] = mapped_column(
        SAEnum("user", "avatar", name="sender_enum"), nullable=False
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # 关系
    relative = relationship("Relative", back_populates="chat_messages")


class ChatMemoryChunk(Base):
    __tablename__ = "chat_memory_chunks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    relative_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("relatives.id", ondelete="CASCADE"), nullable=False
    )
    speaker: Mapped[str] = mapped_column(String(100), nullable=False)
    trigger_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    reply_text: Mapped[str] = mapped_column(Text, nullable=False)
    context_before: Mapped[list | None] = mapped_column(JSON, nullable=True)
    context_after: Mapped[list | None] = mapped_column(JSON, nullable=True)
    tags: Mapped[list | None] = mapped_column(JSON, nullable=True)
    embedding: Mapped[list] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
