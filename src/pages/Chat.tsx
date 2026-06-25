import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { ChatMessage } from '../types';
import { generateAvatarResponse, getChatStyleDescription } from '../utils/chatUtils';
import AvatarPreview from '../components/avatar/AvatarPreview';

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRelative, chatMessages, loadChatMessages, addChatMessage, clearChatMessages } = useRelativeStore();
  const relative = getRelative(id || '');
  const messages = chatMessages[id || ''] || [];

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadChatMessages(id);
    }
  }, [id, loadChatMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!relative) {
    return <div className="p-4 text-center">亲友不存在</div>;
  }

  if (!relative.chatStyle) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <header className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg md:text-xl font-bold">与 {relative.name} 对话</h1>
        </header>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">还没有导入聊天记录，无法创建分身</p>
          <button
            onClick={() => navigate(`/import/${id}`)}
            className="px-4 py-2 bg-[#E8734A] text-white rounded-xl text-sm font-medium hover:bg-[#D4633A] transition-colors"
          >
            导入聊天记录
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    addChatMessage(id || '', userMessage);
    setInputValue('');
    setIsTyping(true);

    // 模拟分身思考和回复延迟
    setTimeout(() => {
      const avatarResponse = generateAvatarResponse(userMessage.content, relative.chatStyle!);
      const avatarMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: avatarResponse,
        sender: 'avatar',
        timestamp: new Date().toISOString(),
      };

      addChatMessage(id || '', avatarMessage);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleClearChat = () => {
    if (confirm('确定要清空聊天记录吗？')) {
      clearChatMessages(id || '');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-[#FAFAF7]">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            {relative.avatarImage ? (
              <img
                src={relative.avatarImage}
                alt={relative.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <AvatarPreview avatar={relative.avatar} size={32} />
            )}
            <div>
              <h1 className="font-semibold text-sm">{relative.name}</h1>
              <p className="text-xs text-gray-400">{getChatStyleDescription(relative.chatStyle)}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleClearChat}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
        >
          <Trash2 size={18} />
        </button>
      </header>

      {/* 聊天消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
              {relative.avatarImage ? (
                <img
                  src={relative.avatarImage}
                  alt={relative.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <AvatarPreview avatar={relative.avatar} size={48} />
              )}
            </div>
            <p className="text-sm text-gray-500 mb-1">开始与 {relative.name} 的分身对话</p>
            <p className="text-xs text-gray-400">基于聊天记录分析的说话风格</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end gap-2 max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.sender === 'avatar' && (
                <div className="shrink-0">
                  {relative.avatarImage ? (
                    <img
                      src={relative.avatarImage}
                      alt={relative.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <AvatarPreview avatar={relative.avatar} size={28} />
                  )}
                </div>
              )}
              <div>
                <div
                  className={`px-3 py-2 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#E8734A] text-white rounded-br-md'
                      : 'bg-white border border-gray-100 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
                <p className={`text-[10px] text-gray-400 mt-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="shrink-0">
                {relative.avatarImage ? (
                  <img
                    src={relative.avatarImage}
                    alt={relative.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <AvatarPreview avatar={relative.avatar} size={28} />
                )}
              </div>
              <div className="px-3 py-2 rounded-2xl rounded-bl-md bg-white border border-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="bg-white border-t border-gray-200 p-3 shrink-0">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A] focus:ring-opacity-50"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="p-2 bg-[#E8734A] text-white rounded-full hover:bg-[#D4633A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
