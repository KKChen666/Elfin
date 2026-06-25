import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Bell, Calendar, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '广场' },
  { path: '/reminders', icon: Bell, label: '提醒' },
  { path: '/calendar', icon: Calendar, label: '日历' },
  { path: '/stats', icon: BarChart3, label: '统计' }
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex">
      {/* 桌面端侧边栏 - 仅在 lg 及以上显示 */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-40">
        <div className="px-5 py-6 border-b border-gray-100">
          <h1 className="text-lg font-bold text-[#2D2A26]">亲友管理</h1>
          <p className="text-xs text-gray-400 mt-0.5">记录身边重要的人</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-[#E8734A] font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col lg:ml-56 xl:ml-64">
        <main className="flex-1 pb-20 lg:pb-6">
          <div className="mx-auto max-w-3xl lg:max-w-4xl xl:max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 移动端/平板底部导航 - 在 lg 以下显示 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
        <div className="max-w-lg mx-auto flex justify-around px-2 py-2 safe-bottom">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px] ${
                  isActive ? 'text-[#E8734A]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
