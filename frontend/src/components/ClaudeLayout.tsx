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
  ShareNetwork,
  SignOut,
  Sparkle,
  PencilSimple,
  Trash,
  Users,
  X,
} from '@phosphor-icons/react';
import { authApi, LLMSettings } from '../api/auth';
import { conversationsApi, Conversation } from '../api/conversations';
import { useAuthStore } from '../stores/useAuthStore';
import { showToast } from './toastBus';
import { ConfirmDialog, TextPromptDialog } from './AppDialog';

const navItems = [
  { path: '/chat', icon: ChatCircleDots, label: '对话' },
  { path: '/agents', icon: Robot, label: 'Agents' },
  { path: '/skills', icon: Sparkle, label: '技能' },
  { path: '/relatives', icon: Users, label: '亲友' },
  { path: '/network', icon: ShareNetwork, label: '关系网' },
  { path: '/reminders', icon: Bell, label: '提醒' },
  { path: '/calendar', icon: Calendar, label: '日历' },
  { path: '/stats', icon: ChartBar, label: '统计' },
];

type ConversationView = 'recent' | 'archived' | 'deleted';

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
  const [conversationView, setConversationView] = useState<ConversationView>('recent');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [llmSettings, setLlmSettings] = useState<LLMSettings | null>(null);
  const [llmForm, setLlmForm] = useState({
    api_key: '',
    api_base: '',
    model: '',
    timeout: 60,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);
  const [isRenamingConversation, setIsRenamingConversation] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const conversationListRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await conversationsApi.getAll(
        conversationView === 'archived',
        conversationView === 'deleted',
      );
      setConversations(res.data);
    } catch {
      setConversations([]);
    }
  }, [conversationView]);

  useEffect(() => {
    loadConversations();
  }, [location.pathname, loadConversations]);

  useEffect(() => {
    window.addEventListener('elfin:conversations-changed', loadConversations);
    return () => window.removeEventListener('elfin:conversations-changed', loadConversations);
  }, [loadConversations]);

  const handleRenameConversation = (conv: Conversation) => {
    setRenameTarget(conv);
  };

  const confirmRenameConversation = async (title: string) => {
    if (!renameTarget || isRenamingConversation) return;
    setIsRenamingConversation(true);
    try {
      await conversationsApi.update(renameTarget.id, { title: title.trim() || null });
      setRenameTarget(null);
      await loadConversations();
    } catch {
      showToast('error', '重命名失败');
    } finally {
      setIsRenamingConversation(false);
    }
  };

  const handleArchiveConversation = async (conv: Conversation) => {
    if (conv.is_deleted) return;
    try {
      if (conv.is_archived) {
        await conversationsApi.restore(conv.id);
      } else {
        await conversationsApi.archive(conv.id);
        if (location.pathname === `/chat/${conv.id}`) navigate('/chat');
      }
      await loadConversations();
    } catch {
      showToast('error', conv.is_archived ? '恢复失败' : '归档失败');
    }
  };

  const handleRestoreDeletedConversation = async (conv: Conversation) => {
    try {
      await conversationsApi.restoreDeleted(conv.id);
      await loadConversations();
      showToast('success', '对话已恢复');
    } catch {
      showToast('error', '恢复失败');
    }
  };

  const handleDeleteConversation = async (conv: Conversation) => {
    setDeleteTarget(conv);
  };

  const confirmDeleteConversation = async () => {
    if (!deleteTarget || isDeletingConversation) return;
    setIsDeletingConversation(true);
    try {
      await conversationsApi.delete(deleteTarget.id);
      if (location.pathname === `/chat/${deleteTarget.id}`) navigate('/chat');
      setDeleteTarget(null);
      await loadConversations();
      showToast('success', '对话已删除');
    } catch {
      showToast('error', '删除失败');
    } finally {
      setIsDeletingConversation(false);
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
      showToast('error', '模型设置加载失败');
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
      showToast('success', '模型设置已保存');
    } catch {
      showToast('error', '模型设置保存失败');
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
      showToast('success', 'API Key 已清空');
    } catch {
      showToast('error', '清空 API Key 失败');
    } finally {
      setSettingsSaving(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/chat') return location.pathname.startsWith('/chat');
    return location.pathname.startsWith(path);
  };

  const sidebarWidth = collapsed ? 0 : 288;

  return (
    <div className="relative flex h-screen overflow-hidden bg-white text-[#202123]">
      {mobileOpen && (
        <button
          aria-label="关闭菜单遮罩"
          className="fixed inset-0 z-[55] bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-[60] flex h-full shrink-0 flex-col overflow-hidden border-r border-[#e5e7eb]
          bg-[#f7f7f8] lg:static lg:z-auto
          ${mobileOpen ? '!w-[288px]' : ''}
        `}
        style={{ width: mobileOpen ? 288 : sidebarWidth }}
      >
        <div className="flex min-w-[288px] items-center justify-between px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button
            onClick={() => {
              navigate('/chat');
              setMobileOpen(false);
            }}
            className="flex min-h-10 items-center gap-2 rounded-2xl px-2 text-left hover:bg-[#ececf1]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#202123] text-[13px] font-semibold text-white">
              E
            </div>
            <div>
              <div className="text-[15px] font-semibold leading-tight">
                Elfin
              </div>
              <div className="text-[11px] leading-tight text-[#6b7280]">关系与 Agent 工作台</div>
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

        <div className="min-w-[288px] px-3 pb-3">
          <button
            onClick={() => {
              navigate('/chat/new');
              setMobileOpen(false);
            }}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#d9d9e3] bg-white px-3 text-sm font-medium text-[#202123] hover:bg-[#f1f1f3]"
          >
            <Plus size={18} weight="bold" />
            新对话
          </button>
        </div>

        <nav ref={navRef} className="min-w-[288px] px-2 pb-2">
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
                  mb-0.5 flex min-h-9 w-full items-center gap-3 rounded-2xl px-3 text-sm
                  ${active ? 'bg-[#ececf1] text-[#202123]' : 'text-[#4b5563] hover:bg-[#ececf1] hover:text-[#202123]'}
                `}
              >
                <item.icon size={20} weight={active ? 'fill' : 'regular'} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mx-3 h-px min-w-[264px] bg-[#e5e7eb]" />

        <div className="min-w-[288px] flex-1 overflow-y-auto px-2 py-3">
          <div className="mb-2 flex items-center justify-between px-3">
            <p className="text-xs font-medium text-[#6b7280]">
              {conversationView === 'deleted' ? '回收站' : conversationView === 'archived' ? '归档对话' : '最近对话'}
            </p>
            <span className="rounded-full bg-[#ececf1] px-2 py-0.5 text-[11px] text-[#6b7280]">
              {conversations.length}
            </span>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-1 rounded-full bg-[#ececf1] p-1">
            <button
              onClick={() => setConversationView('recent')}
              className={`min-h-8 rounded-full text-xs font-medium transition ${
                conversationView === 'recent' ? 'bg-white text-[#202123] shadow-sm' : 'text-[#6b7280] hover:bg-white/70'
              }`}
            >
              最近
            </button>
            <button
              onClick={() => setConversationView('archived')}
              className={`min-h-8 rounded-full text-xs font-medium transition ${
                conversationView === 'archived' ? 'bg-white text-[#202123] shadow-sm' : 'text-[#6b7280] hover:bg-white/70'
              }`}
            >
              归档
            </button>
            <button
              onClick={() => setConversationView('deleted')}
              className={`min-h-8 rounded-full text-xs font-medium transition ${
                conversationView === 'deleted' ? 'bg-white text-[#202123] shadow-sm' : 'text-[#6b7280] hover:bg-white/70'
              }`}
            >
              回收站
            </button>
          </div>
          <div ref={conversationListRef} className="space-y-1">
            {conversations.map((conv) => {
              const active = location.pathname === `/chat/${conv.id}`;
              return (
                <div
                  key={conv.id}
                  className={`
                    group flex items-start gap-1 rounded-2xl px-2 py-2
                    ${active ? 'bg-[#ececf1] text-[#202123]' : 'text-[#4b5563] hover:bg-[#ececf1]'}
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
                    <div className="mt-0.5 truncate text-xs text-[#8a8f98]">
                      {conv.last_message?.content || '还没有消息'}
                    </div>
                  </button>
                  <div className="flex shrink-0 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    {!conv.is_deleted && (
                      <button
                        onClick={() => handleRenameConversation(conv)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a8f98] hover:bg-white hover:text-[#202123]"
                        title="重命名"
                        aria-label="重命名"
                      >
                        <PencilSimple size={15} />
                      </button>
                    )}
                    {conv.is_deleted ? (
                      <button
                        onClick={() => handleRestoreDeletedConversation(conv)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a8f98] hover:bg-white hover:text-[#202123]"
                        title="恢复"
                        aria-label="恢复"
                      >
                        <Archive size={15} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleArchiveConversation(conv)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a8f98] hover:bg-white hover:text-[#202123]"
                          title={conv.is_archived ? '恢复' : '归档'}
                          aria-label={conv.is_archived ? '恢复' : '归档'}
                        >
                          <Archive size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteConversation(conv)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a8f98] hover:bg-white hover:text-[#dc2626]"
                          title="删除"
                          aria-label="删除"
                        >
                          <Trash size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {conversations.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#d9d9e3] bg-white px-4 py-5 text-center text-sm text-[#8a8f98]">
                {conversationView === 'deleted'
                  ? '回收站是空的'
                  : conversationView === 'archived'
                    ? '暂时没有归档对话'
                    : '开始一段新的对话吧'}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-[288px] border-t border-[#e5e7eb] p-3 safe-bottom">
          <div className="flex items-center justify-between rounded-2xl p-1.5 hover:bg-[#ececf1]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#202123] ring-1 ring-[#d9d9e3]">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-[#202123]">
                  {user?.username || '用户'}
                </div>
                <div className="text-xs text-[#8a8f98]">已登录</div>
              </div>
            </div>
            <button
              onClick={openSettings}
              className="ios-icon-button !h-9 !w-9 border-transparent bg-transparent text-[#6b7280] hover:bg-white hover:text-[#202123]"
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
              className="ios-icon-button !h-9 !w-9 border-transparent bg-transparent text-[#6b7280] hover:bg-white hover:text-[#dc2626]"
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
        className="ios-icon-button absolute top-3 z-30 hidden !h-8 !w-8 text-[#6b7280] lg:flex"
        style={{ left: collapsed ? 12 : 272 }}
        aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
      >
        <CaretLeft size={14} className={collapsed ? 'rotate-180' : ''} />
      </button>

      <button
        onClick={() => setMobileOpen(true)}
        className="ios-icon-button fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 lg:hidden"
        aria-label="打开菜单"
      >
        <List size={20} />
      </button>

      <main className="min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </main>

      {settingsOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4">
          <section className="ios-panel w-full max-w-md p-5 shadow-xl">
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

      <TextPromptDialog
        open={Boolean(renameTarget)}
        title="重命名对话"
        label="给这个对话起一个更容易识别的名字。"
        initialValue={renameTarget ? formatConversationTitle(renameTarget) : ''}
        placeholder="输入对话名称"
        loading={isRenamingConversation}
        onCancel={() => setRenameTarget(null)}
        onConfirm={confirmRenameConversation}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除这个对话？"
        detail={deleteTarget ? formatConversationTitle(deleteTarget) : ''}
        description="删除后，这个对话会进入回收站，消息记录暂时保留，可在回收站恢复。"
        confirmLabel="确认删除"
        danger
        loading={isDeletingConversation}
        icon={<Trash size={20} weight="bold" />}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteConversation}
      />
    </div>
  );
}
