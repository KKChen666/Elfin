---
name: elfin-llm-conversation-management
description: Use this skill when working on Elfin Agent chat, conversation management, archived conversations, group chat, SSE streaming replies, hello-agents integration, or per-user LLM settings.
---

# Elfin LLM And Conversation Management

Use this skill for Agent chat and LLM-related changes.

## Current Model

- `Conversation`: owned by a user, can be `direct` or `group`, can be archived.
- `ConversationParticipant`: links a conversation to one or more Agents.
- `Message`: stores user and Agent messages.
- Recent conversations are `is_archived = false`.
- Archived conversations are `is_archived = true`; archiving is not deletion.

## LLM Settings

- Users configure LLM settings through `/api/auth/llm-settings`.
- API keys are encrypted at rest with `backend/app/utils/secrets.py`.
- API responses return only masked key metadata.
- Never store LLM API keys in frontend localStorage.
- Do not reintroduce server-global `LLM_API_KEY`.
- Use `hello_agents.HelloAgentsLLM` from `backend/app/services/llm_service.py`.
- If no user API key is configured, keep the development mock behavior.

## Streaming Rules

- Agent replies stream from `/api/conversations/{id}/messages/agent`.
- SSE chunks should be rendered into a live-updating message bubble.
- Save the final Agent message after streaming completes.
- Refresh the conversation list when user messages, Agent replies, archive, restore, rename, or delete operations complete.

## Group Chat Rules

- One selected Agent creates direct chat.
- Multiple selected Agents creates group chat.
- If no explicit `agent_id` is requested, direct chat replies with the sole Agent.
- Group reply selection is currently simple; do not present it as fully intelligent routing until implemented.

## Watchouts

- Legacy relative avatar chat under `/avatar-chat/:id` uses a local template responder and is separate from Agent chat.
- Do not mix `ChatMessage` legacy records with new `Message` records unless doing a deliberate migration.
- For async streaming generators, open a generator-local DB session if persistence happens after the response begins.

