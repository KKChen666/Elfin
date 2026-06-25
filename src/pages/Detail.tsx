import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, MessageSquare, Bot } from 'lucide-react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { getRelationLabel } from '../types';
import AvatarPreview from '../components/avatar/AvatarPreview';
import { getDaysUntilBirthday, formatDate } from '../utils/dateUtils';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRelative, deleteRelative } = useRelativeStore();
  const relative = getRelative(id || '');

  if (!relative) {
    return <div className="p-4 text-center">亲友不存在</div>;
  }

  const daysUntilBirthday = getDaysUntilBirthday(relative.birthday, relative.isLunar);

  const handleDelete = () => {
    if (confirm('确定要删除这位亲友吗？')) {
      deleteRelative(id || '');
      navigate('/');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/edit/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={() => navigate(`/import/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="导入聊天记录"
          >
            <MessageSquare size={20} />
          </button>
          <button
            onClick={() => navigate(`/chat/${id}`)}
            className={`p-2 rounded-lg transition-colors ${
              relative.chatStyle
                ? 'hover:bg-orange-50 text-[#E8734A]'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title={relative.chatStyle ? '与分身对话' : '请先导入聊天记录'}
            disabled={!relative.chatStyle}
          >
            <Bot size={20} />
          </button>
          <button onClick={handleDelete} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="lg:flex lg:gap-8 lg:items-start">
        {/* 左侧：头像和基本信息 */}
        <div className="text-center mb-6 lg:mb-0 lg:min-w-[200px]">
          {relative.avatarImage ? (
            <img
              src={relative.avatarImage}
              alt={relative.name}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover mx-auto border-2 border-[#E8734A]"
            />
          ) : (
            <div className="flex justify-center">
              <AvatarPreview avatar={relative.avatar} size={96} />
            </div>
          )}
          <h1 className="text-xl md:text-2xl font-bold mt-3">{relative.name}</h1>
          <p className="text-gray-400">{getRelationLabel(relative.relation)}</p>
          {(relative.zodiac || relative.chineseZodiac) && (
            <div className="flex justify-center gap-2 mt-2">
              {relative.zodiac && (
                <span className="text-xs text-[#E8734A] bg-orange-50 px-2 py-0.5 rounded">{relative.zodiac}</span>
              )}
              {relative.chineseZodiac && (
                <span className="text-xs text-[#E8734A] bg-orange-50 px-2 py-0.5 rounded">{relative.chineseZodiac}</span>
              )}
            </div>
          )}
        </div>

        {/* 右侧：详细信息 */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white rounded-xl p-4 text-center border border-gray-50">
              <div className="text-2xl md:text-3xl font-bold text-[#E8734A]">{daysUntilBirthday ?? '-'}</div>
              <div className="text-xs text-gray-400 mt-1">天后生日</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-gray-50">
              <div className="text-2xl md:text-3xl font-bold text-[#5B8C6E]">{formatDate(relative.birthday)}</div>
              <div className="text-xs text-gray-400 mt-1">{relative.isLunar ? '农历' : '公历'}生日</div>
            </div>
          </div>

          <div className="space-y-2.5">
            {relative.mbti && (
              <div className="bg-white rounded-xl p-3.5 flex items-center gap-3 border border-gray-50">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 text-xs font-bold shrink-0">MBTI</div>
                <div>
                  <div className="text-xs text-gray-400">人格类型</div>
                  <div className="text-sm font-medium">{relative.mbti}</div>
                </div>
              </div>
            )}

            {relative.address && (
              <div className="bg-white rounded-xl p-3.5 flex items-center gap-3 border border-gray-50">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-sm shrink-0">📍</div>
                <div>
                  <div className="text-xs text-gray-400">居住地址</div>
                  <div className="text-sm font-medium">{relative.address}</div>
                </div>
              </div>
            )}

            {relative.hobbies && (
              <div className="bg-white rounded-xl p-3.5 flex items-center gap-3 border border-gray-50">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-sm shrink-0">❤️</div>
                <div>
                  <div className="text-xs text-gray-400">喜好</div>
                  <div className="text-sm font-medium">{relative.hobbies}</div>
                </div>
              </div>
            )}

            {relative.clothingSize && (
              <div className="bg-white rounded-xl p-3.5 flex items-center gap-3 border border-gray-50">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-sm shrink-0">👕</div>
                <div>
                  <div className="text-xs text-gray-400">衣服码号</div>
                  <div className="text-sm font-medium">{relative.clothingSize}</div>
                </div>
              </div>
            )}

            {relative.shoeSize && (
              <div className="bg-white rounded-xl p-3.5 flex items-center gap-3 border border-gray-50">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-sm shrink-0">👟</div>
                <div>
                  <div className="text-xs text-gray-400">鞋码</div>
                  <div className="text-sm font-medium">{relative.shoeSize}</div>
                </div>
              </div>
            )}

            {relative.phone && (
              <div className="bg-white rounded-xl p-3.5 flex items-center gap-3 border border-gray-50">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-sm shrink-0">📱</div>
                <div>
                  <div className="text-xs text-gray-400">手机号</div>
                  <div className="text-sm font-medium">{relative.phone}</div>
                </div>
              </div>
            )}

            {relative.notes && (
              <div className="bg-white rounded-xl p-3.5 flex items-center gap-3 border border-gray-50">
                <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center text-sm shrink-0">📝</div>
                <div>
                  <div className="text-xs text-gray-400">备注</div>
                  <div className="text-sm font-medium">{relative.notes}</div>
                </div>
              </div>
            )}

            {relative.chatStyle && (
              <div className="bg-white rounded-xl p-4 border border-gray-50">
                <h3 className="font-semibold text-sm mb-3">说话风格</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-400">高频词：</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {relative.chatStyle.highFrequencyWords.slice(0, 5).map((word, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-50 rounded text-xs text-gray-600">{word}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">常用表情：</span>
                    <span className="ml-2 text-sm">{relative.chatStyle.commonEmojis.slice(0, 5).join(' ')}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">性格：</span>
                    <span className="ml-2 text-sm">{relative.chatStyle.personality}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
