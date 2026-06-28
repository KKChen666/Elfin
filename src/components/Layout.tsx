import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Bell, Calendar, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '广场', emoji: '🏠' },
  { path: '/reminders', icon: Bell, label: '提醒', emoji: '🔔' },
  { path: '/calendar', icon: Calendar, label: '日历', emoji: '📅' },
  { path: '/stats', icon: BarChart3, label: '统计', emoji: '📊' }
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F5] to-[#FFF3EB] flex">
      {/* 桌面端侧边栏 */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-64 bg-white/80 backdrop-blur-sm border-r border-[#F5E6D8] fixed inset-y-0 left-0 z-40">
        <div className="px-5 py-6 border-b border-[#F5E6D8]">
          <h1 className="text-lg font-bold text-[#3D2E22] flex items-center gap-2">
            <span className="text-xl">🧸</span>
            亲友管理
          </h1>
          <p className="text-xs text-[#C0A898] mt-0.5">记录身边重要的人</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FFE8D8] to-[#FFF0E5] text-[#E8734A] font-semibold shadow-sm'
                    : 'text-[#8B7B6B] hover:bg-[#FFF5EE] hover:text-[#5C4A3A]'
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-[#F5E6D8]">
          <p className="text-[11px] text-[#D0BBA8] text-center">用爱记录每一份情谊 💕</p>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col lg:ml-56 xl:ml-64">
        <main className="flex-1 pb-24 lg:pb-6">
          <div className="mx-auto max-w-3xl lg:max-w-4xl xl:max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 移动端底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-white/90 backdrop-blur-md border-t border-[#F5E6D8] shadow-[0_-2px_20px_rgba(0,0,0,0.04)]">
          <div className="max-w-lg mx-auto flex justify-around px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[56px] ${
                    isActive ? 'text-[#E8734A]' : 'text-[#C0A898]'
                  }`}
                >
                  <span className={`text-base transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                    {item.emoji}
                  </span>
                  <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-[#E8734A] mt-[-1px]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
