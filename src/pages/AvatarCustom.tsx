import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shuffle } from 'lucide-react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { AvatarConfig, DEFAULT_AVATAR } from '../types';
import AvatarPreview from '../components/avatar/AvatarPreview';

const SKIN_COLORS = ['#FFD5B8', '#F5CBA7', '#E8B896', '#D4A574', '#C69C6D', '#A0785A'];
const HAIR_COLORS = ['#3D2314', '#5C3A1E', '#8B6914', '#D4A017', '#1A1A1A', '#696969', '#C0392B', '#E67E22'];
const CLOTHING_COLORS = ['#E8734A', '#5B8C6E', '#7B68EE', '#4A90D9', '#E8C94A', '#E74C3C', '#2C3E50', '#F39C12'];

const CATEGORIES = [
  { key: 'faceShape', label: '脸型', count: 6 },
  { key: 'hairstyle', label: '发型', count: 12 },
  { key: 'eyeStyle', label: '眼睛', count: 8 },
  { key: 'mouthStyle', label: '嘴巴', count: 6 },
  { key: 'clothing', label: '服饰', count: 10 },
  { key: 'accessory', label: '配饰', count: 8 }
];

export default function AvatarCustom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRelative, updateAvatar, addRelative } = useRelativeStore();
  const relative = id !== 'new' ? getRelative(id || '') : null;

  const [avatar, setAvatar] = useState<AvatarConfig>(relative?.avatar || DEFAULT_AVATAR);
  const [activeCategory, setActiveCategory] = useState('faceShape');

  const updateAvatarField = (field: keyof AvatarConfig, value: string | number) => {
    setAvatar(prev => ({ ...prev, [field]: value }));
  };

  const randomize = () => {
    setAvatar({
      faceShape: Math.floor(Math.random() * 6),
      hairstyle: Math.floor(Math.random() * 12),
      eyeStyle: Math.floor(Math.random() * 8),
      mouthStyle: Math.floor(Math.random() * 6),
      clothing: Math.floor(Math.random() * 10),
      accessory: Math.floor(Math.random() * 8),
      skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      clothingColor: CLOTHING_COLORS[Math.floor(Math.random() * CLOTHING_COLORS.length)]
    });
  };

  const handleSave = () => {
    if (id && id !== 'new') {
      updateAvatar(id, avatar);
      navigate(`/detail/${id}`);
    } else {
      navigate('/add', { state: { avatar } });
    }
  };

  const currentCategory = CATEGORIES.find(c => c.key === activeCategory);
  const colorKey = activeCategory === 'faceShape' ? 'skinColor' :
                   activeCategory === 'hairstyle' ? 'hairColor' :
                   activeCategory === 'clothing' ? 'clothingColor' : null;

  return (
    <div className="p-4 flex flex-col h-[calc(100vh-80px)]">
      <header className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">定制头像</h1>
        <button onClick={randomize} className="p-2 hover:bg-gray-100 rounded-lg">
          <Shuffle size={20} />
        </button>
      </header>

      <div className="flex justify-center mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <AvatarPreview avatar={avatar} size={160} />
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? 'bg-[#E8734A] text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {colorKey && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">颜色选择</p>
            <div className="flex flex-wrap gap-2">
              {(colorKey === 'skinColor' ? SKIN_COLORS :
                colorKey === 'hairColor' ? HAIR_COLORS : CLOTHING_COLORS).map(color => (
                <button
                  key={color}
                  onClick={() => updateAvatarField(colorKey, color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    avatar[colorKey] === color ? 'border-[#E8734A] scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {currentCategory && (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: currentCategory.count }, (_, i) => (
              <button
                key={i}
                onClick={() => updateAvatarField(activeCategory as keyof AvatarConfig, i)}
                className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${
                  avatar[activeCategory as keyof AvatarConfig] === i
                    ? 'border-[#E8734A] bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-lg font-semibold text-gray-500">{i + 1}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-[#E8734A] text-white rounded-xl font-semibold hover:bg-[#D4633A] transition-colors mt-4"
      >
        保存头像
      </button>
    </div>
  );
}
