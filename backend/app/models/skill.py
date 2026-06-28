from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="manual"
    )  # chat_import, manual, merge
    source_relative_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("relatives.id", ondelete="SET NULL"), nullable=True
    )
    # 蒸馏出的核心数据
    personality: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    communication_style: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    knowledge_domains: Mapped[list | None] = mapped_column(JSON, nullable=True)
    expression_patterns: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    memory_tree: Mapped[list | None] = mapped_column(JSON, nullable=True)
    system_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # 关系
    user = relationship("User")
    source_relative = relationship("Relative")
    agent_skills = relationship("AgentSkill", back_populates="skill", cascade="all, delete-orphan")
