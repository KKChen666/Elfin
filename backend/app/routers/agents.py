from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.agent import Agent, AgentSkill
from app.models.skill import Skill
from app.schemas.agent import AgentCreate, AgentUpdate, AgentSkillAdd, AgentOut
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/agents", tags=["Agent管理"])


def _build_agent_out(agent: Agent) -> AgentOut:
    """构建 AgentOut，包含关联的 skills"""
    skills_data = []
    for agent_skill in agent.agent_skills:
        skill = agent_skill.skill
        skills_data.append({
            "id": skill.id,
            "name": skill.name,
            "weight": agent_skill.weight,
        })
    return AgentOut(
        id=agent.id,
        name=agent.name,
        description=agent.description,
        avatar_url=agent.avatar_url,
        system_prompt=agent.system_prompt,
        config=agent.config,
        is_active=agent.is_active,
        skills=skills_data,
        created_at=agent.created_at,
        updated_at=agent.updated_at,
    )


@router.get("", response_model=list[AgentOut])
def list_agents(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    agents = db.query(Agent).filter(Agent.user_id == user.id).order_by(Agent.created_at.desc()).all()
    return [_build_agent_out(a) for a in agents]


@router.post("", response_model=AgentOut, status_code=201)
def create_agent(
    data: AgentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill_ids = data.skill_ids or []
    agent_data = data.model_dump(exclude={"skill_ids"})

    # 如果没有指定 system_prompt，从关联的 skills 生成
    if not agent_data.get("system_prompt") and skill_ids:
        skills = db.query(Skill).filter(
            Skill.id.in_(skill_ids), Skill.user_id == user.id
        ).all()
        prompts = [s.system_prompt for s in skills if s.system_prompt]
        agent_data["system_prompt"] = "\n\n---\n\n".join(prompts) if prompts else None

    agent = Agent(user_id=user.id, **agent_data)
    db.add(agent)
    db.flush()

    # 关联 skills
    for skill_id in skill_ids:
        agent_skill = AgentSkill(agent_id=agent.id, skill_id=skill_id)
        db.add(agent_skill)

    db.commit()
    db.refresh(agent)
    return _build_agent_out(agent)


@router.get("/{agent_id}", response_model=AgentOut)
def get_agent(
    agent_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.user_id == user.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent不存在")
    return _build_agent_out(agent)


@router.put("/{agent_id}", response_model=AgentOut)
def update_agent(
    agent_id: int,
    data: AgentUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.user_id == user.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(agent, key, value)
    db.commit()
    db.refresh(agent)
    return _build_agent_out(agent)


@router.delete("/{agent_id}", status_code=204)
def delete_agent(
    agent_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.user_id == user.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent不存在")
    db.delete(agent)
    db.commit()


@router.post("/{agent_id}/skills", response_model=AgentOut)
def add_skill_to_agent(
    agent_id: int,
    data: AgentSkillAdd,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.user_id == user.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent不存在")
    skill = db.query(Skill).filter(Skill.id == data.skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="技能不存在")

    existing = db.query(AgentSkill).filter(
        AgentSkill.agent_id == agent_id, AgentSkill.skill_id == data.skill_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="该技能已关联")

    agent_skill = AgentSkill(agent_id=agent_id, skill_id=data.skill_id, weight=data.weight)
    db.add(agent_skill)

    # 更新 system_prompt
    _refresh_agent_prompt(db, agent)

    db.commit()
    db.refresh(agent)
    return _build_agent_out(agent)


@router.delete("/{agent_id}/skills/{skill_id}", status_code=204)
def remove_skill_from_agent(
    agent_id: int,
    skill_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.user_id == user.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent不存在")
    agent_skill = db.query(AgentSkill).filter(
        AgentSkill.agent_id == agent_id, AgentSkill.skill_id == skill_id
    ).first()
    if not agent_skill:
        raise HTTPException(status_code=404, detail="关联关系不存在")
    db.delete(agent_skill)
    db.flush()  # 确保删除操作生效

    # 更新 system_prompt
    _refresh_agent_prompt(db, agent)

    db.commit()


def _refresh_agent_prompt(db: Session, agent: Agent):
    """重新生成 Agent 的 system_prompt（考虑权重）"""
    # 按权重排序，高权重的 prompt 放在前面
    sorted_skills = sorted(
        agent.agent_skills,
        key=lambda x: x.weight,
        reverse=True,
    )
    prompts = []
    for agent_skill in sorted_skills:
        skill = agent_skill.skill
        prompt = skill.system_prompt
        if not prompt:
            # 手动创建的 Skill 没有 system_prompt 时，从结构化数据生成
            prompt = _build_prompt_from_skill_data(skill)
        if prompt:
            # 高权重的 prompt 重复强调
            if agent_skill.weight >= 2.0:
                prompts.append(f"[重要] {prompt}")
            else:
                prompts.append(prompt)
    agent.system_prompt = "\n\n---\n\n".join(prompts) if prompts else None


def _build_prompt_from_skill_data(skill) -> str | None:
    """从 Skill 的结构化数据生成 prompt"""
    parts = []
    if skill.personality:
        ptype = skill.personality.get("type", "均衡型")
        parts.append(f"性格类型：{ptype}")
        traits = skill.personality.get("traits", [])
        if traits:
            parts.append(f"表达特点：{'、'.join(traits[:5])}")
    if skill.communication_style:
        style = skill.communication_style.get("language_style", "mixed")
        parts.append(f"语言风格：{style}")
        tone = skill.communication_style.get("tone_words", [])
        if tone:
            parts.append(f"常用语气词：{'、'.join(tone[:5])}")
    if skill.knowledge_domains:
        parts.append(f"常聊话题：{'、'.join(skill.knowledge_domains[:5])}")
    return "；".join(parts) if parts else None
