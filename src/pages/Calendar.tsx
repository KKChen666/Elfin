import { useState } from 'react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { getDaysUntilBirthday, getMothersDay, getFathersDay } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export default function Calendar() {
  const { relatives } = useRelativeStore();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

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
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getEventsForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const events: string[] = [];

    relatives.forEach(r => {
      const birthday = new Date(r.birthday);
      if (birthday.getMonth() === currentMonth && birthday.getDate() === day) {
        events.push(`${r.name}生日`);
      }
    });

    const mothersDay = getMothersDay(currentYear);
    if (mothersDay.getMonth() === currentMonth && mothersDay.getDate() === day) {
      events.push('母亲节');
    }

    const fathersDay = getFathersDay(currentYear);
    if (fathersDay.getMonth() === currentMonth && fathersDay.getDate() === day) {
      events.push('父亲节');
    }

    return events;
  };

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D2A26] font-['Outfit']">节日日历</h1>
        <p className="text-sm text-gray-500 mt-1">查看亲友生日和节日</p>
      </header>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold">{currentYear}年 {MONTHS[currentMonth]}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="text-center text-xs text-gray-500 py-1">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const events = getEventsForDay(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

            return (
              <div
                key={day}
                className={`aspect-square p-1 rounded-lg text-center ${
                  isToday ? 'bg-[#E8734A] text-white' : events.length > 0 ? 'bg-orange-50' : ''
                }`}
              >
                <div className={`text-sm font-medium ${isToday ? 'text-white' : 'text-gray-700'}`}>{day}</div>
                {events.length > 0 && (
                  <div className="text-xs truncate">{events[0]}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">本月事件</h3>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const events = getEventsForDay(day);
          if (events.length === 0) return null;
          return (
            <div key={day} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-[#E8734A] font-semibold">
                {day}
              </div>
              <div>
                {events.map((event, idx) => (
                  <div key={idx} className="text-sm">{event}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
