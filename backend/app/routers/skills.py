from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.skill import Skill
from app.models.relative import Relative
from app.schemas.skill import SkillCreate, SkillUpdate, SkillOut
from app.services.skill_creator_service import create_skill_from_materials
from app.services.distill_service import distill_from_relative, merge_skills
from app.utils.auth import get_current_user


class MergeRequest(BaseModel):
    skill_ids: list[int]
    new_name: str

router = APIRouter(prefix="/api/skills", tags=["技能管理"])


@router.get("", response_model=list[SkillOut])
def list_skills(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skills = db.query(Skill).filter(Skill.user_id == user.id).order_by(Skill.created_at.desc()).all()
    return [SkillOut.model_validate(s) for s in skills]


@router.post("", response_model=SkillOut, status_code=201)
def create_skill(
    data: SkillCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.source_relative_id is not None:
        relative = (
            db.query(Relative)
            .filter(Relative.id == data.source_relative_id, Relative.user_id == user.id)
            .first()
        )
        if not relative:
            raise HTTPException(status_code=404, detail="亲友不存在")

    skill = Skill(user_id=user.id, **data.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return SkillOut.model_validate(skill)


@router.post("/creator", response_model=SkillOut, status_code=201)
async def create_skill_with_creator(
    name: str = Form(...),
    goal: str = Form(...),
    description: str | None = Form(default=None),
    raw_text: str | None = Form(default=None),
    debug_cases: str | None = Form(default=None),
    files: list[UploadFile] = File(default=[]),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a reusable AI skill from notes, chat records, PDFs, images, and debug cases."""
    if not name.strip():
        raise HTTPException(status_code=400, detail="Skill name is required")
    if not goal.strip():
        raise HTTPException(status_code=400, detail="Skill goal is required")
    try:
        skill = await create_skill_from_materials(
            db=db,
            user_id=user.id,
            name=name,
            goal=goal,
            description=description,
            raw_text=raw_text,
            debug_cases=debug_cases,
            files=files,
        )
        return SkillOut.model_validate(skill)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{skill_id}", response_model=SkillOut)
def get_skill(
    skill_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="技能不存在")
    return SkillOut.model_validate(skill)


@router.put("/{skill_id}", response_model=SkillOut)
def update_skill(
    skill_id: int,
    data: SkillUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="技能不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(skill, key, value)
    db.flush()
    # 级联更新：刷新所有使用该 Skill 的 Agent 的 prompt
    _cascade_refresh_agents(db, skill)
    db.commit()
    db.refresh(skill)
    return SkillOut.model_validate(skill)


def _cascade_refresh_agents(db: Session, skill: Skill):
    """Skill 更新后，刷新所有关联 Agent 的 prompt"""
    from app.models.agent import AgentSkill
    agent_skills = db.query(AgentSkill).filter(AgentSkill.skill_id == skill.id).all()
    for agent_skill in agent_skills:
        agent = agent_skill.agent
        # 重新收集所有 skill 的 prompt
        prompts = []
        for as_item in agent.agent_skills:
            s = as_item.skill
            p = s.system_prompt
            if not p:
                # 从结构化数据生成
                parts = []
                if s.personality:
                    parts.append(f"性格：{s.personality.get('type', '均衡型')}")
                if s.communication_style:
                    parts.append(f"风格：{s.communication_style.get('language_style', 'mixed')}")
                p = "；".join(parts) if parts else None
            if p:
                prompts.append(p)
        agent.system_prompt = "\n\n---\n\n".join(prompts) if prompts else None


@router.delete("/{skill_id}", status_code=204)
def delete_skill(
    skill_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="技能不存在")
    db.delete(skill)
    db.commit()


@router.post("/distill/{relative_id}", response_model=SkillOut)
def distill_skill(
    relative_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """从亲友聊天记录蒸馏技能"""
    try:
        skill = distill_from_relative(db, user.id, relative_id)
        return SkillOut.model_validate(skill)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/merge", response_model=SkillOut)
def merge_skill_endpoint(
    data: MergeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """合并多个技能"""
    try:
        skill = merge_skills(db, user.id, data.skill_ids, data.new_name)
        return SkillOut.model_validate(skill)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
