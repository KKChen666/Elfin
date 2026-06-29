# Elfin Project Rules

These rules are the project-level source of truth for AI-assisted development in TRAE.
They supersede older Companion-era notes that describe a pure frontend/localStorage app.

## Project Snapshot

- Product: Elfin, a relationship management and AI Agent chat app.
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Capacitor Android.
- Backend: FastAPI, SQLAlchemy 2, MySQL, JWT auth, Tencent COS upload, hello-agents for user-configured LLM access.
- Main ports: frontend `http://localhost:2901`, backend `http://127.0.0.1:3290`.
- API proxy: frontend `/api` is proxied to backend in Vite dev mode.

## Repository Layout

- `frontend/src/pages/`: route-level React pages.
- `frontend/src/components/`: shared UI and layout components.
- `frontend/src/api/`: axios/fetch API clients.
- `frontend/src/stores/`: Zustand stores.
- `frontend/src/hooks/`: reusable hooks.
- `backend/app/models/`: SQLAlchemy models.
- `backend/app/schemas/`: Pydantic request/response schemas.
- `backend/app/routers/`: FastAPI routers.
- `backend/app/services/`: domain services and LLM adapters.
- `backend/app/utils/`: auth, encryption, and other helpers.
- `docs/CDS/`: design, architecture, and historical product specs.

## Current Architecture Rules

- Treat the backend API and MySQL database as real parts of the product.
- Do not follow outdated rules that say "no network requests" or "localStorage only"; this project now uses authenticated backend APIs.
- Keep user data scoped by `user_id` in every backend query.
- Do not return API keys or other secrets in plaintext responses.
- User LLM API keys must be encrypted at rest through `backend/app/utils/secrets.py`.
- LLM calls must use per-user settings from `/api/auth/llm-settings`; do not reintroduce a global server-side `LLM_API_KEY`.
- Use `hello_agents.HelloAgentsLLM` for provider access instead of hand-written provider-specific HTTP clients.
- Keep the no-key development fallback mock in `llm_service.py` unless explicitly asked to remove it.
- For schema changes, update SQLAlchemy models, Pydantic schemas, and startup compatibility migration in `backend/app/main.py`.
- Prefer a real Alembic migration if migration complexity grows beyond simple additive fields.

## Conversation And Agent Rules

- New Agent chat uses `Conversation`, `ConversationParticipant`, and `Message`.
- Direct chat is one Agent; group chat is multiple Agents.
- Recent and archived conversations are separate states; archiving must not delete messages.
- Deleting a conversation is destructive and cascades messages/participants.
- Agent replies should stream through SSE from `/api/conversations/{id}/messages/agent`.
- Frontend chat bubbles should update while streaming, not only after completion.
- When messages or archive state changes, refresh the sidebar conversation list.
- Legacy relative avatar chat (`/avatar-chat/:id`) still uses template-style local response generation; do not confuse it with Agent chat.

## Frontend Rules

- Use the existing iOS-style utility classes in `frontend/src/index.css` (`ios-page`, `ios-panel`, `ios-card`, `ios-button-*`, `ios-input`, `ios-icon-button`).
- Use Phosphor icons where the current Claude-style layout already uses them.
- Keep interactive controls at least 44px where practical.
- Use responsive Tailwind classes; pages must work on mobile and desktop.
- Avoid adding nested cards inside cards.
- Avoid adding new broad design systems unless requested.
- Keep visible user-facing text concise and natural Chinese.
- Do not store LLM API keys in `localStorage`; send them only to backend settings endpoints.
- Prefer axios client in `frontend/src/api/client.ts`; use raw `fetch` only when streaming SSE requires it.

## Backend Rules

- Use FastAPI dependency injection for `get_current_user` and `get_db`.
- Every authenticated resource query must filter by current user ownership.
- Use Pydantic schemas for request and response surfaces.
- Keep response models from leaking internal/encrypted fields.
- For SQLAlchemy relationships, avoid returning ORM objects directly when derived fields or masking are needed.
- For long-running streaming endpoints, do not reuse a closed request DB session inside async generators; open a generator-local session as needed.
- Keep error messages safe and user-readable; avoid exposing stack traces or API key fragments.

## Security Rules

- Never commit real `.env` values, API keys, tokens, or database passwords.
- Encrypt persisted user API keys.
- `SECRET_KEY` must remain stable; changing it prevents decrypting already-stored user LLM keys.
- Mask API keys in UI and API responses.
- Do not log full LLM settings, prompts containing secrets, or raw API keys.

## Validation Commands

Run these before handing off meaningful changes:

```powershell
cd D:\code\Elfin
python -c "import ast, pathlib; [ast.parse(p.read_text(encoding='utf-8'), filename=str(p)) for p in pathlib.Path('backend/app').rglob('*.py')]"
cd D:\code\Elfin\frontend
npm run check
npm run lint
```

Optional runtime checks:

```powershell
Invoke-RestMethod http://127.0.0.1:3290/api/health
```

## Collaboration Rules

- Read the relevant files before editing.
- Keep changes scoped to the user request.
- Preserve unrelated user changes.
- Do not run destructive git commands unless explicitly requested.
- If generated `__pycache__` files change during validation, restore/remove them before handoff.
- When reviewing code, lead with concrete bugs and file references.

