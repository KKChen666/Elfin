import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.agent import Agent
from app.models.conversation import Conversation, ConversationParticipant, Message
from app.schemas.conversation import (
    ConversationCreate,
    ConversationOut,
    ConversationUpdate,
    MessageCreate,
    MessageOut,
)
from app.services.llm_service import chat_completion, chat_completion_stream
from app.utils.auth import get_current_user
from app.utils.secrets import decrypt_secret, encrypt_secret, is_encrypted_secret

router = APIRouter(prefix="/api/conversations", tags=["对话系统"])


def _build_conversation_out(conv: Conversation, db: Session) -> ConversationOut:
    participants = []
    for p in conv.participants:
        participants.append({
            "agent_id": p.agent_id,
            "agent_name": p.agent.name,
            "agent_avatar": p.agent.avatar_url,
        })

    last_message = None
    if conv.messages:
        msg = conv.messages[-1]
        last_message = {
            "id": msg.id,
            "content": msg.content[:100],
            "sender_type": msg.sender_type,
            "created_at": msg.created_at.isoformat(),
        }

    return ConversationOut(
        id=conv.id,
        title=conv.title,
        type=conv.type,
        participants=participants,
        last_message=last_message,
        is_archived=conv.is_archived,
        archived_at=conv.archived_at,
        is_deleted=conv.is_deleted,
        deleted_at=conv.deleted_at,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
    )


@router.get("", response_model=list[ConversationOut])
def list_conversations(
    archived: bool = Query(default=False),
    deleted: bool = Query(default=False),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Conversation).filter(
        Conversation.user_id == user.id,
        Conversation.is_deleted == deleted,
    )
    if not deleted:
        query = query.filter(Conversation.is_archived == archived)

    convs = (
        query
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return [_build_conversation_out(c, db) for c in convs]


@router.post("", response_model=ConversationOut, status_code=201)
def create_conversation(
    data: ConversationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    agent_ids = list(dict.fromkeys(data.agent_ids))

    # 验证所有 agent 属于当前用户
    agents = db.query(Agent).filter(
        Agent.id.in_(agent_ids), Agent.user_id == user.id
    ).all()
    if len(agents) != len(agent_ids):
        raise HTTPException(status_code=400, detail="部分 Agent 不存在")

    # 确定对话类型
    conv_type = data.type if data.type in ("direct", "group") else "direct"
    if len(agent_ids) > 1:
        conv_type = "group"

    # 自动生成标题
    title = data.title
    if not title:
        if conv_type == "direct" and agents:
            title = f"与{agents[0].name}的对话"
        else:
            title = f"群聊：{'、'.join(a.name for a in agents[:3])}"

    conv = Conversation(
        user_id=user.id,
        title=title,
        type=conv_type,
    )
    db.add(conv)
    db.flush()

    # 添加参与者
    for agent_id in agent_ids:
        participant = ConversationParticipant(
            conversation_id=conv.id,
            agent_id=agent_id,
        )
        db.add(participant)

    db.commit()
    db.refresh(conv)
    return _build_conversation_out(conv, db)


@router.get("/{conv_id}", response_model=ConversationOut)
def get_conversation(
    conv_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.user_id == user.id,
        Conversation.is_deleted == False,  # noqa: E712
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    return _build_conversation_out(conv, db)


@router.patch("/{conv_id}", response_model=ConversationOut)
def update_conversation(
    conv_id: int,
    data: ConversationUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.user_id == user.id,
        Conversation.is_deleted == False,  # noqa: E712
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")

    if "title" in data.model_fields_set:
        title = data.title.strip() if data.title else ""
        conv.title = title or None

    if "is_archived" in data.model_fields_set and data.is_archived != conv.is_archived:
        conv.is_archived = data.is_archived
        conv.archived_at = datetime.utcnow() if data.is_archived else None

    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conv)
    return _build_conversation_out(conv, db)


@router.delete("/{conv_id}", status_code=204)
def delete_conversation(
    conv_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.user_id == user.id,
        Conversation.is_deleted == False,  # noqa: E712
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    conv.is_deleted = True
    conv.deleted_at = datetime.utcnow()
    conv.is_archived = True
    conv.archived_at = conv.archived_at or conv.deleted_at
    conv.updated_at = datetime.utcnow()
    db.commit()


@router.post("/{conv_id}/restore", response_model=ConversationOut)
def restore_deleted_conversation(
    conv_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.user_id == user.id,
        Conversation.is_deleted == True,  # noqa: E712
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    conv.is_deleted = False
    conv.deleted_at = None
    conv.is_archived = False
    conv.archived_at = None
    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conv)
    return _build_conversation_out(conv, db)


@router.get("/{conv_id}/messages", response_model=list[MessageOut])
def get_messages(
    conv_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.user_id == user.id,
        Conversation.is_deleted == False,  # noqa: E712
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    result = []
    for msg in messages:
        sender_name = None
        if msg.sender_type == "user":
            sender_name = "你"
        elif msg.sender_type == "agent":
            agent = db.query(Agent).filter(Agent.id == msg.sender_id).first()
            sender_name = agent.name if agent else "Agent"
        result.append(MessageOut(
            id=msg.id,
            conversation_id=msg.conversation_id,
            sender_type=msg.sender_type,
            sender_id=msg.sender_id,
            sender_name=sender_name,
            content=msg.content,
            metadata_json=msg.metadata_json,
            created_at=msg.created_at,
        ))
    return result


@router.post("/{conv_id}/messages", response_model=MessageOut)
def send_message(
    conv_id: int,
    data: MessageCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """用户发送消息"""
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.user_id == user.id,
        Conversation.is_deleted == False,  # noqa: E712
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")

    msg = Message(
        conversation_id=conv_id,
        sender_type="user",
        sender_id=user.id,
        content=data.content,
    )
    conv.updated_at = datetime.utcnow()
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return MessageOut(
        id=msg.id,
        conversation_id=msg.conversation_id,
        sender_type=msg.sender_type,
        sender_id=msg.sender_id,
        sender_name="你",
        content=msg.content,
        metadata_json=msg.metadata_json,
        created_at=msg.created_at,
    )


@router.post("/{conv_id}/messages/agent")
async def trigger_agent_reply(
    conv_id: int,
    agent_id: int | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """触发 Agent 回复（流式）"""
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.user_id == user.id,
        Conversation.is_deleted == False,  # noqa: E712
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")

    # 获取参与的 agents
    participants = conv.participants
    if not participants:
        raise HTTPException(status_code=400, detail="对话没有参与者")

    api_key = decrypt_secret(user.llm_api_key)
    if user.llm_api_key and api_key and not is_encrypted_secret(user.llm_api_key):
        user.llm_api_key = encrypt_secret(api_key)
        db.commit()

    llm_config = {
        "api_key": api_key,
        "api_base": user.llm_api_base,
        "model": user.llm_model,
        "timeout": user.llm_timeout,
    }

    # 如果指定了 agent_id，只让该 agent 回复
    if agent_id:
        target_participant = next(
            (p for p in participants if p.agent_id == agent_id), None
        )
        if not target_participant:
            raise HTTPException(status_code=400, detail="该 Agent 不在此对话中")
        target_agents = [target_participant.agent]
    else:
        # 群聊：选择性回复 - 根据最后一条消息决定哪个 agent 回复
        if conv.type == "group":
            target_agents = await _select_responding_agents(
                conv,
                participants,
                db,
                api_key=llm_config["api_key"],
                api_base=llm_config["api_base"],
                model=llm_config["model"] or "gpt-3.5-turbo",
                timeout=llm_config["timeout"],
            )
        else:
            target_agents = [participants[0].agent]

    # 预加载消息历史（在 session 关闭前）
    agents_data = []
    for agent in target_agents:
        messages = _build_messages_for_agent(conv, agent, db)
        agents_data.append({
            "agent_id": agent.id,
            "agent_name": agent.name,
            "messages": messages,
        })
    async def generate():
        # 在生成器内部创建新的 DB session
        from app.database import SessionLocal
        gen_db = SessionLocal()
        try:
            for agent_data in agents_data:
                agent_id_value = agent_data["agent_id"]
                agent_name = agent_data["agent_name"]
                messages = agent_data["messages"]

                # 流式生成回复
                full_response = ""
                async for chunk in chat_completion_stream(
                    messages,
                    api_key=llm_config["api_key"],
                    api_base=llm_config["api_base"],
                    model=llm_config["model"] or "gpt-3.5-turbo",
                    timeout=llm_config["timeout"],
                ):
                    full_response += chunk
                    yield f"data: {json.dumps({'agent_id': agent_id_value, 'agent_name': agent_name, 'content': chunk, 'done': False})}\n\n"

                # 保存 agent 回复
                msg = Message(
                    conversation_id=conv_id,
                    sender_type="agent",
                    sender_id=agent_id_value,
                    content=full_response,
                )
                conv_for_update = (
                    gen_db.query(Conversation)
                    .filter(Conversation.id == conv_id)
                    .first()
                )
                if conv_for_update:
                    conv_for_update.updated_at = datetime.utcnow()
                gen_db.add(msg)
                gen_db.commit()

                yield f"data: {json.dumps({'agent_id': agent_id_value, 'agent_name': agent_name, 'content': '', 'done': True})}\n\n"
        finally:
            gen_db.close()

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"X-Elfin-Mock-Llm": "true" if not api_key else "false"},
    )


async def _select_responding_agents(
    conv: Conversation,
    participants: list,
    db: Session,
    api_key: str | None = None,
    api_base: str | None = None,
    model: str = "gpt-3.5-turbo",
    timeout: int | None = None,
) -> list[Agent]:
    """群聊中选择性回复：根据话题相关性选择 agent"""
    last_user_msg = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id, Message.sender_type == "user")
        .order_by(Message.created_at.desc())
        .first()
    )
    if not last_user_msg:
        return [participants[0].agent]

    agents = [p.agent for p in participants if p.agent and p.agent.is_active]
    if not agents:
        return [participants[0].agent]

    heuristic_agents = _select_agents_by_heuristic(last_user_msg.content, agents)
    if not api_key:
        return heuristic_agents

    try:
        agent_lines = []
        for agent in agents:
            skill_names = []
            for agent_skill in agent.agent_skills or []:
                if agent_skill.skill:
                    skill_names.append(agent_skill.skill.name)
            agent_lines.append(
                f"- id={agent.id}; name={agent.name}; description={agent.description or '无'}; "
                f"skills={','.join(skill_names[:5]) or '无'}"
            )

        response = await chat_completion(
            [
                {
                    "role": "system",
                    "content": (
                        "你是群聊路由器。根据用户最后一条消息，选择最应该回复的 1-2 个 Agent。"
                        "只输出 JSON，例如 {\"agent_ids\":[1,2]}，不要解释。"
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"用户消息：{last_user_msg.content}\n\n"
                        f"可选 Agent：\n{chr(10).join(agent_lines)}"
                    ),
                },
            ],
            api_key=api_key,
            api_base=api_base,
            model=model,
            timeout=timeout,
            temperature=0.1,
            max_tokens=120,
        )
        selected_ids = _parse_selected_agent_ids(str(response))
        selected = [agent for agent in agents if agent.id in selected_ids][:2]
        return selected or heuristic_agents
    except Exception:
        return heuristic_agents


def _select_agents_by_heuristic(message: str, agents: list[Agent]) -> list[Agent]:
    normalized = message.lower()
    mentioned = [
        agent for agent in agents
        if agent.name and (agent.name.lower() in normalized or f"@{agent.name.lower()}" in normalized)
    ]
    if mentioned:
        return mentioned[:2]

    scored: list[tuple[int, Agent]] = []
    for agent in agents:
        keywords = set()
        for source in (agent.name, agent.description, agent.system_prompt):
            if source:
                keywords.update(token.lower() for token in _split_keywords(source))
        for agent_skill in agent.agent_skills or []:
            if agent_skill.skill:
                keywords.update(token.lower() for token in _split_keywords(agent_skill.skill.name))
                if agent_skill.skill.description:
                    keywords.update(token.lower() for token in _split_keywords(agent_skill.skill.description))
        score = sum(1 for keyword in keywords if len(keyword) >= 2 and keyword in normalized)
        if score > 0:
            scored.append((score, agent))

    if scored:
        scored.sort(key=lambda item: item[0], reverse=True)
        return [agent for _, agent in scored[:2]]

    return agents[:2]


def _split_keywords(value: str) -> list[str]:
    tokens = []
    current = []
    for char in value:
        if char.isalnum() or "\u4e00" <= char <= "\u9fff":
            current.append(char)
        elif current:
            tokens.append("".join(current))
            current = []
    if current:
        tokens.append("".join(current))
    chunks = []
    for token in tokens:
        chunks.append(token)
        if len(token) > 4 and any("\u4e00" <= char <= "\u9fff" for char in token):
            chunks.extend(token[index:index + 2] for index in range(len(token) - 1))
    return chunks


def _parse_selected_agent_ids(value: str) -> list[int]:
    try:
        parsed = json.loads(value)
        ids = parsed.get("agent_ids", parsed if isinstance(parsed, list) else [])
        return [int(item) for item in ids if str(item).isdigit()]
    except Exception:
        digits = []
        current = []
        for char in value:
            if char.isdigit():
                current.append(char)
            elif current:
                digits.append(int("".join(current)))
                current = []
        if current:
            digits.append(int("".join(current)))
        return digits


def _build_messages_for_agent(conv: Conversation, agent: Agent, db: Session) -> list[dict]:
    """为指定 agent 构建消息历史"""
    messages = []

    # 系统提示词
    system_prompt = agent.system_prompt or f"你是{agent.name}，一个 AI 助手。"
    messages.append({"role": "system", "content": system_prompt})

    # 获取最近的消息历史
    recent_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.created_at.desc())
        .limit(20)
        .all()
    )
    recent_messages.reverse()

    # 预加载所有 agent 信息用于群聊
    agent_cache: dict[int, str] = {}

    for msg in recent_messages:
        if msg.sender_type == "user":
            messages.append({"role": "user", "content": msg.content})
        elif msg.sender_type == "agent" and msg.sender_id == agent.id:
            messages.append({"role": "assistant", "content": msg.content})
        elif msg.sender_type == "agent" and conv.type == "group":
            # 群聊中：其他 agent 的消息作为带名字的 user 消息
            if msg.sender_id not in agent_cache:
                other_agent = db.query(Agent).filter(Agent.id == msg.sender_id).first()
                agent_cache[msg.sender_id] = other_agent.name if other_agent else "其他Agent"
            name = agent_cache[msg.sender_id]
            messages.append({"role": "user", "content": f"[{name}]: {msg.content}"})

    return messages

