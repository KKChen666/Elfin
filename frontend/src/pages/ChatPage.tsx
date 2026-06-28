import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PaperPlaneRight, Robot, User, Plus } from '@phosphor-icons/react';
import { conversationsApi, Conversation, Message } from '../api/conversations';
import { agentsApi, Agent } from '../api/agents';
import gsap from 'gsap';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  // 处理 ?agent= 参数，自动选中 agent
  useEffect(() => {
    const agentParam = searchParams.get('agent');
    if (agentParam && agents.length > 0) {
      const agentId = parseInt(agentParam);
      if (!isNaN(agentId) && agents.some(a => a.id === agentId)) {
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

  const loadAgents = async () => {
    try {
      const res = await agentsApi.getAll();
      setAgents(res.data);
    } catch {
      // 静默失败
    }
  };

  const loadConversation = async (convId: number) => {
    try {
      const res = await conversationsApi.getOne(convId);
      setConversation(res.data);
      if (res.data.participants) {
        setSelectedAgents(res.data.participants.map(p => p.agent_id));
      }
    } catch {
      // 静默失败
    }
  };

  const loadMessages = async (convId: number) => {
    try {
      const res = await conversationsApi.getMessages(convId);
      setMessages(res.data);
    } catch {
      // 静默失败
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCreateConversation = async () => {
    if (selectedAgents.length === 0) return;
    try {
      const res = await conversationsApi.create(selectedAgents);
      navigate(`/chat/${res.data.id}`);
    } catch {
      // 静默失败
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !id || id === 'new' || isStreaming) return;

    const content = inputValue.trim();
    setInputValue('');

    // 添加用户消息到本地
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
    setMessages(prev => [...prev, userMsg]);

    // 发送到后端
    try {
      await conversationsApi.sendMessage(parseInt(id), content);
      // 触发 agent 回复
      await triggerAgentReply();
    } catch {
      // 静默失败
    }
  };

  const triggerAgentReply = async () => {
    if (!id || id === 'new') return;
    setIsStreaming(true);

    try {
      const response = await fetch(`/api/conversations/${id}/messages/agent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let currentAgentId: number | null = null;
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
              if (currentAgentId && currentContent) {
                const agentMsg: Message = {
                  id: Date.now() + Math.random(),
                  conversation_id: parseInt(id),
                  sender_type: 'agent',
                  sender_id: currentAgentId,
                  sender_name: data.agent_name,
                  content: currentContent,
                  metadata_json: null,
                  created_at: new Date().toISOString(),
                };
                setMessages(prev => [...prev, agentMsg]);

                // GSAP 动画
                setTimeout(() => {
                  const lastMsg = messageContainerRef.current?.lastElementChild;
                  if (lastMsg) {
                    gsap.from(lastMsg, {
                      y: 20,
                      opacity: 0,
                      duration: 0.3,
                      ease: 'power2.out',
                    });
                  }
                }, 50);
              }
              currentAgentId = null;
              currentContent = '';
            } else {
              if (currentAgentId !== data.agent_id) {
                currentAgentId = data.agent_id;
                currentContent = data.content;
              } else {
                currentContent += data.content;
              }
            }
          } catch {
            // JSON 解析失败，跳过
          }
        }
      }
    } catch {
      // 静默失败
    } finally {
      setIsStreaming(false);
    }
  };

  // 新对话页面：选择 Agent
  if (!id || id === 'new') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F7F8FA]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6A00] to-[#FF8A33] flex items-center justify-center mx-auto mb-5 shadow-lg"
              style={{ boxShadow: '0 8px 32px rgba(255, 106, 0, 0.25)' }}>
              <Robot size={40} className="text-white" weight="fill" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">新建对话</h1>
            <p className="text-[#999] text-sm">选择要对话的 Agent</p>
          </div>

          {/* Agent 选择 */}
          <div className="space-y-2 mb-6">
            {agents.map((agent) => (
              <label
                key={agent.id}
                className={`
                  flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200
                  ${selectedAgents.includes(agent.id)
                    ? 'bg-white shadow-md border-2 border-[#FF6A00]'
                    : 'bg-white shadow-sm border-2 border-transparent hover:shadow-md'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedAgents.includes(agent.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAgents(prev => [...prev, agent.id]);
                    } else {
                      setSelectedAgents(prev => prev.filter(id => id !== agent.id));
                    }
                  }}
                  className="sr-only"
                />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8A33] flex items-center justify-center">
                  {agent.avatar_url ? (
                    <img src={agent.avatar_url} alt="" className="w-12 h-12 rounded-xl" />
                  ) : (
                    <Robot size={24} className="text-white" weight="fill" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1A1A1A]">{agent.name}</p>
                  <p className="text-xs text-[#999] mt-0.5 truncate">
                    {agent.description || 'AI Agent'}
                  </p>
                </div>
                {selectedAgents.includes(agent.id) && (
                  <div className="w-6 h-6 rounded-full bg-[#FF6A00] flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>

          {agents.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <Robot size={48} className="mx-auto text-[#E8E8E8] mb-4" />
              <p className="text-[#999] mb-4">还没有 Agent</p>
              <button
                onClick={() => navigate('/agents')}
                className="px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl text-sm font-medium shadow-sm hover:bg-[#E55D00] transition-colors"
                style={{ boxShadow: '0 4px 16px rgba(255, 106, 0, 0.3)' }}
              >
                创建 Agent
              </button>
            </div>
          )}

          {agents.length > 0 && (
            <button
              onClick={handleCreateConversation}
              disabled={selectedAgents.length === 0}
              className="w-full py-3.5 bg-[#FF6A00] text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E55D00] transition-all active:scale-[0.98] shadow-lg"
              style={{ boxShadow: '0 4px 16px rgba(255, 106, 0, 0.3)' }}
            >
              开始对话
            </button>
          )}
        </div>
      </div>
    );
  }

  // 对话页面
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* 顶部标题 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0] bg-white">
        <div>
          <h1 className="font-semibold text-[#1A1A1A]">{conversation?.title || '对话'}</h1>
          <p className="text-xs text-[#999] mt-0.5">
            {conversation?.type === 'group' ? '群聊' : '单聊'}
            {conversation?.participants && ` · ${conversation.participants.length} 个 Agent`}
          </p>
        </div>
      </header>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto bg-[#F7F8FA]">
        <div ref={messageContainerRef} className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6A00] to-[#FF8A33] flex items-center justify-center mx-auto mb-5 shadow-lg"
                style={{ boxShadow: '0 8px 32px rgba(255, 106, 0, 0.25)' }}>
                <Robot size={40} className="text-white" weight="fill" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">开始对话</h2>
              <p className="text-[#999] text-sm">发送消息开始与 Agent 交流</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender_type === 'user' ? 'justify-end' : ''}`}
            >
              {msg.sender_type === 'agent' && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8A33] flex items-center justify-center shrink-0 shadow-sm">
                  <Robot size={18} className="text-white" weight="fill" />
                </div>
              )}
              <div
                className={`
                  max-w-[80%] rounded-2xl px-4 py-3 text-sm
                  ${msg.sender_type === 'user'
                    ? 'bg-[#FF6A00] text-white shadow-sm'
                    : 'bg-white shadow-sm text-[#1A1A1A]'
                  }
                `}
                style={msg.sender_type === 'user' ? { boxShadow: '0 2px 12px rgba(255, 106, 0, 0.2)' } : {}}
              >
                {msg.sender_type === 'agent' && msg.sender_name && (
                  <p className="text-xs text-[#FF6A00] mb-1.5 font-semibold">{msg.sender_name}</p>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              {msg.sender_type === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-[#E8E8E8] flex items-center justify-center shrink-0">
                  <User size={18} className="text-[#666]" />
                </div>
              )}
            </div>
          ))}

          {isStreaming && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8A33] flex items-center justify-center shadow-sm">
                <Robot size={18} className="text-white" weight="fill" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[#FF6A00] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#FF6A00] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-[#FF6A00] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="border-t border-[#F0F0F0] p-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="输入消息..."
              className="flex-1 bg-[#F7F8FA] rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-opacity-30 placeholder-[#999] transition-all"
              disabled={isStreaming}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isStreaming}
              className="p-3.5 bg-[#FF6A00] text-white rounded-2xl hover:bg-[#E55D00] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              style={{ boxShadow: '0 4px 16px rgba(255, 106, 0, 0.3)' }}
            >
              <PaperPlaneRight size={20} weight="fill" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
