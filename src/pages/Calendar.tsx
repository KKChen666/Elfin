import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRelativeStore } from '../stores/useRelativeStore';
import { getEventsForDate } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

const EVENT_COLORS: Record<string, { bg: string; dot: string; badge: string }> = {
  birthday: { bg: 'bg-orange-50', dot: 'bg-[#E8734A]', badge: 'bg-orange-100 text-orange-600' },
  mothers_day: { bg: 'bg-pink-50', dot: 'bg-pink-400', badge: 'bg-pink-100 text-pink-600' },
  fathers_day: { bg: 'bg-blue-50', dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-600' }
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
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const getEvents = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return getEventsForDate(date, relatives);
  };

  const selectedEvents = selectedDay ? getEvents(selectedDay) : [];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-5 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#2D2A26]">节日日历</h1>
        <p className="text-sm text-gray-400 mt-0.5">查看亲友生日和节日提醒</p>
      </header>

      <div className="lg:flex lg:gap-6">
        {/* 日历主体 */}
        <div className="bg-white rounded-xl p-4 border border-gray-50 mb-4 lg:mb-0 lg:flex-1">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-base font-semibold">{currentYear}年 {MONTHS[currentMonth]}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="text-center text-xs text-gray-400 py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const events = getEvents(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square p-1 rounded-lg text-center transition-colors ${
                    isToday
                      ? 'bg-[#E8734A] text-white'
                      : isSelected
                        ? 'bg-orange-100'
                        : events.length > 0
                          ? 'bg-orange-50/60'
                          : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-xs md:text-sm font-medium ${isToday ? 'text-white' : 'text-gray-600'}`}>{day}</div>
                  {events.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {events.slice(0, 3).map((e, idx) => (
                        <div key={idx} className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : EVENT_COLORS[e.type]?.dot || 'bg-gray-300'}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 右侧面板 */}
        <div className="bg-white rounded-xl p-4 border border-gray-50 lg:w-64 xl:w-72 shrink-0">
          {selectedDay ? (
            <>
              <h3 className="font-semibold text-sm mb-3">
                {currentMonth + 1}月{selectedDay}日事件
              </h3>
              {selectedEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedEvents.map((event, idx) => (
                    <button
                      key={`${event.id}-${event.type}-${idx}`}
                      onClick={() => event.id && navigate(`/detail/${event.id}`)}
                      className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-left transition-colors ${event.id ? 'active:bg-gray-50' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${EVENT_COLORS[event.type]?.bg || 'bg-gray-50'}`}>
                        {event.type === 'birthday' ? '🎂' : event.type === 'mothers_day' ? '👩' : '👨'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{event.label}</div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${EVENT_COLORS[event.type]?.badge || 'bg-gray-100 text-gray-500'}`}>
                        {event.type === 'birthday' ? '生日' : event.type === 'mothers_day' ? '母节' : '父节'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">这一天没有事件</p>
              )}
            </>
          ) : (
            <>
              <h3 className="font-semibold text-sm mb-3">本月事件</h3>
              {(() => {
                const monthEvents: Array<{ day: number; event: typeof selectedEvents[0] }> = [];
                for (let d = 1; d <= daysInMonth; d++) {
                  getEvents(d).forEach(e => monthEvents.push({ day: d, event: e }));
                }
                if (monthEvents.length === 0) {
                  return <p className="text-xs text-gray-400 py-4 text-center">本月暂无事件</p>;
                }
                return (
                  <div className="space-y-2">
                    {monthEvents.map(({ day, event }, idx) => (
                      <button
                        key={`${day}-${event.type}-${idx}`}
                        onClick={() => {
                          setSelectedDay(day);
                          if (event.id) navigate(`/detail/${event.id}`);
                        }}
                        className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-left active:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#E8734A] text-xs font-semibold shrink-0">
                          {day}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{event.label}</div>
                        </div>
                      </button>
                    ))}
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
