import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRelativeStore } from '../stores/useRelativeStore';
import { getEventsForDate } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, Gift, Heart, CalendarDays } from 'lucide-react';
import { useGsapEntrance } from '../hooks/useGsapEntrance';

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

const EVENT_META: Record<string, { icon: typeof Gift; badge: string; badgeText: string }> = {
  birthday: { icon: Gift, badge: 'bg-[#e9f2ff] text-[#0066cc]', badgeText: '生日' },
  mothers_day: { icon: Heart, badge: 'bg-[#f7edff] text-[#af52de]', badgeText: '母亲节' },
  fathers_day: { icon: CalendarDays, badge: 'bg-[#eef8f1] text-[#248a3d]', badgeText: '父亲节' },
};

export default function Calendar() {
  const { relatives } = useRelativeStore();
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const pageRef = useRef<HTMLDivElement>(null);
  const daysRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLElement>(null);

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

  const getEvents = (day: number) => getEventsForDate(new Date(currentYear, currentMonth, day), relatives);
  const selectedEvents = selectedDay ? getEvents(selectedDay) : [];

  const monthEvents: Array<{ day: number; event: (typeof selectedEvents)[0] }> = [];
  for (let day = 1; day <= daysInMonth; day++) {
    getEvents(day).forEach((event) => monthEvents.push({ day, event }));
  }

  useGsapEntrance(pageRef, [], { selector: '[data-gsap-page]', y: 18, stagger: 0.06 });
  useGsapEntrance(daysRef, [currentYear, currentMonth], { y: 8, scale: 0.96, duration: 0.34, stagger: 0.008 });
  useGsapEntrance(sideRef, [selectedDay, monthEvents.length], { selector: '[data-gsap-event]', y: 10, stagger: 0.035 });

  return (
    <div className="ios-page h-full overflow-y-auto">
      <div ref={pageRef} className="ios-container">
        <header className="ios-header" data-gsap-page>
          <div>
            <p className="ios-kicker">日历</p>
            <h1 className="ios-title">把节日整理清楚。</h1>
            <p className="ios-subtitle">查看亲友生日、母亲节、父亲节，以及本月需要留意的日期。</p>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]" data-gsap-page>
          <section className="ios-panel p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <button onClick={prevMonth} className="ios-icon-button" aria-label="上个月">
                <ChevronLeft size={19} />
              </button>
              <div className="text-center">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                  {currentYear}年 {MONTHS[currentMonth]}
                </h2>
                <p className="mt-0.5 text-xs text-[#8e8e93]">{monthEvents.length} 个事件</p>
              </div>
              <button onClick={nextMonth} className="ios-icon-button" aria-label="下个月">
                <ChevronRight size={19} />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="py-2 text-center text-xs font-medium text-[#8e8e93]">
                  {day}
                </div>
              ))}
            </div>

            <div ref={daysRef} className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`e${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const events = getEvents(day);
                const now = new Date();
                const isToday =
                  now.getDate() === day && now.getMonth() === currentMonth && now.getFullYear() === currentYear;
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`
                      aspect-square rounded-[18px] p-1 text-center transition active:scale-[0.96]
                      ${isToday ? 'bg-[#0066cc] text-white' : ''}
                      ${!isToday && isSelected ? 'bg-[#e9f2ff] text-[#0066cc]' : ''}
                      ${!isToday && !isSelected ? 'hover:bg-white/80' : ''}
                    `}
                  >
                    <div className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-current'}`}>{day}</div>
                    {events.length > 0 && (
                      <div className="mt-1 flex justify-center gap-1">
                        {events.slice(0, 3).map((_, idx) => (
                          <div key={idx} className={`h-1 w-1 rounded-full ${isToday ? 'bg-white/80' : 'bg-[#0066cc]'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <aside ref={sideRef} className="ios-panel p-5">
            {selectedDay ? (
              <>
                <div className="mb-4">
                  <p className="ios-kicker">选中日期</p>
                  <h3 className="text-xl font-semibold tracking-[-0.01em] text-[#1d1d1f]">
                    {currentMonth + 1}月{selectedDay}日
                  </h3>
                </div>
                {selectedEvents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEvents.map((event, idx) => {
                      const meta = EVENT_META[event.type] || EVENT_META.birthday;
                      const Icon = meta.icon;
                      return (
                        <button
                          key={`${event.id}-${event.type}-${idx}`}
                          onClick={() => event.id && navigate(`/detail/${event.id}`)}
                          data-gsap-event
                          className="ios-card flex w-full items-center gap-3 p-3 text-left"
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.badge}`}>
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-[#1d1d1f]">{event.label}</div>
                            <div className="mt-0.5 text-xs text-[#8e8e93]">{meta.badgeText}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p data-gsap-event className="rounded-2xl bg-white/65 px-4 py-6 text-center text-sm text-[#8e8e93]">
                    这一天没有事件。
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="mb-4">
                  <p className="ios-kicker">本月</p>
                  <h3 className="text-xl font-semibold tracking-[-0.01em] text-[#1d1d1f]">全部事件</h3>
                </div>
                {monthEvents.length === 0 ? (
                  <p data-gsap-event className="rounded-2xl bg-white/65 px-4 py-6 text-center text-sm text-[#8e8e93]">
                    本月暂无事件。
                  </p>
                ) : (
                  <div className="space-y-2">
                    {monthEvents.map(({ day, event }, idx) => {
                      const meta = EVENT_META[event.type] || EVENT_META.birthday;
                      return (
                        <button
                          key={`${day}-${event.type}-${idx}`}
                          onClick={() => {
                            setSelectedDay(day);
                            if (event.id) navigate(`/detail/${event.id}`);
                          }}
                          data-gsap-event
                          className="ios-card flex w-full items-center gap-3 p-3 text-left"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f2ff] text-sm font-semibold text-[#0066cc]">
                            {day}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-[#1d1d1f]">{event.label}</div>
                            <div className="mt-0.5 text-xs text-[#8e8e93]">{meta.badgeText}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
