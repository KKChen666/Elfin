import { useRelativeStore } from '../stores/useRelativeStore';
import { getUpcomingEvents } from '../utils/dateUtils';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const EVENT_STYLES: Record<string, { bg: string; icon: string; badgeClass: string; badgeText: string }> = {
  birthday: { bg: 'bg-gradient-to-br from-[#FFF5EE] to-[#FFE8D8]', icon: '🎂', badgeClass: 'bg-[#FFE0D0] text-[#E8734A]', badgeText: '生日' },
  mothers_day: { bg: 'bg-gradient-to-br from-[#FFF0F5] to-[#FFE0EB]', icon: '👩', badgeClass: 'bg-[#FFD6E8] text-[#D4469D]', badgeText: '母节' },
  fathers_day: { bg: 'bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]', icon: '👨', badgeClass: 'bg-[#BFDBFE] text-[#3B82F6]', badgeText: '父节' }
};

function getCountdownText(days: number): string {
  if (days === 0) return '就是今天！';
  if (days === 1) return '明天~';
  if (days <= 3) return `${days}天后`;
  if (days <= 7) return `还有${days}天`;
  return `${days}天后`;
}

function getCountdownEmoji(days: number): string {
  if (days === 0) return '🎉';
  if (days <= 3) return '🔥';
  if (days <= 7) return '⏰';
  return '📆';
}

export default function Reminders() {
  const { relatives } = useRelativeStore();
  const events = getUpcomingEvents(relatives);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-[#3D2E22]">提醒管理</h1>
          <span className="text-lg">🔔</span>
        </div>
        <p className="text-xs text-[#C0A898] mt-0.5">
          {events.length > 0
            ? <>最近有 <span className="font-semibold text-[#E8734A]">{events.length}</span> 件事情要关注哦~</>
            : '查看即将到来的生日和节日'}
        </p>
      </header>

      {events.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">😴</div>
          <p className="text-[#8B7B6B] font-medium mb-1">暂时没有提醒</p>
          <p className="text-xs text-[#C0A898]">添加亲友后会自动生成提醒哦~</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map((event, index) => {
            const style = EVENT_STYLES[event.type] || EVENT_STYLES.birthday;
            return (
              <Link
                key={`${event.id}-${event.type}-${index}`}
                to={`/detail/${event.id}`}
                className="block rounded-2xl p-4 border border-[#F5E6D8] active:scale-[0.99] transition-all duration-150"
                style={{
                  background: event.type === 'birthday' ? 'linear-gradient(135deg, #FFF5EE, #FFE8D8)'
                    : event.type === 'mothers_day' ? 'linear-gradient(135deg, #FFF0F5, #FFE0EB)'
                    : 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center text-2xl shrink-0"
                    style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-[#3D2E22] truncate">{event.name}</h3>
                    <p className="text-[11px] text-[#A09080] mt-0.5">
                      {event.date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-lg">{getCountdownEmoji(event.daysUntil)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      event.daysUntil <= 3
                        ? 'bg-[#FFE0D0] text-[#E8734A]'
                        : event.daysUntil <= 7
                          ? 'bg-[#FFF0D0] text-[#D4A017]'
                          : 'bg-[#D5F5E3] text-[#27AE60]'
                    }`}>
                      {getCountdownText(event.daysUntil)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
