import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image, Sparkles, Palette, ChevronLeft, ChevronRight, Dice5 } from 'lucide-react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { AvatarConfig, DEFAULT_AVATAR } from '../types';
import AvatarPreview from '../components/avatar/AvatarPreview';
import ImageUploader from '../components/avatar/ImageUploader';

const SKIN_COLORS = [
  { color: '#FFD5B8', name: '浅肤' },
  { color: '#F5CBA7', name: '暖白' },
  { color: '#E8B896', name: '自然' },
  { color: '#D4A574', name: '小麦' },
  { color: '#C69C6D', name: '蜜糖' },
  { color: '#A0785A', name: '巧力' }
];
const HAIR_COLORS = [
  { color: '#1A1A1A', name: '黑' },
  { color: '#3D2314', name: '深棕' },
  { color: '#5C3A1E', name: '栗色' },
  { color: '#8B6914', name: '金棕' },
  { color: '#D4A017', name: '金色' },
  { color: '#C0392B', name: '酒红' },
  { color: '#E67E22', name: '橘色' },
  { color: '#696969', name: '银灰' }
];
const CLOTHING_COLORS = [
  { color: '#E8734A', name: '橙' },
  { color: '#E74C3C', name: '红' },
  { color: '#F39C12', name: '黄' },
  { color: '#5B8C6E', name: '绿' },
  { color: '#4A90D9', name: '蓝' },
  { color: '#7B68EE', name: '紫' },
  { color: '#2C3E50', name: '灰' },
  { color: '#FF69B4', name: '粉' }
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
  const [bounceKey, setBounceKey] = useState(0);

  const updateAvatarField = (field: keyof AvatarConfig, value: string | number) => {
    setAvatar(prev => ({ ...prev, [field]: value }));
    setBounceKey(k => k + 1);
  };

  const randomize = useCallback(() => {
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
    setBounceKey(k => k + 1);
  }, []);

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

  const catIdx = CATEGORIES.findIndex(c => c.key === activeCategory);
  const currentCategory = CATEGORIES[catIdx];
  const colorKey = activeCategory === 'faceShape' ? 'skinColor' :
                   activeCategory === 'hairstyle' ? 'hairColor' :
                   activeCategory === 'clothing' ? 'clothingColor' : null;
  const colorOptions = colorKey === 'skinColor' ? SKIN_COLORS :
                       colorKey === 'hairColor' ? HAIR_COLORS :
                       colorKey === 'clothingColor' ? CLOTHING_COLORS : null;

  const goCategory = (dir: number) => {
    const next = (catIdx + dir + CATEGORIES.length) % CATEGORIES.length;
    setActiveCategory(CATEGORIES[next].key);
  };

  return (
    <div className="flex flex-col bg-[#FAFAF7] min-h-[100dvh]">
      {/* ── 顶部 ── */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-11">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <h1 className="text-[15px] font-bold text-gray-800">
            {mode === 'upload' ? '照片头像' : '捏脸工坊'}
          </h1>
          <button onClick={randomize} className="p-1 -mr-1" title="随机生成">
            <Dice5 size={20} className="text-[#E8734A]" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        {/* ── 预览英雄区 ── */}
        <div className="flex flex-col items-center pt-5 pb-3 relative overflow-hidden">
          {/* 柔和光晕 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(232,115,74,0.08) 0%, transparent 70%)' }} />

          {/* 预览卡片 */}
          <div key={bounceKey} className="relative" style={{ animation: 'previewPop 0.25s ease-out' }}>
            <div className="rounded-full p-[3px] bg-gradient-to-br from-[#FFD1A9] via-[#FFB088] to-[#FFC8A2]"
              style={{ boxShadow: '0 6px 24px rgba(232,115,74,0.18)' }}>
              <div className="rounded-full overflow-hidden bg-white">
                {mode === 'upload' && avatarImage ? (
                  <div className="w-32 h-32">
                    <img src={avatarImage} alt="头像" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <AvatarPreview avatar={avatar} size={128} />
                )}
              </div>
            </div>
          </div>

          {/* 模式切换 */}
          <div className="flex gap-1.5 mt-3 p-0.5 bg-gray-100/80 rounded-full">
            <button
              onClick={() => setMode('customize')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                mode === 'customize'
                  ? 'bg-white text-[#E8734A] shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <Sparkles size={12} />
              素材捏脸
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                mode === 'upload'
                  ? 'bg-white text-[#E8734A] shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <Image size={12} />
              上传照片
            </button>
          </div>
        </div>

        {/* ── 上传模式 ── */}
        {mode === 'upload' && (
          <div className="px-4 pb-6">
            <ImageUploader
              onImageCropped={(base64) => setAvatarImage(base64)}
              currentImage={avatarImage}
            />
          </div>
        )}

        {/* ── 捏脸模式 ── */}
        {mode === 'customize' && (
          <div className="flex flex-col flex-1">
            {/* 分类标签 + 左右翻页 */}
            <div className="flex items-center gap-1 px-3 mb-3">
              <button onClick={() => goCategory(-1)} className="p-1 shrink-0 text-gray-300 active:text-gray-500">
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1.5 flex-1 overflow-x-auto scrollbar-hide">
                {CATEGORIES.map((cat, i) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded-full text-xs shrink-0 transition-all duration-200 ${
                      activeCategory === cat.key
                        ? 'bg-[#E8734A] text-white shadow-sm scale-105'
                        : 'bg-white text-gray-400 border border-gray-100 active:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs">{cat.icon}</span>
                    <span className="font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => goCategory(1)} className="p-1 shrink-0 text-gray-300 active:text-gray-500">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* 颜色条（如果有） */}
            {colorOptions && colorKey && (
              <div className="px-4 mb-3">
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-gray-50">
                  <Palette size={13} className="text-gray-300 shrink-0" />
                  <div className="flex gap-2.5 flex-1 justify-center">
                    {colorOptions.map(({ color }) => (
                      <button
                        key={color}
                        onClick={() => updateAvatarField(colorKey, color)}
                        className={`w-7 h-7 rounded-full shrink-0 transition-all duration-150 ${
                          avatar[colorKey] === color
                            ? 'ring-2 ring-[#E8734A] ring-offset-1.5 scale-110'
                            : 'active:scale-95'
                        }`}
                        style={{
                          backgroundColor: color,
                          boxShadow: avatar[colorKey] === color ? '0 2px 8px rgba(232,115,74,0.3)' : '0 1px 3px rgba(0,0,0,0.12)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 选项网格 */}
            {currentCategory && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: currentCategory.count }, (_, i) => {
                    const previewAvatar: AvatarConfig = { ...avatar, [activeCategory]: i };
                    const isSelected = avatar[activeCategory as keyof AvatarConfig] === i;
                    return (
                      <button
                        key={i}
                        onClick={() => updateAvatarField(activeCategory as keyof AvatarConfig, i)}
                        className="relative rounded-2xl overflow-hidden transition-all duration-150 active:scale-95"
                        style={{
                          aspectRatio: '1',
                          background: isSelected ? 'linear-gradient(135deg, #FFF5EE, #FDE8D8)' : '#F5F2EF',
                          boxShadow: isSelected ? '0 0 0 2px #E8734A, 0 4px 12px rgba(232,115,74,0.15)' : '0 1px 2px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div className="flex items-center justify-center w-full h-full">
                          <AvatarPreview avatar={previewAvatar} size={52} />
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-[#E8734A] rounded-full flex items-center justify-center">
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

      {/* ── 底部保存 ── */}
      <div className="sticky bottom-0 px-4 py-2.5 bg-white/95 backdrop-blur-sm border-t border-gray-100">
        <button
          onClick={handleSave}
          className="w-full py-3 bg-[#E8734A] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-sm"
          style={{ boxShadow: '0 4px 14px rgba(232,115,74,0.25)' }}
        >
          保存头像
        </button>
      </div>

      <style>{`
        @keyframes previewPop {
          0% { transform: scale(0.92); opacity: 0.7; }
          60% { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
