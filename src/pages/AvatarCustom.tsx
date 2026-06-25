import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image, Sparkles, Palette, RotateCcw } from 'lucide-react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { AvatarConfig, DEFAULT_AVATAR } from '../types';
import AvatarPreview from '../components/avatar/AvatarPreview';
import ImageUploader from '../components/avatar/ImageUploader';

const SKIN_COLORS = [
  { color: '#FFD5B8', name: '浅肤色' },
  { color: '#F5CBA7', name: '暖白' },
  { color: '#E8B896', name: '自然' },
  { color: '#D4A574', name: '小麦' },
  { color: '#C69C6D', name: '蜜糖' },
  { color: '#A0785A', name: '巧克力' }
];
const HAIR_COLORS = [
  { color: '#1A1A1A', name: '黑发' },
  { color: '#3D2314', name: '深棕' },
  { color: '#5C3A1E', name: '栗色' },
  { color: '#8B6914', name: '金棕' },
  { color: '#D4A017', name: '金色' },
  { color: '#C0392B', name: '酒红' },
  { color: '#E67E22', name: '橘色' },
  { color: '#696969', name: '银灰' }
];
const CLOTHING_COLORS = [
  { color: '#E8734A', name: '落日橙' },
  { color: '#E74C3C', name: '热情红' },
  { color: '#F39C12', name: '暖阳黄' },
  { color: '#5B8C6E', name: '森林绿' },
  { color: '#4A90D9', name: '天空蓝' },
  { color: '#7B68EE', name: '梦幻紫' },
  { color: '#2C3E50', name: '深空灰' },
  { color: '#FF69B4', name: '甜心粉' }
];

const CATEGORIES = [
  { key: 'faceShape', label: '脸型', icon: '🫥', count: 6 },
  { key: 'hairstyle', label: '发型', icon: '💇', count: 12 },
  { key: 'eyeStyle', label: '眼睛', icon: '👀', count: 8 },
  { key: 'mouthStyle', label: '嘴巴', icon: '👄', count: 6 },
  { key: 'clothing', label: '服饰', icon: '👕', count: 10 },
  { key: 'accessory', label: '配饰', icon: '✨', count: 8 }
];

type AvatarMode = 'upload' | 'customize';

export default function AvatarCustom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRelative, updateAvatar } = useRelativeStore();
  const relative = id !== 'new' ? getRelative(id || '') : null;

  const [mode, setMode] = useState<AvatarMode>('customize');
  const [avatar, setAvatar] = useState<AvatarConfig>(relative?.avatar || DEFAULT_AVATAR);
  const [avatarImage, setAvatarImage] = useState<string>(relative?.avatarImage || '');
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
      skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)].color,
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].color,
      clothingColor: CLOTHING_COLORS[Math.floor(Math.random() * CLOTHING_COLORS.length)].color
    });
  };

  const handleSave = () => {
    if (id && id !== 'new') {
      if (mode === 'upload' && avatarImage) {
        updateAvatar(id, avatar, avatarImage);
      } else {
        updateAvatar(id, avatar);
      }
      navigate(`/detail/${id}`);
    } else {
      navigate('/add', { state: { avatar, avatarImage: mode === 'upload' ? avatarImage : undefined } });
    }
  };

  const currentCategory = CATEGORIES.find(c => c.key === activeCategory);
  const colorKey = activeCategory === 'faceShape' ? 'skinColor' :
                   activeCategory === 'hairstyle' ? 'hairColor' :
                   activeCategory === 'clothing' ? 'clothingColor' : null;
  const colorOptions = colorKey === 'skinColor' ? SKIN_COLORS :
                       colorKey === 'hairColor' ? HAIR_COLORS :
                       colorKey === 'clothingColor' ? CLOTHING_COLORS : null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] lg:min-h-[calc(100vh-1rem)] bg-[#FAFAF7]">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm px-4 md:px-6 pt-3 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <h1 className="text-base font-semibold text-gray-800">
            {mode === 'upload' ? '照片头像' : '捏脸工坊'}
          </h1>
          <button onClick={randomize} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors" title="随机生成">
            <RotateCcw size={18} className="text-[#E8734A]" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 md:px-6 pb-4">
        <div className="max-w-3xl mx-auto lg:flex lg:gap-8">
          {/* 预览区域 */}
          <div className="lg:w-56 shrink-0">
            <div className="flex justify-center py-5">
              <div className="rounded-3xl overflow-hidden border-2 border-[#E8734A]"
                style={{ boxShadow: '0 6px 24px rgba(232,115,74,0.15)' }}>
                {mode === 'upload' && avatarImage ? (
                  <div className="w-40 h-44 overflow-hidden">
                    <img src={avatarImage} alt="头像" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <AvatarPreview avatar={avatar} size={160} />
                )}
              </div>
            </div>

            {/* 模式切换 */}
            <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setMode('customize')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm transition-colors ${
                  mode === 'customize'
                    ? 'bg-white text-[#E8734A] font-medium shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Sparkles size={14} />
                <span>素材捏脸</span>
              </button>
              <button
                onClick={() => setMode('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm transition-colors ${
                  mode === 'upload'
                    ? 'bg-white text-[#E8734A] font-medium shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Image size={14} />
                <span>上传照片</span>
              </button>
            </div>
          </div>

          {/* 编辑区域 */}
          <div className="flex-1">
            {/* 上传模式 */}
            {mode === 'upload' && (
              <div className="animate-fadeIn">
                <ImageUploader
                  onImageCropped={(base64) => setAvatarImage(base64)}
                  currentImage={avatarImage}
                />
              </div>
            )}

            {/* 捏脸模式 */}
            {mode === 'customize' && (
              <div className="animate-fadeIn">
                {/* 分类标签 */}
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                        activeCategory === cat.key
                          ? 'bg-[#E8734A] text-white'
                          : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* 颜色选择器 */}
                {colorOptions && colorKey && (
                  <div className="mb-4 bg-white rounded-xl p-4 border border-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Palette size={14} className="text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">
                        {colorKey === 'skinColor' ? '肤色' : colorKey === 'hairColor' ? '发色' : '衣服颜色'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {colorOptions.map(({ color, name }) => (
                        <button
                          key={color}
                          onClick={() => updateAvatarField(colorKey, color)}
                          className="group flex flex-col items-center gap-1"
                        >
                          <div className={`w-8 h-8 rounded-full transition-transform ${
                            avatar[colorKey] === color
                              ? 'ring-2 ring-[#E8734A] ring-offset-2 scale-110'
                              : 'hover:scale-110'
                          }`} style={{ backgroundColor: color }} />
                          <span className={`text-[10px] transition-colors ${
                            avatar[colorKey] === color ? 'text-[#E8734A] font-medium' : 'text-gray-400'
                          }`}>{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 选项网格 */}
                {currentCategory && (
                  <div className="bg-white rounded-xl p-4 border border-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-500">
                        选择{currentCategory.label}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {(avatar[activeCategory as keyof AvatarConfig] as number) + 1} / {currentCategory.count}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {Array.from({ length: currentCategory.count }, (_, i) => {
                        const previewAvatar: AvatarConfig = { ...avatar, [activeCategory]: i };
                        const isSelected = avatar[activeCategory as keyof AvatarConfig] === i;
                        return (
                          <button
                            key={i}
                            onClick={() => updateAvatarField(activeCategory as keyof AvatarConfig, i)}
                            className={`relative rounded-xl flex items-center justify-center transition-colors overflow-hidden ${
                              isSelected
                                ? 'bg-orange-50 border-2 border-[#E8734A]'
                                : 'bg-gray-50 border border-transparent hover:border-gray-200'
                            }`}
                            style={{ aspectRatio: '9 / 10' }}
                          >
                            <AvatarPreview avatar={previewAvatar} size={56} />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#E8734A] rounded-full flex items-center justify-center">
                                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部保存按钮 */}
      <div className="sticky bottom-0 px-4 md:px-6 py-3 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-[#E8734A] text-white rounded-xl font-medium text-sm hover:bg-[#D4633A] transition-colors sm:max-w-xs"
          >
            保存头像
          </button>
        </div>
      </div>
    </div>
  );
}
