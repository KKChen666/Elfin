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
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D2A26] font-['Outfit']">数据统计</h1>
        <p className="text-sm text-gray-500 mt-1">查看你的亲友管理情况</p>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
            <Users size={20} className="text-[#E8734A]" />
          </div>
          <div className="text-2xl font-bold text-[#2D2A26]">{totalRelatives}</div>
          <div className="text-sm text-gray-500">亲友总数</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
            <UserCheck size={20} className="text-[#5B8C6E]" />
          </div>
          <div className="text-2xl font-bold text-[#2D2A26]">{familyCount}</div>
          <div className="text-sm text-gray-500">家人数量</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
            <Calendar size={20} className="text-[#7B68EE]" />
          </div>
          <div className="text-2xl font-bold text-[#2D2A26]">{friendCount}</div>
          <div className="text-sm text-gray-500">朋友数量</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <MessageSquare size={20} className="text-[#4A90D9]" />
          </div>
          <div className="text-2xl font-bold text-[#2D2A26]">{withChatStyle}</div>
          <div className="text-sm text-gray-500">已导入风格</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold mb-4">亲友分布</h3>
        <div className="space-y-3">
          {categoryStats.map(stat => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-16 text-sm text-gray-500">{stat.label}</div>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E8734A] rounded-full transition-all"
                  style={{ width: `${totalRelatives > 0 ? (stat.count / totalRelatives) * 100 : 0}%` }}
                />
              </div>
              <div className="w-8 text-right text-sm font-medium">{stat.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
