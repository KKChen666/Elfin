import { useRelativeStore } from '../stores/useRelativeStore';
import { RELATION_CATEGORIES, getRelationCategory } from '../types';
import { Users, UserCheck, Calendar, ChatCircle } from '@phosphor-icons/react';
import { useRef } from 'react';
import { useGsapEntrance } from '../hooks/useGsapEntrance';

const statIcons = [Users, UserCheck, Calendar, ChatCircle];

export default function Stats() {
  const { relatives } = useRelativeStore();
  const pageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const totalRelatives = relatives.length;
  const familyCount = relatives.filter((r) => getRelationCategory(r.relation) === '家人').length;
  const friendCount = relatives.filter((r) => getRelationCategory(r.relation) === '朋友').length;
  const withChatStyle = relatives.filter((r) => r.chatStyle).length;

  const summary = [
    { label: '亲友总数', value: totalRelatives },
    { label: '家人数量', value: familyCount },
    { label: '朋友数量', value: friendCount },
    { label: '已导入风格', value: withChatStyle },
  ];

  const categoryStats = [
    ...RELATION_CATEGORIES.map((c) => ({
      label: c.label,
      count: relatives.filter((r) => c.items.some((item) => item.key === r.relation)).length,
    })),
    {
      label: '自定义',
      count: relatives.filter((r) => getRelationCategory(r.relation) === '自定义').length,
    },
  ];

  useGsapEntrance(pageRef, [], { selector: '[data-gsap-page]', y: 18, stagger: 0.06 });
  useGsapEntrance(cardsRef, [totalRelatives], { y: 14, stagger: 0.05 });

  return (
    <div className="ios-page h-full overflow-y-auto">
      <div ref={pageRef} className="ios-container">
        <header className="ios-header" data-gsap-page>
          <div>
            <p className="ios-kicker">统计</p>
            <h1 className="ios-title">关系记忆的轮廓。</h1>
            <p className="ios-subtitle">用轻量数据看看你记录了哪些人，以及哪些关系已经有了沟通风格。</p>
          </div>
        </header>

        <div ref={cardsRef} className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4" data-gsap-page>
          {summary.map((item, index) => {
            const Icon = statIcons[index];
            return (
              <div key={item.label} className="ios-card p-4">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f8] text-[#202123]">
                  <Icon size={19} />
                </div>
                <div className="text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">{item.value}</div>
                <div className="mt-1 text-sm text-[#7a7a7a]">{item.label}</div>
              </div>
            );
          })}
        </div>

        <section ref={panelRef} className="ios-panel p-5" data-gsap-page>
          <h2 className="mb-5 text-xl font-semibold tracking-[-0.01em]">亲友分布</h2>
          <div className="space-y-4">
            {categoryStats.map((stat) => {
              const width = totalRelatives > 0 ? (stat.count / totalRelatives) * 100 : 0;
              return (
                <div key={stat.label} className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3">
                  <div className="text-sm text-[#6e6e73]">{stat.label}</div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/5">
                    <div data-stat-bar className="h-full rounded-full bg-[#202123]" style={{ width: `${width}%` }} />
                  </div>
                  <div className="text-right text-sm font-semibold text-[#1d1d1f]">{stat.count}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

