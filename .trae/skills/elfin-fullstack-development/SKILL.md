---
name: elfin-fullstack-development
description: Use this skill when developing Elfin full-stack features across React/Vite frontend and FastAPI/SQLAlchemy backend, especially when changes touch API contracts, user-owned data, database models, or frontend API clients.
---

# Elfin Full-Stack Development

Use this skill for Elfin feature work that crosses frontend and backend boundaries.

## Start Here

1. Read `.trae/rules/project_rules.md`.
2. Identify whether the change touches frontend, backend, database schema, or all three.
3. Read the existing model/schema/router/API-client/page files before editing.
4. Keep changes small and aligned with current patterns.

## Backend Workflow

- Models live in `backend/app/models/`.
- Request/response schemas live in `backend/app/schemas/`.
- Routes live in `backend/app/routers/`.
- Business logic lives in `backend/app/services/`.
- Authenticated queries must filter by `user_id`.
- If adding DB columns, update:
  - SQLAlchemy model
  - Pydantic schema if exposed
  - startup compatibility migration in `backend/app/main.py`
- Do not expose encrypted or internal DB fields through response models.

## Frontend Workflow

- API wrappers live in `frontend/src/api/`.
- Pages live in `frontend/src/pages/`.
- Layout/navigation lives mainly in `frontend/src/components/ClaudeLayout.tsx`.
- Use the existing `client` axios instance for JSON APIs.
- Use raw `fetch` only for streaming endpoints such as SSE.
- Keep user-facing errors actionable; prefer existing toast utilities when the page already uses them.

## Validation

Run:

```powershell
cd D:\code\Elfin
python -c "import ast, pathlib; [ast.parse(p.read_text(encoding='utf-8'), filename=str(p)) for p in pathlib.Path('backend/app').rglob('*.py')]"
cd D:\code\Elfin\frontend
npm run check
npm run lint
```

If validation updates Python caches, restore or remove `__pycache__` changes before handoff.

