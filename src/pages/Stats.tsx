import { useRelativeStore } from '../stores/useRelativeStore';
import { RELATION_CATEGORIES, getRelationCategory } from '../types';
import { Users, UserCheck, Calendar, MessageSquare } from 'lucide-react';

export default function Stats() {
  const { relatives } = useRelativeStore();

  const totalRelatives = relatives.length;
  const familyCount = relatives.filter(r => getRelationCategory(r.relation) === '家人').length;
  const friendCount = relatives.filter(r => getRelationCategory(r.relation) === '朋友').length;
  const withChatStyle = relatives.filter(r => r.chatStyle).length;

  const categoryStats = [
    ...RELATION_CATEGORIES.map(c => ({
      label: c.label,
      count: relatives.filter(r => c.items.some(item => item.key === r.relation)).length
    })),
    {
      label: '自定义',
      count: relatives.filter(r => getRelationCategory(r.relation) === '自定义').length
    }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-5 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#2D2A26]">数据统计</h1>
        <p className="text-sm text-gray-400 mt-0.5">查看你的亲友管理情况</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        <div className="bg-white rounded-xl p-4 border border-gray-50">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
            <Users size={18} className="text-[#E8734A]" />
          </div>
          <div className="text-2xl font-bold text-[#2D2A26]">{totalRelatives}</div>
          <div className="text-xs text-gray-400">亲友总数</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-50">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center mb-3">
            <UserCheck size={18} className="text-[#5B8C6E]" />
          </div>
          <div className="text-2xl font-bold text-[#2D2A26]">{familyCount}</div>
          <div className="text-xs text-gray-400">家人数量</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-50">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
            <Calendar size={18} className="text-[#7B68EE]" />
          </div>
          <div className="text-2xl font-bold text-[#2D2A26]">{friendCount}</div>
          <div className="text-xs text-gray-400">朋友数量</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-50">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <MessageSquare size={18} className="text-[#4A90D9]" />
          </div>
          <div className="text-2xl font-bold text-[#2D2A26]">{withChatStyle}</div>
          <div className="text-xs text-gray-400">已导入风格</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-50">
        <h3 className="font-semibold text-sm mb-4">亲友分布</h3>
        <div className="space-y-3">
          {categoryStats.map(stat => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-14 text-xs text-gray-400 shrink-0">{stat.label}</div>
              <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E8734A] rounded-full transition-all"
                  style={{ width: `${totalRelatives > 0 ? (stat.count / totalRelatives) * 100 : 0}%` }}
                />
              </div>
              <div className="w-6 text-right text-xs font-medium text-gray-500">{stat.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
