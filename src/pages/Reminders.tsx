import { useRelativeStore } from '../stores/useRelativeStore';
import { getUpcomingEvents } from '../utils/dateUtils';
import { Bell, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Reminders() {
  const { relatives } = useRelativeStore();
  const events = getUpcomingEvents(relatives);

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D2A26] font-['Outfit']">提醒管理</h1>
        <p className="text-sm text-gray-500 mt-1">查看即将到来的生日和节日</p>
      </header>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">暂无提醒</p>
          <p className="text-sm text-gray-400 mt-1">添加亲友后会自动生成提醒</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <Link
              key={`${event.id}-${event.type}-${index}`}
              to={`/detail/${event.id}`}
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFF5F0] to-[#F0FFF5] flex items-center justify-center text-2xl">
                  {event.type === 'birthday' ? '🎂' : event.type === 'mothers_day' ? '👩' : '👨'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{event.name}</h3>
                  <p className="text-sm text-gray-500">
                    距离 {event.daysUntil} 天 · {event.date.toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  event.daysUntil <= 3
                    ? 'bg-red-100 text-red-600'
                    : event.daysUntil <= 7
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  {event.daysUntil <= 3 ? '紧急' : event.daysUntil <= 7 ? '即将到来' : '正常'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
