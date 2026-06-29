import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  CaretLeft,
  ChartBar,
  ChatCircleDots,
  List,
  Plus,
  Robot,
  SignOut,
  Sparkle,
  Users,
  X,
} from '@phosphor-icons/react';
import gsap from 'gsap';
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const conversationListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [location.pathname]);

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

  const loadConversations = async () => {
    try {
      const res = await conversationsApi.getAll();
      setConversations(res.data);
    } catch {
      setConversations([]);
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
            <p className="text-xs font-medium text-[#7a7a7a]">最近对话</p>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-[#7a7a7a]">
              {conversations.length}
            </span>
          </div>
          <div ref={conversationListRef} className="space-y-1">
            {conversations.map((conv) => {
              const active = location.pathname === `/chat/${conv.id}`;
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    navigate(`/chat/${conv.id}`);
                    setMobileOpen(false);
                  }}
                  className={`
                    w-full rounded-2xl px-3 py-2.5 text-left transition active:scale-[0.99]
                    ${active ? 'bg-white text-[#0066cc]' : 'text-[#4d4d50] hover:bg-white/60'}
                  `}
                >
                  <div className="truncate text-sm font-medium">{formatConversationTitle(conv)}</div>
                  <div className="mt-0.5 truncate text-xs text-[#8e8e93]">
                    {conv.last_message?.content || '还没有消息'}
                  </div>
                </button>
              );
            })}
            {conversations.length === 0 && (
              <div className="rounded-2xl bg-white/55 px-4 py-5 text-center text-sm text-[#8e8e93]">
                开始一段新的对话吧
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
    </div>
  );
}
