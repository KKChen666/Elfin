import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Archive, PaperPlaneRight, Robot, User, CheckCircle } from '@phosphor-icons/react';
import { conversationsApi, Conversation, Message } from '../api/conversations';
import { agentsApi, Agent } from '../api/agents';
import gsap from 'gsap';
import { useGsapEntrance } from '../hooks/useGsapEntrance';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const setupRef = useRef<HTMLDivElement>(null);
  const chatFrameRef = useRef<HTMLDivElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    const agentParam = searchParams.get('agent');
    if (agentParam && agents.length > 0) {
      const agentId = parseInt(agentParam);
      if (!Number.isNaN(agentId) && agents.some((a) => a.id === agentId)) {
        setSelectedAgents([agentId]);
      }
    }
  }, [searchParams, agents]);

  useEffect(() => {
    if (id && id !== 'new') {
      loadConversation(parseInt(id));
      loadMessages(parseInt(id));
    } else {
      setConversation(null);
      setMessages([]);
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const lastMessage = chatListRef.current?.lastElementChild;
    if (!lastMessage || messages.length === 0) return;

    gsap.fromTo(
      lastMessage,
      { y: 12, opacity: 0, scale: 0.985 },
      { y: 0, opacity: 1, scale: 1, duration: 0.28, ease: 'power2.out', clearProps: 'transform' },
    );
  }, [messages.length]);

  useGsapEntrance(setupRef, [agents.length], { selector: '[data-agent-option]', y: 14, stagger: 0.045 });
  useGsapEntrance(chatFrameRef, [id], { selector: '[data-gsap-chat]', y: 12, stagger: 0.055 });

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
      if (res.data.participants) {
        setSelectedAgents(res.data.participants.map((p) => p.agent_id));
      }
    } catch {
      setConversation(null);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCreateConversation = async () => {
    if (selectedAgents.length === 0) return;
    try {
      const res = await conversationsApi.create(selectedAgents, conversationTitle.trim() || undefined);
      navigate(`/chat/${res.data.id}`);
    } catch {
      // Kept quiet; global API layer may surface auth/network issues.
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
      // Keep current chat visible if archive/restore fails.
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !id || id === 'new' || isStreaming) return;

    const content = inputValue.trim();
    setInputValue('');

    const userMsg: Message = {
      id: Date.now(),
      conversation_id: parseInt(id),
      sender_type: 'user',
      sender_id: 0,
      sender_name: '你',
      content,
      metadata_json: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      await conversationsApi.sendMessage(parseInt(id), content);
      window.dispatchEvent(new Event('elfin:conversations-changed'));
      await triggerAgentReply();
    } catch {
      // Keep the optimistic user message visible.
    }
  };

  const triggerAgentReply = async () => {
    if (!id || id === 'new') return;
    setIsStreaming(true);

    try {
      const response = await conversationsApi.triggerAgentReply(parseInt(id));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
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

          try {
            const data = JSON.parse(trimmed.slice(6));

            if (data.done) {
              currentAgentId = null;
              currentAgentName = '';
              currentMessageId = null;
              currentContent = '';
            } else {
              if (currentAgentId !== data.agent_id) {
                currentAgentId = data.agent_id;
                currentAgentName = data.agent_name;
                currentMessageId = Date.now() + Math.random();
                currentContent = data.content;
                const agentMsg: Message = {
                  id: currentMessageId,
                  conversation_id: parseInt(id),
                  sender_type: 'agent',
                  sender_id: currentAgentId,
                  sender_name: currentAgentName,
                  content: currentContent,
                  metadata_json: null,
                  created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, agentMsg]);
              } else {
                currentContent += data.content;
                const messageId = currentMessageId;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === messageId ? { ...msg, content: currentContent } : msg,
                  ),
                );
              }
            }
          } catch {
            // Ignore malformed stream chunks.
          }
        }
      }
    } catch {
      // Quiet failure preserves the chat state.
    } finally {
      setIsStreaming(false);
      window.dispatchEvent(new Event('elfin:conversations-changed'));
    }
  };

  if (!id || id === 'new') {
    return (
      <div className="ios-page flex h-full items-center justify-center overflow-y-auto px-4 py-10">
        <div ref={setupRef} className="w-full max-w-[720px]">
          <div className="mb-8 text-center" data-agent-option>
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#1d1d1f] text-white">
              <Robot size={38} weight="fill" />
            </div>
            <p className="ios-kicker">选择一位或多位 Agent</p>
            <h1 className="ios-title">开始一段新的对话。</h1>
            <p className="ios-subtitle mx-auto max-w-md">
              Elfin 会把不同 Agent 的能力组织在同一个安静、清晰的对话空间里。
            </p>
          </div>

          <div className="ios-panel mb-4 p-3" data-agent-option>
            <input
              value={conversationTitle}
              onChange={(e) => setConversationTitle(e.target.value)}
              placeholder="对话名（可选）"
              className="ios-input"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {agents.map((agent) => {
              const selected = selectedAgents.includes(agent.id);
              return (
                <label
                  key={agent.id}
                  data-agent-option
                  className={`ios-card cursor-pointer p-4 ${selected ? 'border-[#0066cc] bg-[#f0f7ff]' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAgents((prev) => [...prev, agent.id]);
                      } else {
                        setSelectedAgents((prev) => prev.filter((agentId) => agentId !== agent.id));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e9f2ff] text-[#0066cc]">
                      {agent.avatar_url ? (
                        <img src={agent.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Robot size={24} weight="fill" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[17px] font-semibold text-[#1d1d1f]">{agent.name}</p>
                        {selected && <CheckCircle size={18} weight="fill" className="shrink-0 text-[#0066cc]" />}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#6e6e73]">
                        {agent.description || '一个可以陪你完成关系记录的 AI Agent'}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {agents.length === 0 && (
            <div className="ios-panel p-8 text-center" data-agent-option>
              <Robot size={46} className="mx-auto mb-4 text-[#8e8e93]" />
              <h2 className="text-lg font-semibold">还没有 Agent</h2>
              <p className="mt-1 text-sm text-[#7a7a7a]">先创建一个 Agent，再回来开启对话。</p>
              <button onClick={() => navigate('/agents')} className="ios-button-primary mt-5">
                创建 Agent
              </button>
            </div>
          )}

          {agents.length > 0 && (
            <div className="mt-6 flex justify-center" data-agent-option>
              <button
                onClick={handleCreateConversation}
                disabled={selectedAgents.length === 0}
                className="ios-button-primary w-full max-w-sm"
              >
                开始对话
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={chatFrameRef} className="ios-page flex h-full flex-col overflow-hidden">
      <header className="ios-frosted z-10 border-b border-white/60 px-5 py-4 lg:px-8" data-gsap-chat>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 pl-12 lg:pl-0">
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
              {getConversationTitle(conversation)}
            </h1>
            <p className="mt-0.5 truncate text-xs text-[#7a7a7a]">
              {conversation?.type === 'group' ? '群聊' : '单聊'}
              {conversation?.participants && ` · ${conversation.participants.length} 位 Agent`}
            </p>
          </div>
          <div className="hidden rounded-full bg-white/70 px-3 py-1 text-xs text-[#7a7a7a] sm:block">
            {isStreaming ? '正在回复' : '在线'}
          </div>
          {conversation && (
            <button
              onClick={handleArchiveCurrent}
              className="ios-icon-button !h-10 !w-10 shrink-0 text-[#6e6e73]"
              title={conversation.is_archived ? '恢复对话' : '归档对话'}
              aria-label={conversation.is_archived ? '恢复对话' : '归档对话'}
            >
              <Archive size={18} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto" data-gsap-chat>
        <div ref={messageContainerRef} className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
          {messages.length === 0 && (
            <div className="py-20 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-white text-[#0066cc] ring-1 ring-black/5">
                <Robot size={38} weight="fill" />
              </div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">这一页还很安静。</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7a7a7a]">
                发送第一条消息，Agent 会在这里用更自然的节奏回应你。
              </p>
            </div>
          )}

          <div ref={chatListRef} className="space-y-5">
            {messages.map((msg) => {
              const isUser = msg.sender_type === 'user';
              return (
                <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9f2ff] text-[#0066cc]">
                      <Robot size={18} weight="fill" />
                    </div>
                  )}
                  <div className={`max-w-[82%] sm:max-w-[72%] ${isUser ? 'order-first' : ''}`}>
                    {!isUser && msg.sender_name && (
                      <p className="mb-1.5 px-1 text-xs font-medium text-[#0066cc]">{msg.sender_name}</p>
                    )}
                    <div
                      className={`
                        rounded-[24px] px-4 py-3 text-[15px] leading-7
                        ${isUser ? 'bg-[#0066cc] text-white' : 'border border-black/5 bg-white text-[#1d1d1f]'}
                      `}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <div className={`mt-1 px-1 text-[11px] text-[#8e8e93] ${isUser ? 'text-right' : ''}`}>
                      {timeLabel(msg.created_at)}
                    </div>
                  </div>
                  {isUser && (
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f] text-white">
                      <User size={17} weight="fill" />
                    </div>
                  )}
                </div>
              );
            })}

            {isStreaming && (
              <div className="flex gap-3">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#e9f2ff] text-[#0066cc]">
                  <Robot size={18} weight="fill" />
                </div>
                <div className="rounded-[24px] border border-black/5 bg-white px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#0066cc]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#0066cc]" style={{ animationDelay: '0.1s' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#0066cc]" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="ios-frosted border-t border-white/60 p-3 safe-bottom" data-gsap-chat>
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="输入消息..."
            className="ios-input flex-1"
            disabled={isStreaming}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isStreaming}
            className="ios-button-primary !h-11 !w-11 !px-0"
            aria-label="发送消息"
          >
            <PaperPlaneRight size={20} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}
