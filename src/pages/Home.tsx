import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { RELATION_CATEGORIES, getRelationCategory } from '../types';
import AvatarCard from '../components/avatar/AvatarCard';
import { useState } from 'react';

const FILTER_OPTIONS = [
  { key: 'all', label: '全部', emoji: '🌟' },
  ...RELATION_CATEGORIES.map(c => ({
    key: c.key,
    label: c.label,
    emoji: c.key === 'family' ? '👨‍👩‍👧' : c.key === 'friend' ? '🤝' : c.key === 'colleague' ? '💼' : '📚'
  })),
  { key: 'custom', label: '自定义', emoji: '✏️' },
];

export default function Home() {
  const { relatives } = useRelativeStore();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRelatives = relatives.filter(r => {
    const matchesFilter = filter === 'all'
      || (filter === 'custom' && getRelationCategory(r.relation) === '自定义')
      || RELATION_CATEGORIES.find(c => c.key === filter)?.items.some(item => item.key === r.relation)
      || r.relation === filter;
    const matchesSearch = r.name.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* 可爱头部 */}
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-[#3D2E22]">亲友广场</h1>
          <span className="text-lg">🏠</span>
        </div>
        <p className="text-xs text-[#C0A898] mt-0.5">
          你有 <span className="font-semibold text-[#E8734A]">{relatives.length}</span> 位亲友在等你关爱~
        </p>
      </header>

      {/* 搜索栏 */}
      <div className="flex items-center gap-2 mb-4 bg-white rounded-2xl px-3.5 py-2.5 border border-[#F5E6D8]"
        style={{ boxShadow: '0 2px 8px rgba(232,115,74,0.06)' }}>
        <Search size={16} className="text-[#D0BBA8]" />
        <input
          type="text"
          placeholder="搜索亲友..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-[#3D2E22] placeholder:text-[#D0BBA8]"
        />
      </div>

      {/* 筛选标签 */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_OPTIONS.map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 ${
              filter === item.key
                ? 'bg-gradient-to-r from-[#E8734A] to-[#F09060] text-white shadow-sm scale-105'
                : 'bg-white text-[#8B7B6B] border border-[#F0E4D8] active:scale-95'
            }`}
          >
            <span className="text-xs">{item.emoji}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 亲友卡片网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {filteredRelatives.map(relative => (
          <Link key={relative.id} to={`/detail/${relative.id}`}>
            <div className="bg-white rounded-2xl p-2 border border-[#F5E6D8] active:scale-[0.97] transition-all duration-150"
              style={{ boxShadow: '0 2px 8px rgba(232,115,74,0.06)' }}>
              <AvatarCard relative={relative} />
            </div>
          </Link>
        ))}
        <Link
          to="/add"
          className="flex flex-col items-center justify-center p-3 active:scale-[0.97] transition-transform"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-[#E0D0C4] active:border-[#E8734A] flex items-center justify-center mb-2 bg-white/60 transition-colors">
            <Plus size={24} className="text-[#D0BBA8]" />
          </div>
          <span className="text-xs text-[#C0A898] font-medium">添加亲友</span>
        </Link>
      </div>

      {/* 空状态 */}
      {relatives.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🧸</div>
          <p className="text-[#8B7B6B] font-medium mb-1">还没有添加任何亲友</p>
          <p className="text-xs text-[#C0A898] mb-5">快来记录你身边重要的人吧~</p>
          <Link
            to="/add"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#E8734A] to-[#F09060] text-white rounded-full text-sm font-semibold shadow-md active:scale-95 transition-transform"
            style={{ boxShadow: '0 4px 14px rgba(232,115,74,0.3)' }}
          >
            <Plus size={16} />
            添加第一位亲友
          </Link>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
