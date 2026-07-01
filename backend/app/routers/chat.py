from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.relative import Relative
from app.models.chat_message import ChatMessage
from app.schemas.chat import ChatMessageCreate, ChatMessageOut, AvatarResponseOut, ChatStyleOut
from app.services.avatar_response import generate_avatar_response
from app.services.chat_analysis import parse_chat_file, identify_speakers, analyze_chat_style
from app.services.chat_memory_service import (
    get_memory_backend_status,
    rebuild_memory_chunks,
    retrieve_memory_chunks,
)
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/relatives/{relative_id}/messages", tags=["聊天"])


def _get_relative(db: Session, user: User, relative_id: int) -> Relative:
    relative = (
        db.query(Relative)
        .filter(Relative.id == relative_id, Relative.user_id == user.id)
        .first()
    )
    if not relative:
        raise HTTPException(status_code=404, detail="亲友不存在")
    return relative


@router.get("", response_model=list[ChatMessageOut])
def get_messages(
    relative_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_relative(db, user, relative_id)
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.relative_id == relative_id)
        .order_by(ChatMessage.timestamp.asc())
        .all()
    )
    return [ChatMessageOut.model_validate(m) for m in messages]


@router.post("", response_model=ChatMessageOut, status_code=201)
def add_message(
    relative_id: int,
    data: ChatMessageCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_relative(db, user, relative_id)
    msg = ChatMessage(
        relative_id=relative_id,
        content=data.content,
        sender=data.sender,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return ChatMessageOut.model_validate(msg)


@router.delete("", status_code=204)
def clear_messages(
    relative_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_relative(db, user, relative_id)
    db.query(ChatMessage).filter(ChatMessage.relative_id == relative_id).delete()
    db.commit()


@router.post("/respond", response_model=AvatarResponseOut)
def avatar_respond(
    relative_id: int,
    data: ChatMessageCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """生成 AI 分身回复"""
    relative = _get_relative(db, user, relative_id)

    # 保存用户消息
    last_message = (
        db.query(ChatMessage)
        .filter(ChatMessage.relative_id == relative_id)
        .order_by(ChatMessage.timestamp.desc())
        .first()
    )
    if not (
        last_message
        and last_message.sender == "user"
        and last_message.content == data.content
    ):
        user_msg = ChatMessage(
            relative_id=relative_id,
            content=data.content,
            sender="user",
        )
        db.add(user_msg)
        db.commit()

    # 获取最近消息作为上下文
    recent = (
        db.query(ChatMessage)
        .filter(ChatMessage.relative_id == relative_id)
        .order_by(ChatMessage.timestamp.desc())
        .limit(10)
        .all()
    )
    recent_dicts = [{"content": m.content, "sender": m.sender} for m in reversed(recent)]
    memory_chunks = retrieve_memory_chunks(db, relative_id, data.content, limit=5)

    # 生成回复
    reply = generate_avatar_response(
        data.content,
        relative.chat_style,
        recent_dicts,
        memory_chunks=[
            {
                "trigger": chunk.trigger_text,
                "reply": chunk.reply_text,
                "context_before": chunk.context_before or [],
                "tags": chunk.tags or [],
            }
            for chunk in memory_chunks
        ],
    )

    # 保存 avatar 回复
    avatar_msg = ChatMessage(
        relative_id=relative_id,
        content=reply,
        sender="avatar",
    )
    db.add(avatar_msg)
    db.commit()

    return AvatarResponseOut(content=reply)


chat_style_router = APIRouter(prefix="/api/relatives/{relative_id}/chat-style", tags=["聊天分析"])


def _choose_target_speaker(
    relative_name: str,
    speaker1: str,
    speaker2: str,
    requested_target: str | None = None,
) -> str:
    speakers = [speaker1, speaker2]
    if requested_target:
        if requested_target not in speakers:
            raise HTTPException(status_code=400, detail="指定的说话人不在聊天记录中")
        return requested_target

    if relative_name in speakers:
        return relative_name

    self_aliases = {"我", "本人", "自己", "me", "Me", "ME"}
    for speaker in speakers:
        if speaker in self_aliases:
            return speaker2 if speaker == speaker1 else speaker1

    return speaker1


@chat_style_router.post("/upload", response_model=ChatStyleOut)
async def upload_and_analyze(
    relative_id: int,
    file: UploadFile = File(...),
    target_sender: str | None = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """上传聊天记录文件，后端分析并保存 ChatStyle"""
    relative = _get_relative(db, user, relative_id)

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="聊天记录文件大小不能超过 10MB")

    text = content.decode("utf-8", errors="ignore")

    messages = parse_chat_file(text)
    if not messages:
        raise HTTPException(status_code=400, detail="无法解析聊天记录，请检查格式")

    speaker1, speaker2 = identify_speakers(messages)
    # 默认分析亲友；如果无法判断，则回退到发言最多的一方
    target = _choose_target_speaker(relative.name, speaker1, speaker2, target_sender)

    chat_style = analyze_chat_style(messages, target)
    memory_count = rebuild_memory_chunks(db, relative_id, messages, target)
    chat_style["memoryChunkCount"] = memory_count

    relative.chat_style = chat_style
    db.commit()
    db.refresh(relative)

    return ChatStyleOut(chat_style=chat_style)


@chat_style_router.get("", response_model=ChatStyleOut)
def get_chat_style(
    relative_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    relative = _get_relative(db, user, relative_id)
    if not relative.chat_style:
        raise HTTPException(status_code=404, detail="尚未导入聊天风格")
    return ChatStyleOut(chat_style=relative.chat_style)


@chat_style_router.get("/memory-backend")
def get_memory_backend(
    relative_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_relative(db, user, relative_id)
    return get_memory_backend_status()
