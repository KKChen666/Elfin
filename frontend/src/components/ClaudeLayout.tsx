import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  CaretLeft,
  ChartBar,
  ChatCircleDots,
  Archive,
  Check,
  Gear,
  List,
  Plus,
  Robot,
  SignOut,
  Sparkle,
  PencilSimple,
  Trash,
  Users,
  X,
} from '@phosphor-icons/react';
import gsap from 'gsap';
import { authApi, LLMSettings } from '../api/auth';
import { conversationsApi, Conversation } from '../api/conversations';
import { useAuthStore } from '../stores/useAuthStore';

const navItems = [
  { path: '/chat', icon: ChatCircleDots, label: '对话' },
  { path: '/agents', icon: Robot, label: 'Agents' },
  { path: '/skills', icon: Sparkle, label: '技能' },
  { path: '/relatives', icon: Users, label: '亲友' },
  { path: '/reminders', icon: Bell, label: '提醒' },
  { path: '/calendar', icon: Calendar, label: '日历' },
  { path: '/stats', icon: ChartBar, label: '统计' },
];

function formatConversationTitle(conv: Conversation) {
  if (conv.title) return conv.title;
  const names = conv.participants?.map((p) => p.agent_name).filter(Boolean) || [];
  return names.length ? names.join('、') : '新的对话';
}

export default function ClaudeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [llmSettings, setLlmSettings] = useState<LLMSettings | null>(null);
  const [llmForm, setLlmForm] = useState({
    api_key: '',
    api_base: '',
    model: '',
    timeout: 60,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const conversationListRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await conversationsApi.getAll(showArchived);
      setConversations(res.data);
    } catch {
      setConversations([]);
    }
  }, [showArchived]);

  useEffect(() => {
    loadConversations();
  }, [location.pathname, loadConversations]);

  useEffect(() => {
    window.addEventListener('elfin:conversations-changed', loadConversations);
    return () => window.removeEventListener('elfin:conversations-changed', loadConversations);
  }, [loadConversations]);

  useEffect(() => {
    if (!sidebarRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(sidebarRef.current, {
        x: -18,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out',
      });
      if (navRef.current?.children) {
        gsap.from(navRef.current.children, {
          x: -8,
          opacity: 0,
          duration: 0.28,
          stagger: 0.025,
          delay: 0.08,
          ease: 'power2.out',
        });
      }
    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!conversationListRef.current?.children.length) return;

    gsap.fromTo(
      conversationListRef.current.children,
      { y: 8, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.26,
        stagger: 0.025,
        ease: 'power2.out',
        clearProps: 'transform',
      },
    );
  }, [conversations.length]);

  const handleRenameConversation = async (conv: Conversation) => {
    const title = window.prompt('重命名对话', formatConversationTitle(conv));
    if (title === null) return;
    try {
      await conversationsApi.update(conv.id, { title: title.trim() || null });
      await loadConversations();
    } catch {
      // Keep sidebar state as-is; API layer handles auth failures.
    }
  };

  const handleArchiveConversation = async (conv: Conversation) => {
    try {
      if (conv.is_archived) {
        await conversationsApi.restore(conv.id);
      } else {
        await conversationsApi.archive(conv.id);
        if (location.pathname === `/chat/${conv.id}`) navigate('/chat');
      }
      await loadConversations();
    } catch {
      // Keep sidebar state as-is.
    }
  };

  const handleDeleteConversation = async (conv: Conversation) => {
    if (!window.confirm(`删除“${formatConversationTitle(conv)}”？消息记录也会一起删除。`)) return;
    try {
      await conversationsApi.delete(conv.id);
      if (location.pathname === `/chat/${conv.id}`) navigate('/chat');
      await loadConversations();
    } catch {
      // Keep sidebar state as-is.
    }
  };

  const openSettings = async () => {
    setSettingsOpen(true);
    try {
      const res = await authApi.getLLMSettings();
      setLlmSettings(res.data);
      setLlmForm({
        api_key: '',
        api_base: res.data.api_base,
        model: res.data.model,
        timeout: res.data.timeout,
      });
    } catch {
      // Leave the modal open; the user can try again after auth/network recovers.
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const payload: {
        api_key?: string | null;
        api_base: string | null;
        model: string | null;
        timeout: number;
      } = {
        api_base: llmForm.api_base.trim() || null,
        model: llmForm.model.trim() || null,
        timeout: llmForm.timeout,
      };
      if (llmForm.api_key.trim()) {
        payload.api_key = llmForm.api_key.trim();
      }
      const res = await authApi.updateLLMSettings(payload);
      setLlmSettings(res.data);
      setLlmForm((prev) => ({ ...prev, api_key: '' }));
      setSettingsOpen(false);
    } catch {
      // Keep form content so the user can retry.
    } finally {
      setSettingsSaving(false);
    }
  };

  const clearApiKey = async () => {
    setSettingsSaving(true);
    try {
      const res = await authApi.updateLLMSettings({ api_key: null });
      setLlmSettings(res.data);
      setLlmForm((prev) => ({ ...prev, api_key: '' }));
    } catch {
      // Keep the current modal state so the user can retry.
    } finally {
      setSettingsSaving(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/chat') return location.pathname.startsWith('/chat');
    return location.pathname.startsWith(path);
  };

  const sidebarWidth = collapsed ? 0 : 296;

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#f5f5f7] text-[#1d1d1f]">
      {mobileOpen && (
        <button
          aria-label="关闭菜单遮罩"
          className="fixed inset-0 z-[55] bg-black/24 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`
          ios-frosted fixed inset-y-0 left-0 z-[60] flex h-full shrink-0 flex-col overflow-hidden
          border-r border-white/60 transition-[width] duration-300 ease-out lg:static lg:z-auto
          ${mobileOpen ? '!w-[296px]' : ''}
        `}
        style={{ width: mobileOpen ? 296 : sidebarWidth }}
      >
        <div className="flex min-w-[296px] items-center justify-between px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <button
            onClick={() => {
              navigate('/chat');
              setMobileOpen(false);
            }}
            className="flex min-h-11 items-center gap-3 rounded-full pr-3 text-left transition active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1d1d1f] text-[15px] font-semibold text-white">
              E
            </div>
            <div>
              <div className="text-[17px] font-semibold leading-tight tracking-[-0.01em]">
                Elfin
              </div>
              <div className="text-xs leading-tight text-[#7a7a7a]">温柔记录每段关系</div>
            </div>
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="ios-icon-button lg:hidden"
            aria-label="关闭菜单"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-w-[296px] px-4 pb-4">
          <button
            onClick={() => {
              navigate('/chat/new');
              setMobileOpen(false);
            }}
            className="ios-button-primary w-full"
          >
            <Plus size={18} weight="bold" />
            新对话
          </button>
        </div>

        <nav ref={navRef} className="min-w-[296px] px-3 pb-3">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className={`
                  mb-1 flex min-h-11 w-full items-center gap-3 rounded-full px-4 text-[15px]
                  transition active:scale-[0.98]
                  ${active ? 'bg-[#0066cc] text-white' : 'text-[#4d4d50] hover:bg-white/70 hover:text-[#1d1d1f]'}
                `}
              >
                <item.icon size={20} weight={active ? 'fill' : 'regular'} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mx-5 h-px min-w-[256px] bg-black/5" />

        <div className="min-w-[296px] flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 flex items-center justify-between px-3">
            <p className="text-xs font-medium text-[#7a7a7a]">
              {showArchived ? '归档对话' : '最近对话'}
            </p>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-[#7a7a7a]">
              {conversations.length}
            </span>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-full bg-white/55 p-1">
            <button
              onClick={() => setShowArchived(false)}
              className={`min-h-8 rounded-full text-xs font-medium transition ${
                !showArchived ? 'bg-[#0066cc] text-white' : 'text-[#7a7a7a] hover:bg-white/70'
              }`}
            >
              最近
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`min-h-8 rounded-full text-xs font-medium transition ${
                showArchived ? 'bg-[#0066cc] text-white' : 'text-[#7a7a7a] hover:bg-white/70'
              }`}
            >
              归档
            </button>
          </div>
          <div ref={conversationListRef} className="space-y-1">
            {conversations.map((conv) => {
              const active = location.pathname === `/chat/${conv.id}`;
              return (
                <div
                  key={conv.id}
                  className={`
                    group flex items-start gap-1 rounded-2xl px-2 py-2 transition
                    ${active ? 'bg-white text-[#0066cc]' : 'text-[#4d4d50] hover:bg-white/60'}
                  `}
                >
                  <button
                    onClick={() => {
                      navigate(`/chat/${conv.id}`);
                      setMobileOpen(false);
                    }}
                    className="min-w-0 flex-1 px-1 text-left active:scale-[0.99]"
                  >
                    <div className="truncate text-sm font-medium">{formatConversationTitle(conv)}</div>
                    <div className="mt-0.5 truncate text-xs text-[#8e8e93]">
                      {conv.last_message?.content || '还没有消息'}
                    </div>
                  </button>
                  <div className="flex shrink-0 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      onClick={() => handleRenameConversation(conv)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#8e8e93] hover:bg-white hover:text-[#0066cc]"
                      title="重命名"
                      aria-label="重命名"
                    >
                      <PencilSimple size={15} />
                    </button>
                    <button
                      onClick={() => handleArchiveConversation(conv)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#8e8e93] hover:bg-white hover:text-[#0066cc]"
                      title={conv.is_archived ? '恢复' : '归档'}
                      aria-label={conv.is_archived ? '恢复' : '归档'}
                    >
                      <Archive size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteConversation(conv)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#8e8e93] hover:bg-white hover:text-[#ff3b30]"
                      title="删除"
                      aria-label="删除"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
            {conversations.length === 0 && (
              <div className="rounded-2xl bg-white/55 px-4 py-5 text-center text-sm text-[#8e8e93]">
                {showArchived ? '暂时没有归档对话' : '开始一段新的对话吧'}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-[296px] border-t border-black/5 p-4 safe-bottom">
          <div className="flex items-center justify-between rounded-3xl bg-white/70 p-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f2ff] text-sm font-semibold text-[#0066cc]">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-[#1d1d1f]">
                  {user?.username || '用户'}
                </div>
                <div className="text-xs text-[#8e8e93]">已登录</div>
              </div>
            </div>
            <button
              onClick={openSettings}
              className="ios-icon-button !h-10 !w-10 border-transparent bg-transparent text-[#8e8e93] hover:text-[#0066cc]"
              title="模型设置"
              aria-label="模型设置"
            >
              <Gear size={17} />
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="ios-icon-button !h-10 !w-10 border-transparent bg-transparent text-[#8e8e93] hover:text-[#ff3b30]"
              title="退出登录"
              aria-label="退出登录"
            >
              <SignOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="ios-icon-button absolute top-5 z-30 hidden !h-9 !w-9 text-[#6e6e73] transition-all duration-300 lg:flex"
        style={{ left: collapsed ? 12 : 280 }}
        aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
      >
        <CaretLeft size={14} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      <button
        onClick={() => setMobileOpen(true)}
        className="ios-icon-button fixed left-4 top-[max(1rem,env(safe-area-inset-top))] z-50 lg:hidden"
        aria-label="打开菜单"
      >
        <List size={20} />
      </button>

      <main className="min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </main>

      {settingsOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/28 px-4 backdrop-blur-sm">
          <section className="ios-panel w-full max-w-md p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.01em]">模型设置</h2>
                <p className="mt-1 text-xs text-[#7a7a7a]">
                  {llmSettings?.is_configured ? `已保存 ${llmSettings.api_key_masked}` : '未配置 API Key'}
                </p>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="ios-icon-button !h-9 !w-9"
                aria-label="关闭"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[#7a7a7a]">API Key</span>
                <input
                  type="password"
                  value={llmForm.api_key}
                  onChange={(e) => setLlmForm((prev) => ({ ...prev, api_key: e.target.value }))}
                  placeholder={llmSettings?.is_configured ? '留空则保留当前密钥' : '输入 API Key'}
                  className="ios-input"
                />
                {llmSettings?.is_configured && (
                  <button
                    type="button"
                    onClick={clearApiKey}
                    disabled={settingsSaving}
                    className="mt-2 text-xs font-medium text-[#ff3b30] disabled:opacity-45"
                  >
                    清空已保存密钥
                  </button>
                )}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[#7a7a7a]">Base URL</span>
                <input
                  value={llmForm.api_base}
                  onChange={(e) => setLlmForm((prev) => ({ ...prev, api_base: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                  className="ios-input"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[#7a7a7a]">模型</span>
                <input
                  value={llmForm.model}
                  onChange={(e) => setLlmForm((prev) => ({ ...prev, model: e.target.value }))}
                  placeholder="gpt-4o-mini"
                  className="ios-input"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[#7a7a7a]">超时秒数</span>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={llmForm.timeout}
                  onChange={(e) =>
                    setLlmForm((prev) => ({
                      ...prev,
                      timeout: Math.max(5, Math.min(300, Number(e.target.value) || 60)),
                    }))
                  }
                  className="ios-input"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setSettingsOpen(false)} className="ios-button-secondary">
                取消
              </button>
              <button onClick={saveSettings} disabled={settingsSaving} className="ios-button-primary">
                <Check size={17} weight="bold" />
                保存
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
