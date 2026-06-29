import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.agent import Agent
from app.models.conversation import Conversation, ConversationParticipant, Message
from app.schemas.conversation import ConversationCreate, ConversationOut, MessageCreate, MessageOut
from app.services.llm_service import chat_completion_stream
from app.utils.auth import get_current_user

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
        created_at=conv.created_at,
        updated_at=conv.updated_at,
    )


@router.get("", response_model=list[ConversationOut])
def list_conversations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == user.id)
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
        Conversation.id == conv_id, Conversation.user_id == user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    return _build_conversation_out(conv, db)


@router.delete("/{conv_id}", status_code=204)
def delete_conversation(
    conv_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id, Conversation.user_id == user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    db.delete(conv)
    db.commit()


@router.get("/{conv_id}/messages", response_model=list[MessageOut])
def get_messages(
    conv_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id, Conversation.user_id == user.id
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
        Conversation.id == conv_id, Conversation.user_id == user.id
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
        Conversation.id == conv_id, Conversation.user_id == user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")

    # 获取参与的 agents
    participants = conv.participants
    if not participants:
        raise HTTPException(status_code=400, detail="对话没有参与者")

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
            target_agents = _select_responding_agents(conv, participants, db)
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
                async for chunk in chat_completion_stream(messages):
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

    return StreamingResponse(generate(), media_type="text/event-stream")


def _select_responding_agents(
    conv: Conversation,
    participants: list,
    db: Session,
) -> list[Agent]:
    """群聊中选择性回复：根据话题相关性选择 agent"""
    # 获取最后一条用户消息
    last_user_msg = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id, Message.sender_type == "user")
        .order_by(Message.created_at.desc())
        .first()
    )
    if not last_user_msg:
        return [participants[0].agent]

    # 简单策略：所有 agent 都回复（后续可以加入 LLM 判断相关性）
    # TODO: 用 LLM 判断哪些 agent 应该回复
    return [p.agent for p in participants[:2]]  # 最多2个 agent 回复


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
