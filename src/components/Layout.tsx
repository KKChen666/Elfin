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
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="max-w-lg mx-auto flex justify-around">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  isActive ? 'text-[#E8734A]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <item.icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
