import { useRelativeStore } from '../stores/useRelativeStore';
import { getUpcomingEvents } from '../utils/dateUtils';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Reminders() {
  const { relatives } = useRelativeStore();
  const events = getUpcomingEvents(relatives);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-5 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#2D2A26]">提醒管理</h1>
        <p className="text-sm text-gray-400 mt-0.5">查看即将到来的生日和节日</p>
      </header>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400">暂无提醒</p>
          <p className="text-xs text-gray-300 mt-1">添加亲友后会自动生成提醒</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {events.map((event, index) => (
            <Link
              key={`${event.id}-${event.type}-${index}`}
              to={`/detail/${event.id}`}
              className="block bg-white rounded-xl p-4 border border-gray-50 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-lg shrink-0">
                  {event.type === 'birthday' ? '🎂' : event.type === 'mothers_day' ? '👩' : '👨'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{event.name}</h3>
                  <p className="text-xs text-gray-400">
                    距离 {event.daysUntil} 天 · {event.date.toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
                  event.daysUntil <= 3
                    ? 'bg-red-50 text-red-500'
                    : event.daysUntil <= 7
                    ? 'bg-yellow-50 text-yellow-600'
                    : 'bg-green-50 text-green-600'
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
