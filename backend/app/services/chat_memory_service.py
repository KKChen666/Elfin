import math
import re
from collections import Counter

from sqlalchemy.orm import Session

from app.models.chat_message import ChatMemoryChunk
from app.services.vector_store import get_memory_vector_store, memory_vector_backend_status

VECTOR_SIZE = 96
TOKEN_RE = re.compile(r"[A-Za-z0-9]+|[\u4e00-\u9fff]{1,2}")


def rebuild_memory_chunks(
    db: Session,
    relative_id: int,
    messages: list[dict],
    target_sender: str,
) -> int:
    db.query(ChatMemoryChunk).filter(ChatMemoryChunk.relative_id == relative_id).delete()

    chunks: list[ChatMemoryChunk] = []
    for index, message in enumerate(messages):
        if message.get("sender") != target_sender:
            continue

        reply = message.get("content", "").strip()
        if not reply:
            continue

        before = messages[max(0, index - 3):index]
        after = messages[index + 1:index + 2]
        trigger = ""
        for item in reversed(before):
            if item.get("sender") != target_sender:
                trigger = item.get("content", "")
                break

        chunk = ChatMemoryChunk(
            relative_id=relative_id,
            speaker=target_sender,
            trigger_text=trigger or None,
            reply_text=reply,
            context_before=[
                {"sender": item.get("sender"), "content": item.get("content")}
                for item in before
            ],
            context_after=[
                {"sender": item.get("sender"), "content": item.get("content")}
                for item in after
            ],
            tags=_infer_tags(trigger, reply),
            embedding=embed_text(_memory_text(trigger, reply, before)),
        )
        db.add(chunk)
        chunks.append(chunk)

    db.commit()
    for chunk in chunks:
        db.refresh(chunk)

    get_memory_vector_store().rebuild_relative(relative_id, chunks)
    return len(chunks)


def retrieve_memory_chunks(
    db: Session,
    relative_id: int,
    query: str,
    limit: int = 5,
) -> list[ChatMemoryChunk]:
    query_embedding = embed_text(query)
    hits = get_memory_vector_store().search(db, relative_id, query_embedding, limit)
    if not hits:
        return []

    chunk_ids = [hit.chunk_id for hit in hits]
    chunks = (
        db.query(ChatMemoryChunk)
        .filter(ChatMemoryChunk.id.in_(chunk_ids))
        .all()
    )
    chunk_by_id = {chunk.id: chunk for chunk in chunks}
    return [chunk_by_id[chunk_id] for chunk_id in chunk_ids if chunk_id in chunk_by_id]


def get_memory_backend_status() -> dict[str, str | bool]:
    return memory_vector_backend_status()


def embed_text(text: str) -> list[float]:
    tokens = _tokenize(text)
    if not tokens:
        return [0.0] * VECTOR_SIZE

    counts = Counter(tokens)
    vector = [0.0] * VECTOR_SIZE
    for token, count in counts.items():
        index = _stable_hash(token) % VECTOR_SIZE
        vector[index] += 1.0 + math.log(count)

    norm = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [round(value / norm, 6) for value in vector]


def _memory_text(trigger: str, reply: str, before: list[dict]) -> str:
    context = " ".join(item.get("content", "") for item in before[-2:])
    return f"场景：{context} 用户：{trigger} 回复：{reply}"


def _tokenize(text: str) -> list[str]:
    lowered = text.lower()
    raw_tokens = TOKEN_RE.findall(lowered)
    tokens: list[str] = []
    for token in raw_tokens:
        tokens.append(token)
        if len(token) > 2 and any("\u4e00" <= char <= "\u9fff" for char in token):
            tokens.extend(token[index:index + 2] for index in range(len(token) - 1))
    return tokens


def _stable_hash(value: str) -> int:
    result = 2166136261
    for char in value:
        result ^= ord(char)
        result = (result * 16777619) & 0xFFFFFFFF
    return result


def _infer_tags(trigger: str, reply: str) -> list[str]:
    text = f"{trigger} {reply}"
    tags = []
    if any(word in text for word in ["早", "你好", "在吗", "嗨", "hello", "hi"]):
        tags.append("问候")
    if any(word in text for word in ["晚安", "拜拜", "再见", "下次"]):
        tags.append("告别")
    if any(word in text for word in ["吗", "？", "?", "怎么", "为什么"]):
        tags.append("提问")
    if any(word in text for word in ["哈哈", "笑死", "😂", "🤣"]):
        tags.append("玩笑")
    if any(word in text for word in ["累", "难过", "烦", "辛苦", "抱抱"]):
        tags.append("安慰")
    return tags or ["日常"]
