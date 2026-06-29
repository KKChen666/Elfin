from __future__ import annotations

import io
import json
import re
import zipfile
from dataclasses import dataclass
from xml.etree import ElementTree

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.skill import Skill
from app.services.llm_service import chat_completion


MAX_FILE_BYTES = 4 * 1024 * 1024
MAX_TOTAL_TEXT = 24000


@dataclass
class Material:
    name: str
    kind: str
    summary: str
    text: str


async def create_skill_from_materials(
    db: Session,
    user_id: int,
    name: str,
    goal: str,
    description: str | None,
    raw_text: str | None,
    debug_cases: str | None,
    files: list[UploadFile],
) -> Skill:
    materials = []
    if raw_text and raw_text.strip():
        materials.append(
            Material(
                name="pasted-material",
                kind="text",
                summary="User-pasted notes, chat records, requirements, or debugging context.",
                text=_clip(raw_text.strip(), 9000),
            )
        )

    for file in files:
        materials.append(await _read_upload(file))

    skill_payload = await _generate_skill_payload(
        name=name,
        goal=goal,
        description=description,
        materials=materials,
        debug_cases=debug_cases,
    )

    skill = Skill(
        user_id=user_id,
        name=skill_payload["name"],
        description=skill_payload["description"],
        source_type="creator",
        personality={
            "type": "agent_skill",
            "traits": skill_payload["triggers"],
            "sentiment": "neutral",
        },
        communication_style={
            "workflow": skill_payload["workflow"],
            "inputs": skill_payload["inputs"],
            "outputs": skill_payload["outputs"],
            "validation": skill_payload["validation"],
        },
        knowledge_domains=skill_payload["knowledge_domains"],
        expression_patterns={
            "guardrails": skill_payload["guardrails"],
            "examples": skill_payload["examples"],
            "debug_cases": skill_payload["debug_cases"],
            "source_materials": [
                {"name": item.name, "kind": item.kind, "summary": item.summary}
                for item in materials
            ],
        },
        memory_tree=skill_payload["memory_tree"],
        system_prompt=skill_payload["system_prompt"],
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


async def _read_upload(file: UploadFile) -> Material:
    content = await file.read()
    name = file.filename or "upload"
    kind = _guess_kind(name, file.content_type)

    if len(content) > MAX_FILE_BYTES:
        return Material(
            name=name,
            kind=kind,
            summary=f"File was larger than {MAX_FILE_BYTES // 1024 // 1024}MB; only metadata was used.",
            text="",
        )

    text = ""
    if kind == "pdf":
        text = _extract_pdf_text(content)
    elif kind == "docx":
        text = _extract_docx_text(content)
    elif kind == "image":
        text = ""
    else:
        text = _decode_text(content)

    summary = _summarize_material(name, kind, text)
    return Material(name=name, kind=kind, summary=summary, text=_clip(text, 6000))


def _guess_kind(filename: str, content_type: str | None) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf") or content_type == "application/pdf":
        return "pdf"
    if lower.endswith(".docx"):
        return "docx"
    if content_type and content_type.startswith("image/"):
        return "image"
    if lower.endswith((".txt", ".md", ".json", ".csv", ".log", ".yaml", ".yml")):
        return "text"
    return "file"


def _decode_text(content: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-8", "gb18030", "latin-1"):
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            continue
    return ""


def _extract_pdf_text(content: bytes) -> str:
    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(content))
        pages = []
        for page in reader.pages[:20]:
            pages.append(page.extract_text() or "")
        return "\n\n".join(pages).strip()
    except Exception:
        return ""


def _extract_docx_text(content: bytes) -> str:
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            xml = archive.read("word/document.xml")
        root = ElementTree.fromstring(xml)
        namespace = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
        paragraphs = []
        for paragraph in root.iter(f"{namespace}p"):
            chunks = [node.text or "" for node in paragraph.iter(f"{namespace}t")]
            if chunks:
                paragraphs.append("".join(chunks))
        return "\n".join(paragraphs).strip()
    except Exception:
        return ""


def _summarize_material(name: str, kind: str, text: str) -> str:
    if kind == "image":
        return "Image attachment. Use filename and user notes as visual context unless a vision model is added."
    if text:
        clean = re.sub(r"\s+", " ", text).strip()
        return _clip(clean, 240)
    return "No extractable text; preserve file name and type as source evidence."


async def _generate_skill_payload(
    name: str,
    goal: str,
    description: str | None,
    materials: list[Material],
    debug_cases: str | None,
) -> dict:
    context = _build_context(goal, description, materials, debug_cases)
    messages = [
        {
            "role": "system",
            "content": (
                "You create reusable AI agent skills. Return strict JSON only. "
                "The skill should help another AI perform and debug the described workflow. "
                "Keep instructions operational, testable, and concise."
            ),
        },
        {
            "role": "user",
            "content": (
                "Create a skill payload with these JSON keys: name, description, "
                "triggers, inputs, outputs, workflow, guardrails, validation, "
                "knowledge_domains, examples, debug_cases, memory_tree, system_prompt.\n\n"
                f"Requested skill name: {name}\n\n{context}"
            ),
        },
    ]

    try:
        content = await chat_completion(messages, temperature=0.25, max_tokens=2200)
        parsed = _parse_json(str(content))
        return _normalize_payload(parsed, name, goal, description, materials, debug_cases)
    except Exception:
        return _fallback_payload(name, goal, description, materials, debug_cases)


def _build_context(
    goal: str,
    description: str | None,
    materials: list[Material],
    debug_cases: str | None,
) -> str:
    chunks = [
        "GOAL:",
        goal.strip(),
        "",
        "DESCRIPTION:",
        (description or "").strip(),
        "",
        "DEBUG CASES:",
        (debug_cases or "").strip(),
        "",
        "MATERIALS:",
    ]
    for item in materials:
        chunks.extend(
            [
                f"### {item.name} ({item.kind})",
                item.summary,
                item.text,
                "",
            ]
        )
    return _clip("\n".join(chunks), MAX_TOTAL_TEXT)


def _parse_json(content: str) -> dict:
    content = content.strip()
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?", "", content).strip()
        content = re.sub(r"```$", "", content).strip()
    match = re.search(r"\{.*\}", content, re.S)
    if match:
        content = match.group(0)
    return json.loads(content)


def _normalize_payload(
    data: dict,
    name: str,
    goal: str,
    description: str | None,
    materials: list[Material],
    debug_cases: str | None,
) -> dict:
    fallback = _fallback_payload(name, goal, description, materials, debug_cases)
    normalized = {}
    for key, value in fallback.items():
        candidate = data.get(key, value)
        if isinstance(value, list) and not isinstance(candidate, list):
            candidate = [str(candidate)] if candidate else value
        if isinstance(value, str) and not isinstance(candidate, str):
            candidate = json.dumps(candidate, ensure_ascii=False)
        normalized[key] = candidate if candidate not in (None, "", []) else value
    return normalized


def _fallback_payload(
    name: str,
    goal: str,
    description: str | None,
    materials: list[Material],
    debug_cases: str | None,
) -> dict:
    material_names = [item.name for item in materials] or ["user description"]
    domains = _extract_keywords(" ".join([goal, description or ""] + [m.text for m in materials]))
    debug_list = _lines(debug_cases) or [
        "Ask the user for the failing prompt, expected behavior, actual behavior, and relevant artifacts.",
        "Run the skill against one small example before applying it to the full task.",
    ]
    workflow = [
        "Collect the user's goal, source materials, constraints, and examples.",
        "Extract durable rules, domain facts, recurring failure modes, and expected outputs.",
        "Convert those findings into concise skill instructions with clear triggers.",
        "Create validation prompts that check whether the skill changes the AI behavior in the intended way.",
        "When evidence is weak, mark assumptions explicitly and ask for one targeted clarification.",
    ]
    guardrails = [
        "Do not invent facts that are not present in the materials.",
        "Separate durable rules from one-off examples.",
        "Preserve user-provided terminology and output formats when they are repeated.",
        "Keep the final system prompt short enough to reuse inside an agent.",
    ]
    system_prompt = "\n".join(
        [
            f"# {name}",
            "",
            f"Goal: {goal.strip()}",
            "",
            "Use this skill when the user wants an AI agent to follow, debug, or reproduce this workflow.",
            "",
            "## Source Materials",
            *[f"- {item.name}: {item.summary}" for item in materials],
            "",
            "## Workflow",
            *[f"{idx + 1}. {step}" for idx, step in enumerate(workflow)],
            "",
            "## Guardrails",
            *[f"- {rule}" for rule in guardrails],
            "",
            "## Validation",
            *[f"- {case}" for case in debug_list],
        ]
    )
    return {
        "name": name.strip()[:100] or "Generated Skill",
        "description": description or f"Generated from {', '.join(material_names[:3])}.",
        "triggers": [
            "generate skill",
            "debug ai behavior",
            "reuse workflow",
            "distill materials",
        ],
        "inputs": ["description", "chat records", "documents", "images", "debug cases"],
        "outputs": ["skill instructions", "system prompt", "validation checklist"],
        "workflow": workflow,
        "guardrails": guardrails,
        "validation": debug_list,
        "knowledge_domains": domains,
        "examples": _example_prompts(name),
        "debug_cases": debug_list,
        "memory_tree": [
            {
                "type": "source_material",
                "name": item.name,
                "kind": item.kind,
                "summary": item.summary,
            }
            for item in materials
        ],
        "system_prompt": system_prompt,
    }


def _extract_keywords(text: str) -> list[str]:
    words = re.findall(r"[\u4e00-\u9fff]{2,}|[A-Za-z][A-Za-z0-9_-]{2,}", text)
    stop = {
        "the",
        "and",
        "for",
        "with",
        "this",
        "that",
        "from",
        "skill",
        "user",
        "debug",
    }
    counts: dict[str, int] = {}
    for word in words:
        key = word.lower()
        if key in stop:
            continue
        counts[word] = counts.get(word, 0) + 1
    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return [word for word, _ in ranked[:8]] or ["AI workflow"]


def _example_prompts(name: str) -> list[str]:
    return [
        f"Use {name} to turn these notes into a reusable AI workflow.",
        f"Use {name} to diagnose why this AI response does not match the expected behavior.",
    ]


def _lines(text: str | None) -> list[str]:
    if not text:
        return []
    return [line.strip("- 	") for line in text.splitlines() if line.strip()][:12]


def _clip(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[:limit].rstrip() + "\n...[truncated]"
