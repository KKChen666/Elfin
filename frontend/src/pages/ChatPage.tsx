import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Archive,
  ArrowsClockwise,
  CheckCircle,
  Copy,
  PaperPlaneRight,
  Robot,
  StopCircle,
  User,
} from '@phosphor-icons/react';
import { agentsApi, Agent } from '../api/agents';
import { conversationsApi, Conversation, Message } from '../api/conversations';
import { showToast } from '../components/toastBus';
import WorkflowGuide from '../components/WorkflowGuide';
import ModelKeyNotice from '../components/ModelKeyNotice';
import NextStepPanel from '../components/NextStepPanel';

function getConversationTitle(conversation: Conversation | null) {
  if (!conversation) return '对话';
  if (conversation.title) return conversation.title;
  const names = conversation.participants?.map((p) => p.agent_name).filter(Boolean) || [];
  return names.length ? names.join('、') : '新的对话';
}

function timeLabel(value: string) {
  try {
    return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [conversationTitle, setConversationTitle] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasShownMockNoticeRef = useRef(false);

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    const agentParam = searchParams.get('agent');
    if (agentParam && agents.length > 0) {
      const agentId = Number(agentParam);
      if (!Number.isNaN(agentId) && agents.some((agent) => agent.id === agentId)) {
        setSelectedAgents([agentId]);
      }
    }
  }, [agents, searchParams]);

  useEffect(() => {
    if (id && id !== 'new') {
      const convId = Number(id);
      loadConversation(convId);
      loadMessages(convId);
    } else {
      setConversation(null);
      setMessages([]);
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const loadAgents = async () => {
    try {
      const res = await agentsApi.getAll();
      setAgents(res.data);
    } catch {
      setAgents([]);
    }
  };

  const loadConversation = async (convId: number) => {
    try {
      const res = await conversationsApi.getOne(convId);
      setConversation(res.data);
      setSelectedAgents(res.data.participants?.map((p) => p.agent_id) || []);
    } catch {
      setConversation(null);
      showToast('error', '对话加载失败');
    }
  };

  const loadMessages = async (convId: number) => {
    try {
      const res = await conversationsApi.getMessages(convId);
      setMessages(res.data);
    } catch {
      setMessages([]);
    }
  };

  const handleCreateConversation = async () => {
    if (selectedAgents.length === 0 || isCreatingConversation) return;
    setIsCreatingConversation(true);
    try {
      const res = await conversationsApi.create(selectedAgents, conversationTitle.trim() || undefined);
      navigate(`/chat/${res.data.id}`);
      window.dispatchEvent(new Event('elfin:conversations-changed'));
    } catch {
      showToast('error', '创建对话失败');
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleArchiveCurrent = async () => {
    if (!conversation) return;
    try {
      if (conversation.is_archived) {
        const res = await conversationsApi.restore(conversation.id);
        setConversation(res.data);
      } else {
        await conversationsApi.archive(conversation.id);
        navigate('/chat');
      }
      window.dispatchEvent(new Event('elfin:conversations-changed'));
    } catch {
      showToast('error', '归档操作失败');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !id || id === 'new' || isStreaming) return;
    const content = inputValue.trim();
    const convId = Number(id);
    setInputValue('');
    const tempId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        conversation_id: convId,
        sender_type: 'user',
        sender_id: 0,
        sender_name: '你',
        content,
        metadata_json: null,
        created_at: new Date().toISOString(),
      },
    ]);

    try {
      await conversationsApi.sendMessage(convId, content);
      window.dispatchEvent(new Event('elfin:conversations-changed'));
      await triggerAgentReply();
    } catch {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setInputValue(content);
      showToast('error', '消息发送失败');
    }
  };

  const triggerAgentReply = async () => {
    if (!id || id === 'new') return;
    const convId = Number(id);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsStreaming(true);

    try {
      const response = await conversationsApi.triggerAgentReply(convId, undefined, controller.signal);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      if (response.headers.get('X-Elfin-Mock-Llm') === 'true' && !hasShownMockNoticeRef.current) {
        hasShownMockNoticeRef.current = true;
        showToast('info', '未配置 API Key，当前使用模拟回复。');
      }

      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let currentAgentId: number | null = null;
      let currentAgentName = '';
      let currentMessageId: number | null = null;
      let currentContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const data = JSON.parse(trimmed.slice(6));
          if (data.done) {
            currentAgentId = null;
            currentAgentName = '';
            currentMessageId = null;
            currentContent = '';
            continue;
          }

          if (currentAgentId !== data.agent_id) {
            currentAgentId = data.agent_id;
            currentAgentName = data.agent_name;
            currentMessageId = Date.now() + Math.random();
            currentContent = data.content;
            setMessages((prev) => [
              ...prev,
              {
                id: currentMessageId as number,
                conversation_id: convId,
                sender_type: 'agent',
                sender_id: currentAgentId as number,
                sender_name: currentAgentName,
                content: currentContent,
                metadata_json: null,
                created_at: new Date().toISOString(),
              },
            ]);
          } else {
            currentContent += data.content;
            const messageId = currentMessageId;
            setMessages((prev) => prev.map((msg) => msg.id === messageId ? { ...msg, content: currentContent } : msg));
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        showToast('error', 'Agent 回复失败，请检查 API Key、模型名称或网络连接');
      }
    } finally {
      abortControllerRef.current = null;
      setIsStreaming(false);
      window.dispatchEvent(new Event('elfin:conversations-changed'));
    }
  };

  const handleStopStreaming = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showToast('success', '已复制');
    } catch {
      showToast('error', '复制失败');
    }
  };

  if (!id || id === 'new') {
    return (
      <div className="flex h-full items-center justify-center overflow-y-auto bg-white px-4 py-10">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#202123] text-white">
              <Robot size={25} weight="fill" />
            </div>
            <p className="text-sm font-medium text-[#6b7280]">选择一位或多位 Agent</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202123] sm:text-4xl">今天想和谁聊？</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6b7280]">
              先选择 Agent，再开始对话。标题可以留空，系统会自动生成。
            </p>
          </div>

          <ModelKeyNotice compact />

          {agents.length === 0 && <WorkflowGuide />}

          {agents.length === 0 && (
            <NextStepPanel
              eyebrow="先创建对话对象"
              title="还没有可选择的 Agent"
              description="Agent 是最终和你对话的角色。建议先从亲友资料或聊天记录沉淀 Skill，再创建 Agent 绑定这些能力。"
              actions={[
                { label: '创建 Agent', to: '/agents', primary: true },
                { label: '去添加亲友', to: '/add' },
              ]}
            />
          )}

          <div className="mb-4 rounded-[28px] border border-[#d9d9e3] bg-white p-2 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <input
              value={conversationTitle}
              onChange={(event) => setConversationTitle(event.target.value)}
              placeholder="对话名（可选）"
              className="h-11 w-full rounded-full border-0 bg-transparent px-4 text-[15px] text-[#202123] outline-none placeholder:text-[#8a8f98]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {agents.map((agent) => {
              const selected = selectedAgents.includes(agent.id);
              return (
                <label key={agent.id} className={`cursor-pointer rounded-3xl border bg-white p-4 hover:bg-[#f7f7f8] ${selected ? 'border-[#202123] bg-[#f7f7f8]' : 'border-[#e5e7eb]'}`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => {
                      setSelectedAgents((prev) =>
                        event.target.checked ? [...prev, agent.id] : prev.filter((agentId) => agentId !== agent.id),
                      );
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ececf1] text-[#202123]">
                      {agent.avatar_url ? <img src={agent.avatar_url} alt="" className="h-full w-full object-cover" /> : <Robot size={24} weight="fill" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-[#202123]">{agent.name}</p>
                        {selected && <CheckCircle size={18} weight="fill" className="shrink-0 text-[#202123]" />}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#6b7280]">{agent.description || '一个可以陪你完成关系记录的 AI Agent'}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {agents.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button onClick={handleCreateConversation} disabled={selectedAgents.length === 0 || isCreatingConversation} className="ios-button-primary w-full max-w-sm">
                {isCreatingConversation ? '正在创建...' : '开始对话'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <header className="z-10 border-b border-[#ececf1] bg-white px-4 py-3 lg:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 pl-12 lg:pl-0">
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-semibold text-[#202123]">{getConversationTitle(conversation)}</h1>
            <p className="mt-0.5 truncate text-xs text-[#6b7280]">
              {conversation?.type === 'group' ? '群聊' : '单聊'}
              {conversation?.participants && ` · ${conversation.participants.length} 位 Agent`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={triggerAgentReply} disabled={isStreaming || messages.length === 0} className="ios-icon-button !h-9 !w-9 text-[#6b7280]" title="重新生成" aria-label="重新生成">
              <ArrowsClockwise size={18} />
            </button>
            {conversation && (
              <button onClick={handleArchiveCurrent} className="ios-icon-button !h-9 !w-9 text-[#6b7280]" title={conversation.is_archived ? '恢复对话' : '归档对话'} aria-label={conversation.is_archived ? '恢复对话' : '归档对话'}>
                <Archive size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          {messages.length === 0 && (
            <div className="py-24 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f7f8] text-[#202123] ring-1 ring-[#e5e7eb]">
                <Robot size={26} weight="fill" />
              </div>
              <h2 className="text-2xl font-semibold text-[#202123]">这一页还很安静</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6b7280]">发送第一条消息，Agent 会在同一个对话流里自然接上。</p>
              <div className="mx-auto mt-5 flex max-w-xl flex-wrap justify-center gap-2">
                {['帮我整理这个人的表达特点', '根据最近的关系状态给我一个提醒', '用更自然的方式回复这句话'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputValue(suggestion)}
                    className="ios-chip !bg-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg) => {
              const isUser = msg.sender_type === 'user';
              return (
                <div key={msg.id} className={`group flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f7f7f8] text-[#202123] ring-1 ring-[#e5e7eb]">
                      <Robot size={18} weight="fill" />
                    </div>
                  )}
                  <div className={`max-w-[86%] sm:max-w-[76%] ${isUser ? 'order-first' : ''}`}>
                    {!isUser && msg.sender_name && <p className="mb-1.5 px-1 text-xs font-medium text-[#6b7280]">{msg.sender_name}</p>}
                    <div className={`text-[15px] leading-7 ${isUser ? 'rounded-[24px] bg-[#f4f4f4] px-4 py-3 text-[#202123]' : 'px-1 py-1 text-[#202123]'}`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <div className={`mt-1 flex items-center gap-2 px-1 text-[11px] text-[#8a8f98] ${isUser ? 'justify-end' : ''}`}>
                      <span>{timeLabel(msg.created_at)}</span>
                      <button onClick={() => copyMessage(msg.content)} className="opacity-0 transition group-hover:opacity-100" aria-label="复制消息">
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                  {isUser && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#202123] text-white">
                      <User size={17} weight="fill" />
                    </div>
                  )}
                </div>
              );
            })}

            {isStreaming && (
              <div className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f7f8] text-[#202123] ring-1 ring-[#e5e7eb]">
                  <Robot size={18} weight="fill" />
                </div>
                <div className="px-2 py-3 text-sm text-[#6b7280]">正在回复...</div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white px-4 pb-4 pt-2 safe-bottom">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-[28px] border border-[#d9d9e3] bg-white p-2 shadow-[0_2px_18px_rgba(0,0,0,0.08)]">
          <textarea
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="输入消息..."
            className="max-h-36 min-h-10 min-w-0 flex-1 resize-none rounded-[22px] border-0 bg-transparent px-4 py-2.5 text-[15px] leading-6 text-[#202123] outline-none placeholder:text-[#8a8f98]"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button onClick={handleStopStreaming} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#202123] text-white" aria-label="停止生成">
              <StopCircle size={21} weight="fill" />
            </button>
          ) : (
            <button onClick={handleSendMessage} disabled={!inputValue.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#202123] text-white hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-35" aria-label="发送消息">
              <PaperPlaneRight size={20} weight="fill" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
