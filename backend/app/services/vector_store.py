import logging
import math
import os
import shutil
from dataclasses import dataclass
from typing import Any, Protocol

from sqlalchemy.orm import Session

from app.config import settings
from app.models.chat_message import ChatMemoryChunk

logger = logging.getLogger(__name__)
VECTOR_FIELD = "embedding"


@dataclass(frozen=True)
class VectorSearchHit:
    chunk_id: int
    score: float


class MemoryVectorStore(Protocol):
    def rebuild_relative(self, relative_id: int, chunks: list[ChatMemoryChunk]) -> None:
        ...

    def search(
        self,
        db: Session,
        relative_id: int,
        query_embedding: list[float],
        limit: int,
    ) -> list[VectorSearchHit]:
        ...


class SqlMemoryVectorStore:
    def rebuild_relative(self, relative_id: int, chunks: list[ChatMemoryChunk]) -> None:
        return None

    def search(
        self,
        db: Session,
        relative_id: int,
        query_embedding: list[float],
        limit: int,
    ) -> list[VectorSearchHit]:
        chunks = (
            db.query(ChatMemoryChunk)
            .filter(ChatMemoryChunk.relative_id == relative_id)
            .all()
        )
        hits = [
            VectorSearchHit(chunk.id, _cosine_similarity(query_embedding, chunk.embedding or []))
            for chunk in chunks
        ]
        hits = [hit for hit in hits if hit.score > 0]
        hits.sort(key=lambda hit: hit.score, reverse=True)
        return hits[:limit]


class ZvecMemoryVectorStore:
    def __init__(self) -> None:
        self._collection: Any | None = None
        self._disabled_reason: str | None = None

    def rebuild_relative(self, relative_id: int, chunks: list[ChatMemoryChunk]) -> None:
        collection = self._get_collection()
        if collection is None:
            return

        try:
            collection.delete_by_filter(f"relative_id = {relative_id}")
        except Exception:
            logger.exception("Failed to clear Zvec memory index for relative %s", relative_id)

        zvec = _import_zvec()
        docs = [
            zvec.Doc(
                id=str(chunk.id),
                vectors={VECTOR_FIELD: chunk.embedding},
                fields={
                    "relative_id": int(relative_id),
                    "trigger": chunk.trigger_text or "",
                    "reply": chunk.reply_text,
                },
            )
            for chunk in chunks
            if chunk.id and chunk.embedding
        ]
        if not docs:
            return

        try:
            collection.upsert(docs)
            collection.flush()
        except Exception:
            logger.exception("Failed to rebuild Zvec memory index for relative %s", relative_id)

    def search(
        self,
        db: Session,
        relative_id: int,
        query_embedding: list[float],
        limit: int,
    ) -> list[VectorSearchHit]:
        collection = self._get_collection()
        if collection is None:
            return _sql_store.search(db, relative_id, query_embedding, limit)

        try:
            zvec = _import_zvec()
            raw_hits = collection.query(
                zvec.Query(VECTOR_FIELD, vector=query_embedding),
                topk=limit,
                filter=f"relative_id = {relative_id}",
                output_fields=["relative_id"],
            )
            hits = _normalize_hits(raw_hits)
            return hits or _sql_store.search(db, relative_id, query_embedding, limit)
        except Exception:
            logger.exception("Failed to search Zvec memory index for relative %s", relative_id)
            return _sql_store.search(db, relative_id, query_embedding, limit)

    def _get_collection(self) -> Any | None:
        if self._disabled_reason:
            return None
        if self._collection is not None:
            return self._collection

        try:
            zvec = _import_zvec()
        except Exception as exc:
            self._disabled_reason = "zvec package is not installed"
            logger.warning("%s: %s", self._disabled_reason, exc)
            return None

        try:
            self._collection = _open_zvec_collection(zvec)
            return self._collection
        except Exception as exc:
            self._disabled_reason = f"failed to open Zvec collection: {exc}"
            logger.warning(self._disabled_reason)
            return None


def get_memory_vector_store() -> MemoryVectorStore:
    if settings.MEMORY_VECTOR_BACKEND == "zvec":
        return _zvec_store
    return _sql_store


def memory_vector_backend_status() -> dict[str, str | bool]:
    store = get_memory_vector_store()
    if isinstance(store, ZvecMemoryVectorStore):
        collection = store._get_collection()
        if collection is None:
            return {
                "backend": "zvec",
                "available": False,
                "reason": store._disabled_reason or "unknown",
            }
        return {"backend": "zvec", "available": True}
    return {"backend": "sql", "available": True}


def _open_zvec_collection(zvec: Any) -> Any:
    vector_size = 96
    path = settings.ZVEC_MEMORY_PATH

    if os.path.exists(path):
        return zvec.open(path)

    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)

    try:
        vector_index = zvec.HnswIndexParam(metric_type=zvec.MetricType.COSINE)
    except Exception:
        vector_index = zvec.FlatIndexParam(metric_type=zvec.MetricType.COSINE)

    schema = zvec.CollectionSchema(
        "elfin_memory_chunks",
        fields=[
            zvec.FieldSchema("relative_id", zvec.DataType.INT64),
            zvec.FieldSchema("trigger", zvec.DataType.STRING, nullable=True),
            zvec.FieldSchema("reply", zvec.DataType.STRING, nullable=True),
        ],
        vectors=[
            zvec.VectorSchema(
                VECTOR_FIELD,
                zvec.DataType.VECTOR_FP32,
                vector_size,
                vector_index,
            )
        ],
    )

    try:
        return zvec.create_and_open(path, schema)
    except Exception:
        if os.path.exists(path):
            shutil.rmtree(path, ignore_errors=True)
        raise


def _import_zvec() -> Any:
    import zvec  # type: ignore

    return zvec


def _normalize_hits(raw_hits: Any) -> list[VectorSearchHit]:
    if raw_hits is None:
        return []

    if hasattr(raw_hits, "to_list"):
        raw_hits = raw_hits.to_list()
    elif hasattr(raw_hits, "items"):
        raw_hits = raw_hits.items

    hits: list[VectorSearchHit] = []
    for item in raw_hits if isinstance(raw_hits, list) else list(raw_hits):
        chunk_id = _extract_value(item, ["id", "chunk_id", "primary_key", "pk"])
        if chunk_id is None:
            continue
        score = _extract_value(item, ["score", "distance", "similarity"])
        score_value = float(score) if score is not None else 0.0
        if "distance" in _keys(item) or "score" in _keys(item):
            score_value = 1.0 / (1.0 + max(score_value, 0.0))
        hits.append(VectorSearchHit(int(chunk_id), score_value))
    hits.sort(key=lambda hit: hit.score, reverse=True)
    return hits


def _extract_value(item: Any, names: list[str]) -> Any:
    for name in names:
        if isinstance(item, dict) and name in item:
            return item[name]
        value = getattr(item, name, None)
        if value is not None:
            return value
    return None


def _keys(item: Any) -> set[str]:
    if isinstance(item, dict):
        return set(item.keys())
    return set(dir(item))


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    norm_a = math.sqrt(sum(value * value for value in a)) or 1.0
    norm_b = math.sqrt(sum(value * value for value in b)) or 1.0
    return sum(x * y for x, y in zip(a, b)) / (norm_a * norm_b)


_sql_store = SqlMemoryVectorStore()
_zvec_store = ZvecMemoryVectorStore()
