import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarBlank, CaretLeft, CaretRight, Gift, Heart, Bell } from '@phosphor-icons/react';
import { ReminderEvent, remindersApi } from '../api/reminders';
import { showToast } from '../components/toastBus';
import { useRelativeStore } from '../stores/useRelativeStore';
import { getEventsForDate } from '../utils/dateUtils';

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const EVENT_META: Record<string, { icon: typeof Gift; badge: string; badgeText: string }> = {
  birthday: { icon: Gift, badge: 'bg-[#f7f7f8] text-[#202123]', badgeText: '生日' },
  mothers_day: { icon: Heart, badge: 'bg-[#f7edff] text-[#af52de]', badgeText: '母亲节' },
  fathers_day: { icon: CalendarBlank, badge: 'bg-[#eef8f1] text-[#248a3d]', badgeText: '父亲节' },
  custom: { icon: Bell, badge: 'bg-[#eef2ff] text-[#202123]', badgeText: '自定义' },
};

export default function Calendar() {
  const { relatives, loadRelatives, hasLoaded } = useRelativeStore();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<ReminderEvent[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  useEffect(() => {
    if (!hasLoaded) loadRelatives();
    loadReminders();
  }, [hasLoaded, loadRelatives]);

  const loadReminders = async () => {
    try {
      const res = await remindersApi.getAll();
      setReminders(res.data);
    } catch {
      showToast('error', '日历提醒加载失败');
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

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

  const getEvents = (day: number) => getEventsForDate(new Date(currentYear, currentMonth, day), relatives, reminders);
  const selectedEvents = selectedDay ? getEvents(selectedDay) : [];
  const monthEvents = Array.from({ length: daysInMonth }, (_, index) => index + 1)
    .flatMap((day) => getEvents(day).map((event) => ({ day, event })));

  return (
    <div className="ios-page h-full overflow-y-auto">
      <div className="ios-container">
        <header className="ios-header">
          <div>
            <p className="ios-kicker">日历</p>
            <h1 className="ios-title">把节日和提醒放在同一张日历里</h1>
            <p className="ios-subtitle">生日、父亲节、母亲节和自定义提醒都会出现在这里。</p>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="ios-panel p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <button onClick={prevMonth} className="ios-icon-button" aria-label="上个月">
                <CaretLeft size={19} />
              </button>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-[#1d1d1f]">
                  {currentYear}年 {MONTHS[currentMonth]}
                </h2>
                <p className="mt-0.5 text-xs text-[#8e8e93]">{monthEvents.length} 个事件</p>
              </div>
              <button onClick={nextMonth} className="ios-icon-button" aria-label="下个月">
                <CaretRight size={19} />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-2 text-center text-xs font-medium text-[#8e8e93]">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const events = getEvents(day);
                const now = new Date();
                const isToday = now.getDate() === day && now.getMonth() === currentMonth && now.getFullYear() === currentYear;
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square rounded-[18px] p-1 text-center transition active:scale-[0.96] ${
                      isToday ? 'bg-[#202123] text-white' : ''
                    } ${!isToday && isSelected ? 'bg-[#f7f7f8] text-[#202123]' : ''} ${
                      !isToday && !isSelected ? 'hover:bg-white/80' : ''
                    }`}
                  >
                    <div className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-current'}`}>{day}</div>
                    {events.length > 0 && (
                      <div className="mt-1 flex justify-center gap-1">
                        {events.slice(0, 3).map((event) => (
                          <div key={event.id} className={`h-1 w-1 rounded-full ${isToday ? 'bg-white/80' : 'bg-[#202123]'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="ios-panel p-5">
            <div className="mb-4">
              <p className="ios-kicker">{selectedDay ? '选中日期' : '本月'}</p>
              <h3 className="text-xl font-semibold text-[#1d1d1f]">
                {selectedDay ? `${currentMonth + 1}月${selectedDay}日` : '全部事件'}
              </h3>
            </div>
            {(selectedDay ? selectedEvents.map((event) => ({ day: selectedDay, event })) : monthEvents).length === 0 ? (
              <p className="rounded-2xl bg-white/65 px-4 py-6 text-center text-sm text-[#8e8e93]">
                这段时间还没有事件。
              </p>
            ) : (
              <div className="space-y-2">
                {(selectedDay ? selectedEvents.map((event) => ({ day: selectedDay, event })) : monthEvents).map(({ day, event }) => {
                  const meta = EVENT_META[event.type] || EVENT_META.birthday;
                  const Icon = meta.icon;
                  return (
                    <button
                      key={`${day}-${event.id}`}
                      onClick={() => event.relativeId && navigate(`/detail/${event.relativeId}`)}
                      className="ios-card flex w-full items-center gap-3 p-3 text-left"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.badge}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-[#1d1d1f]">{event.label}</div>
                        <div className="mt-0.5 text-xs text-[#8e8e93]">{selectedDay ? meta.badgeText : `${day}日 · ${meta.badgeText}`}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
