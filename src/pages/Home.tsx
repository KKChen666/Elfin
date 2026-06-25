import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { RELATION_CATEGORIES, getRelationCategory } from '../types';
import AvatarCard from '../components/avatar/AvatarCard';
import { useState } from 'react';

const FILTER_OPTIONS = [
  { key: 'all', label: '全部' },
  ...RELATION_CATEGORIES.map(c => ({ key: c.key, label: c.label })),
  { key: 'custom', label: '自定义' },
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
      <header className="mb-5 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#2D2A26]">亲友广场</h1>
        <p className="text-sm text-gray-400 mt-0.5">管理你的亲友信息</p>
      </header>

      <div className="flex items-center gap-2 mb-4 bg-white rounded-lg px-3 py-2 border border-gray-100">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="搜索亲友..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
        {FILTER_OPTIONS.map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
              filter === item.key
                ? 'bg-[#E8734A] text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#E8734A]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
        {filteredRelatives.map(relative => (
          <Link key={relative.id} to={`/detail/${relative.id}`}>
            <AvatarCard relative={relative} />
          </Link>
        ))}
        <Link
          to="/add"
          className="flex flex-col items-center justify-center p-4 hover:scale-[1.02] transition-transform"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-gray-300 hover:border-[#E8734A] flex items-center justify-center mb-2 transition-colors">
            <Plus size={28} className="text-gray-400" />
          </div>
          <span className="text-sm text-gray-400">添加亲友</span>
        </Link>
      </div>

      {relatives.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <p className="text-gray-400 mb-4">还没有添加任何亲友</p>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8734A] text-white rounded-lg hover:bg-[#D4633A] transition-colors"
          >
            <Plus size={16} />
            添加第一个亲友
          </Link>
        </div>
      )}
    </div>
  );
}
