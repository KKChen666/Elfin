from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    system_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # 关系
    user = relationship("User")
    agent_skills = relationship("AgentSkill", back_populates="agent", cascade="all, delete-orphan")
    participants = relationship("ConversationParticipant", back_populates="agent")


class AgentSkill(Base):
    __tablename__ = "agent_skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False
    )
    weight: Mapped[float] = mapped_column(default=1.0)

    # 关系
    agent = relationship("Agent", back_populates="agent_skills")
    skill = relationship("Skill", back_populates="agent_skills")
