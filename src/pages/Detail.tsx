import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, MessageSquare } from 'lucide-react';
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
    <div className="p-4">
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/edit/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={() => navigate(`/import/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <MessageSquare size={20} />
          </button>
          <button onClick={handleDelete} className="p-2 hover:bg-red-100 text-red-500 rounded-lg">
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="text-center mb-6">
        {relative.avatarImage ? (
          <img 
            src={relative.avatarImage} 
            alt={relative.name}
            className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-[#E8734A]"
          />
        ) : (
          <AvatarPreview avatar={relative.avatar} size={96} />
        )}
        <h1 className="text-2xl font-bold mt-3">{relative.name}</h1>
        <p className="text-gray-500">{getRelationLabel(relative.relation)}</p>
        {(relative.zodiac || relative.chineseZodiac) && (
          <div className="flex justify-center gap-2 mt-2">
            {relative.zodiac && (
              <span className="text-sm text-[#E8734A] bg-orange-50 px-2 py-1 rounded">{relative.zodiac}</span>
            )}
            {relative.chineseZodiac && (
              <span className="text-sm text-[#E8734A] bg-orange-50 px-2 py-1 rounded">{relative.chineseZodiac}</span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#E8734A]">{daysUntilBirthday ?? '-'}</div>
          <div className="text-sm text-gray-500">天后生日</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#5B8C6E]">{formatDate(relative.birthday)}</div>
          <div className="text-sm text-gray-500">{relative.isLunar ? '农历' : '公历'}生日</div>
        </div>
      </div>

      <div className="space-y-3">
        {relative.mbti && (
          <div className="bg-white rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#9B59B6] flex items-center justify-center text-white text-xs font-bold">MBTI</div>
            <div>
              <div className="text-sm text-gray-500">人格类型</div>
              <div className="font-medium">{relative.mbti}</div>
            </div>
          </div>
        )}

        {relative.address && (
          <div className="bg-white rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#3498DB] flex items-center justify-center text-white">📍</div>
            <div>
              <div className="text-sm text-gray-500">居住地址</div>
              <div className="font-medium">{relative.address}</div>
            </div>
          </div>
        )}

        {relative.hobbies && (
          <div className="bg-white rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E8734A] flex items-center justify-center text-white">❤️</div>
            <div>
              <div className="text-sm text-gray-500">喜好</div>
              <div className="font-medium">{relative.hobbies}</div>
            </div>
          </div>
        )}

        {relative.clothingSize && (
          <div className="bg-white rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#5B8C6E] flex items-center justify-center text-white">👕</div>
            <div>
              <div className="text-sm text-gray-500">衣服码号</div>
              <div className="font-medium">{relative.clothingSize}</div>
            </div>
          </div>
        )}

        {relative.shoeSize && (
          <div className="bg-white rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7B68EE] flex items-center justify-center text-white">👟</div>
            <div>
              <div className="text-sm text-gray-500">鞋码</div>
              <div className="font-medium">{relative.shoeSize}</div>
            </div>
          </div>
        )}

        {relative.phone && (
          <div className="bg-white rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4A90D9] flex items-center justify-center text-white">📱</div>
            <div>
              <div className="text-sm text-gray-500">手机号</div>
              <div className="font-medium">{relative.phone}</div>
            </div>
          </div>
        )}

        {relative.notes && (
          <div className="bg-white rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E8C94A] flex items-center justify-center text-white">📝</div>
            <div>
              <div className="text-sm text-gray-500">备注</div>
              <div className="font-medium">{relative.notes}</div>
            </div>
          </div>
        )}

        {relative.chatStyle && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold mb-3">说话风格</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">高频词：</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {relative.chatStyle.highFrequencyWords.slice(0, 5).map((word, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-sm">{word}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">常用表情：</span>
                <span className="ml-2">{relative.chatStyle.commonEmojis.slice(0, 5).join(' ')}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">性格：</span>
                <span className="ml-2">{relative.chatStyle.personality}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
