import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ChatCircleDots, Plus, SignOut, CaretLeft,
  Robot, Sparkle, Users, Bell, Calendar, ChartBar,
  List, X
} from '@phosphor-icons/react';
import { useAuthStore } from '../stores/useAuthStore';
import { conversationsApi, Conversation } from '../api/conversations';
import gsap from 'gsap';

export default function ClaudeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    loadConversations();
  }, [location.pathname]);

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.from(sidebarRef.current, { x: -20, opacity: 0, duration: 0.4, ease: 'power2.out' });
    }
  }, []);

  const loadConversations = async () => {
    try {
      const res = await conversationsApi.getAll();
      setConversations(res.data);
    } catch {}
  };

  const navItems = [
    { path: '/chat', icon: ChatCircleDots, label: '对话' },
    { path: '/agents', icon: Robot, label: 'Agents' },
    { path: '/skills', icon: Sparkle, label: '技能' },
    { path: '/relatives', icon: Users, label: '亲友' },
    { path: '/reminders', icon: Bell, label: '提醒' },
    { path: '/calendar', icon: Calendar, label: '日历' },
    { path: '/stats', icon: ChartBar, label: '统计' },
  ];

  const isActive = (path: string) => {
    if (path === '/chat') return location.pathname.startsWith('/chat');
    return location.pathname.startsWith(path);
  };

  const sidebarWidth = collapsed ? 0 : 280;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-[55] lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* 侧边栏 */}
      <aside
        ref={sidebarRef}
        className={`
          bg-white border-r border-[#E8E8E8] flex flex-col h-full flex-shrink-0
          transition-[width] duration-300 ease-in-out overflow-hidden
          fixed inset-y-0 left-0 z-[60] lg:static lg:z-auto
          ${mobileOpen ? '!w-[280px]' : 'w-0 lg:w-[' + sidebarWidth + 'px]'}
        `}
        style={{ width: mobileOpen ? 280 : sidebarWidth }}
      >
        {/* 顶部 */}
        <div className="flex items-center justify-between p-5 border-b border-[#F0F0F0] flex-shrink-0 min-w-[280px]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8A33] flex items-center justify-center">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <span className="font-semibold text-[16px] text-[#1A1A1A]">Elfin</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-[#F7F8FA]">
            <X size={18} className="text-[#999]" />
          </button>
        </div>

        {/* 新建按钮 */}
        <div className="p-4 flex-shrink-0 min-w-[280px]">
          <button
            onClick={() => { navigate('/chat/new'); setMobileOpen(false); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6A00] text-white font-medium text-sm hover:bg-[#E55D00] transition-colors"
            style={{ boxShadow: '0 4px 16px rgba(255,106,0,0.3)' }}
          >
            <Plus size={18} weight="bold" />
            新对话
          </button>
        </div>

        {/* 导航 */}
        <nav className="px-3 mb-2 flex-shrink-0 min-w-[280px]">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-all duration-200 ${
                  active ? 'bg-[#FFF5EE] text-[#FF6A00] font-medium' : 'text-[#666] hover:bg-[#F7F8FA] hover:text-[#1A1A1A]'
                }`}
              >
                <item.icon size={20} weight={active ? 'fill' : 'regular'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 flex-shrink-0 min-w-[280px]"><div className="border-t border-[#F0F0F0]" /></div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0 min-w-[280px]">
          <p className="text-xs text-[#999] px-3 mb-2 font-medium">最近对话</p>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => { navigate(`/chat/${conv.id}`); setMobileOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm mb-0.5 truncate transition-all duration-200 ${
                location.pathname === `/chat/${conv.id}` ? 'bg-[#FFF5EE] text-[#FF6A00] font-medium' : 'text-[#666] hover:bg-[#F7F8FA]'
              }`}
            >
              {conv.title || '新对话'}
            </button>
          ))}
        </div>

        {/* 用户信息 */}
        <div className="p-4 border-t border-[#F0F0F0] flex-shrink-0 min-w-[280px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF8A33] flex items-center justify-center">
                <span className="text-xs font-bold text-white">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <span className="text-sm text-[#666]">{user?.username || '用户'}</span>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="p-2 rounded-lg hover:bg-[#F7F8FA] text-[#999] hover:text-[#FF3B30]" title="退出">
              <SignOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* 折叠按钮 */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute top-5 z-30 p-1.5 rounded-lg bg-white shadow-sm text-[#999] hover:text-[#1A1A1A] transition-all duration-300"
        style={{ left: collapsed ? 8 : 268 }}
      >
        <CaretLeft size={14} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* 移动端菜单按钮 */}
      <button onClick={() => setMobileOpen(true)} className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-white shadow-md">
        <List size={20} />
      </button>

      {/* 主内容 */}
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
