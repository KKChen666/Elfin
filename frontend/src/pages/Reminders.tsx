import { useRelativeStore } from '../stores/useRelativeStore';
import { getUpcomingEvents } from '../utils/dateUtils';
import { Link } from 'react-router-dom';
import { Bell, CalendarBlank, Gift, Heart } from '@phosphor-icons/react';
import { useRef } from 'react';
import { useGsapEntrance } from '../hooks/useGsapEntrance';

const EVENT_META: Record<string, { icon: typeof Gift; badgeText: string; tint: string }> = {
  birthday: { icon: Gift, badgeText: '生日', tint: 'text-[#0066cc] bg-[#e9f2ff]' },
  mothers_day: { icon: Heart, badgeText: '母亲节', tint: 'text-[#af52de] bg-[#f7edff]' },
  fathers_day: { icon: CalendarBlank, badgeText: '父亲节', tint: 'text-[#248a3d] bg-[#eef8f1]' },
};

function getCountdownText(days: number): string {
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  return `${days} 天后`;
}

export default function Reminders() {
  const { relatives } = useRelativeStore();
  const events = getUpcomingEvents(relatives);
  const pageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useGsapEntrance(pageRef, [], { selector: '[data-gsap-page]', y: 18, stagger: 0.06 });
  useGsapEntrance(listRef, [events.length], { y: 12, stagger: 0.045 });

  return (
    <div className="ios-page h-full overflow-y-auto">
      <div ref={pageRef} className="ios-container">
        <header className="ios-header" data-gsap-page>
          <div>
            <p className="ios-kicker">提醒</p>
            <h1 className="ios-title">别错过重要日子。</h1>
            <p className="ios-subtitle">
              {events.length > 0 ? (
                <>
                  最近有 <span className="font-semibold text-[#0066cc]">{events.length}</span> 件事情值得关注。
                </>
              ) : (
                '添加亲友后，生日和节日会自动整理到这里。'
              )}
            </p>
          </div>
        </header>

        {events.length === 0 ? (
          <div ref={listRef} className="ios-panel flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f2ff] text-[#0066cc]">
              <Bell size={30} />
            </div>
            <h2 className="text-xl font-semibold">暂时没有提醒</h2>
            <p className="mt-2 text-sm text-[#7a7a7a]">这里会安静地等到真正需要提醒你的时候。</p>
          </div>
        ) : (
          <div ref={listRef} className="grid gap-3" data-gsap-page>
            {events.map((event, index) => {
              const meta = EVENT_META[event.type] || EVENT_META.birthday;
              const Icon = meta.icon;
              return (
                <Link
                  key={`${event.id}-${event.type}-${index}`}
                  to={event.id ? `/detail/${event.id}` : '/calendar'}
                  className="ios-card block p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${meta.tint}`}>
                      <Icon size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[16px] font-semibold text-[#1d1d1f]">{event.name}</h3>
                      <p className="mt-0.5 text-sm text-[#7a7a7a]">
                        {event.date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="rounded-full bg-[#f5f5f7] px-3 py-1 text-sm font-semibold text-[#1d1d1f]">
                        {getCountdownText(event.daysUntil)}
                      </div>
                      <div className="mt-1 text-xs text-[#8e8e93]">{meta.badgeText}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
