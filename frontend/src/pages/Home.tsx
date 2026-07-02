import { Link } from 'react-router-dom';
import { Plus, MagnifyingGlass, Users } from '@phosphor-icons/react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { RELATION_CATEGORIES, getRelationCategory } from '../types';
import AvatarCard from '../components/avatar/AvatarCard';
import { useRef, useState } from 'react';
import { useGsapEntrance } from '../hooks/useGsapEntrance';
import WorkflowGuide from '../components/WorkflowGuide';
import NextStepPanel from '../components/NextStepPanel';

const FILTER_OPTIONS = [
  { key: 'all', label: '全部' },
  ...RELATION_CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
  })),
  { key: 'custom', label: '自定义' },
];

export default function Home() {
  const { relatives } = useRelativeStore();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const pageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredRelatives = relatives.filter((r) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'custom' && getRelationCategory(r.relation) === '自定义') ||
      RELATION_CATEGORIES.find((c) => c.key === filter)?.items.some((item) => item.key === r.relation) ||
      r.relation === filter;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useGsapEntrance(pageRef, [], { selector: '[data-gsap-page]', y: 18, stagger: 0.055 });
  useGsapEntrance(gridRef, [filter, searchQuery, filteredRelatives.length], { y: 12, stagger: 0.035 });

  return (
    <div className="ios-page h-full overflow-y-auto">
      <div ref={pageRef} className="ios-container">
        <header className="ios-header" data-gsap-page>
          <div>
            <p className="ios-kicker">关系广场</p>
            <h1 className="ios-title">把重要的人放在眼前。</h1>
            <p className="ios-subtitle">
              你已经记录了 <span className="font-semibold text-[#202123]">{relatives.length}</span> 位亲友。
            </p>
          </div>
          <Link to="/add" className="ios-button-primary shrink-0">
            <Plus size={18} />
            添加亲友
          </Link>
        </header>

        <WorkflowGuide />

        {relatives.length > 0 && (
          <NextStepPanel
            eyebrow="把资料变成能力"
            title="选一位亲友导入聊天记录"
            description="亲友资料已经开始沉淀了。下一步可以进入某位亲友详情页，导入聊天记录，提取表达风格和可检索记忆。"
            actions={[
              { label: '查看亲友', to: '/relatives', primary: true },
              { label: '管理关系网', to: '/network' },
            ]}
          />
        )}

        <div className="ios-panel mb-5 p-3" data-gsap-page>
          <div className="flex items-center gap-2">
            <MagnifyingGlass size={18} className="ml-2 shrink-0 text-[#8e8e93]" />
            <input
              type="text"
              placeholder="搜索亲友"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-11 flex-1 bg-transparent px-2 text-[15px] outline-none placeholder:text-[#8e8e93]"
            />
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide" data-gsap-page>
          {FILTER_OPTIONS.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className="ios-chip"
              data-active={filter === item.key}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filteredRelatives.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {filteredRelatives.map((relative) => (
              <Link key={relative.id} to={`/detail/${relative.id}`} className="ios-card block overflow-hidden">
                <AvatarCard relative={relative} />
              </Link>
            ))}
            <Link
              to="/add"
              className="ios-card flex min-h-[188px] flex-col items-center justify-center gap-3 border-dashed text-[#202123]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f7f8]">
                <Plus size={24} />
              </div>
              <span className="text-sm font-medium">添加亲友</span>
            </Link>
          </div>
        ) : (
          <div ref={gridRef} className="ios-panel flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f7f7f8] text-[#202123]">
              <Users size={30} />
            </div>
            <h2 className="text-xl font-semibold tracking-[-0.01em]">这里还没有人。</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#7a7a7a]">
              添加第一位亲友，Elfin 会帮你记住生日、关系细节和温柔的提醒。
            </p>
            <Link to="/add" className="ios-button-primary mt-6">
              添加第一位亲友
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

