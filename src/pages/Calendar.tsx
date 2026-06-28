import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRelativeStore } from '../stores/useRelativeStore';
import { getEventsForDate } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const MONTH_EMOJIS = ['⛄', '🧧', '🌸', '🌧️', '💐', '☀️', '🌻', '🏖️', '🍂', '🎃', '🎄', '🎊'];

const EVENT_META: Record<string, { emoji: string; badge: string; badgeText: string }> = {
  birthday: { emoji: '🎂', badge: 'bg-[#FFE0D0] text-[#E8734A]', badgeText: '生日' },
  mothers_day: { emoji: '👩', badge: 'bg-[#FFD6E8] text-[#D4469D]', badgeText: '母节' },
  fathers_day: { emoji: '👨', badge: 'bg-[#BFDBFE] text-[#3B82F6]', badgeText: '父节' }
};

export default function Calendar() {
  const { relatives } = useRelativeStore();
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDay(null);
  };

  const getEvents = (day: number) => getEventsForDate(new Date(currentYear, currentMonth, day), relatives);
  const selectedEvents = selectedDay ? getEvents(selectedDay) : [];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-[#3D2E22]">节日日历</h1>
          <span className="text-lg">{MONTH_EMOJIS[currentMonth]}</span>
        </div>
        <p className="text-xs text-[#C0A898] mt-0.5">查看亲友生日和节日提醒</p>
      </header>

      <div className="lg:flex lg:gap-5">
        {/* 日历主体 */}
        <div className="bg-white rounded-3xl p-4 border border-[#F5E6D8] mb-4 lg:mb-0 lg:flex-1"
          style={{ boxShadow: '0 2px 12px rgba(232,115,74,0.06)' }}>
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#FFF5EE] active:scale-90 transition-transform">
              <ChevronLeft size={18} className="text-[#E8734A]" />
            </button>
            <div className="text-center">
              <h2 className="text-base font-bold text-[#3D2E22]">{currentYear}年 {MONTHS[currentMonth]}</h2>
            </div>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#FFF5EE] active:scale-90 transition-transform">
              <ChevronRight size={18} className="text-[#E8734A]" />
            </button>
          </div>

          {/* 星期头 */}
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {['日', '一', '二', '三', '四', '五', '六'].map((day, i) => (
              <div key={day} className={`text-center text-[11px] font-medium py-1 rounded-lg ${
                i === 0 || i === 6 ? 'text-[#E8734A]' : 'text-[#C0A898]'
              }`}>{day}</div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const events = getEvents(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square p-1 rounded-2xl text-center transition-all duration-150 ${
                    isToday
                      ? 'bg-gradient-to-br from-[#E8734A] to-[#F09060] text-white shadow-sm'
                      : isSelected
                        ? 'bg-[#FFE8D8]'
                        : events.length > 0
                          ? 'bg-[#FFF8F4]'
                          : 'active:bg-[#FFF5EE]'
                  }`}
                >
                  <div className={`text-xs font-semibold ${isToday ? 'text-white' : events.length > 0 ? 'text-[#5C4A3A]' : 'text-[#8B7B6B]'}`}>
                    {day}
                  </div>
                  {events.length > 0 && (
                    <div className="flex justify-center gap-[2px] mt-0.5">
                      {events.slice(0, 3).map((e, idx) => (
                        <div key={idx} className={`w-[4px] h-[4px] rounded-full ${isToday ? 'bg-white/80' : 'bg-[#E8734A]'}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 右侧事件面板 */}
        <div className="bg-white rounded-3xl p-4 border border-[#F5E6D8] lg:w-64 xl:w-72 shrink-0"
          style={{ boxShadow: '0 2px 12px rgba(232,115,74,0.06)' }}>
          {selectedDay ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">📌</span>
                <h3 className="font-bold text-sm text-[#3D2E22]">{currentMonth + 1}月{selectedDay}日</h3>
              </div>
              {selectedEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedEvents.map((event, idx) => {
                    const meta = EVENT_META[event.type] || EVENT_META.birthday;
                    return (
                      <button
                        key={`${event.id}-${event.type}-${idx}`}
                        onClick={() => event.id && navigate(`/detail/${event.id}`)}
                        className={`w-full flex items-center gap-2.5 py-2.5 px-3 rounded-2xl text-left transition-all duration-150 ${
                          event.id ? 'bg-[#FFF8F4] active:bg-[#FFE8D8]' : 'bg-[#FFF8F4]'
                        }`}
                      >
                        <span className="text-lg shrink-0">{meta.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#3D2E22] truncate">{event.label}</div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${meta.badge}`}>
                          {meta.badgeText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-2xl mb-2">🌙</div>
                  <p className="text-xs text-[#C0A898]">这一天没有事件~</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">📋</span>
                <h3 className="font-bold text-sm text-[#3D2E22]">本月事件</h3>
              </div>
              {(() => {
                const monthEvents: Array<{ day: number; event: typeof selectedEvents[0] }> = [];
                for (let d = 1; d <= daysInMonth; d++) {
                  getEvents(d).forEach(e => monthEvents.push({ day: d, event: e }));
                }
                if (monthEvents.length === 0) {
                  return (
                    <div className="text-center py-6">
                      <div className="text-2xl mb-2">🌈</div>
                      <p className="text-xs text-[#C0A898]">本月暂无事件~</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {monthEvents.map(({ day, event }, idx) => {
                      const meta = EVENT_META[event.type] || EVENT_META.birthday;
                      return (
                        <button
                          key={`${day}-${event.type}-${idx}`}
                          onClick={() => { setSelectedDay(day); if (event.id) navigate(`/detail/${event.id}`); }}
                          className="w-full flex items-center gap-2.5 py-2 px-3 rounded-2xl text-left bg-[#FFF8F4] active:bg-[#FFE8D8] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#FFE8D8] flex items-center justify-center text-[#E8734A] text-xs font-bold shrink-0">
                            {day}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-[#3D2E22] truncate">{event.label}</div>
                          </div>
                          <span className="text-sm shrink-0">{meta.emoji}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
