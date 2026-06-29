import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image, Sparkles, Palette, ChevronLeft, ChevronRight, Dice5 } from 'lucide-react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { uploadApi } from '../api/upload';
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
  { color: '#C68B59', name: '棕' },
  { color: '#8B6914', name: '金棕' },
  { color: '#D4A017', name: '金' },
  { color: '#C0392B', name: '酒红' },
  { color: '#E67E22', name: '橘' },
  { color: '#696969', name: '灰' },
  { color: '#D469A0', name: '粉' },
  { color: '#5B8C6E', name: '绿' }
];
const CLOTHING_COLORS = [
  { color: '#D44A4A', name: '红' },
  { color: '#0066CC', name: '橙' },
  { color: '#4A90D9', name: '蓝' },
  { color: '#5B8C6E', name: '绿' },
  { color: '#7B68EE', name: '紫' },
  { color: '#FF69B4', name: '粉' },
  { color: '#2C3E50', name: '深灰' },
  { color: '#F39C12', name: '黄' }
];

const CATEGORIES = [
  { key: 'gender', label: '性别', icon: '🧑', count: 2 },
  { key: 'faceShape', label: '脸型', icon: '🫥', count: 5 },
  { key: 'hairstyle', label: '发型', icon: '💇', count: 10 },
  { key: 'eyeStyle', label: '眼睛', icon: '👀', count: 6 },
  { key: 'mouthStyle', label: '嘴巴', icon: '👄', count: 5 },
  { key: 'clothing', label: '服饰', icon: '👗', count: 8 },
  { key: 'accessory', label: '配饰', icon: '✨', count: 6 }
];

const GENDER_LABELS = ['👧 女孩', '👦 男孩'];

type AvatarMode = 'upload' | 'customize';

export default function AvatarCustom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRelative, updateAvatar, loadRelatives } = useRelativeStore();
  const relative = id !== 'new' ? getRelative(id || '') : null;

  const [mode, setMode] = useState<AvatarMode>('customize');
  const [avatar, setAvatar] = useState<AvatarConfig>(relative?.avatar || DEFAULT_AVATAR);
  const [avatarImage, setAvatarImage] = useState<string>(relative?.avatarImage || '');
  const [avatarImageChanged, setAvatarImageChanged] = useState(false);
  const [activeCategory, setActiveCategory] = useState('gender');
  const [bounceKey, setBounceKey] = useState(0);

  const updateAvatarField = (field: keyof AvatarConfig, value: string | number) => {
    setAvatar(prev => ({ ...prev, [field]: value }));
    setBounceKey(k => k + 1);
  };

  const randomize = useCallback(() => {
    const g = Math.floor(Math.random() * 2);
    setAvatar({
      gender: g,
      faceShape: Math.floor(Math.random() * 5),
      hairstyle: g === 0
        ? 5 + Math.floor(Math.random() * 5)
        : Math.floor(Math.random() * 5),
      eyeStyle: Math.floor(Math.random() * 6),
      mouthStyle: Math.floor(Math.random() * 5),
      clothing: g === 0
        ? 4 + Math.floor(Math.random() * 4)
        : Math.floor(Math.random() * 4),
      accessory: Math.floor(Math.random() * 6),
      skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)].color,
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].color,
      clothingColor: CLOTHING_COLORS[Math.floor(Math.random() * CLOTHING_COLORS.length)].color
    });
    setBounceKey(k => k + 1);
  }, []);

  const handleSave = async () => {
    if (id && id !== 'new') {
      // 先更新 avatar 配置
      await updateAvatar(id, avatar);
      // 如果有上传的图片，通过后端上传到 COS
      if (mode === 'upload' && avatarImageChanged && avatarImage) {
        try {
          // 将 base64 转为 File 对象
          const res = await fetch(avatarImage);
          const blob = await res.blob();
          const file = new File([blob], 'avatar.png', { type: 'image/png' });
          await uploadApi.uploadAvatarImage(Number(id), file);
          await loadRelatives();
        } catch {
          // 上传失败不影响保存
        }
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

  const isGenderCat = activeCategory === 'gender';

  return (
    <div className="flex flex-col min-h-[100dvh]" style={{ background: 'linear-gradient(180deg, #F5F5F7 0%, #F5F5F7 100%)' }}>
      {/* 顶部 */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-[#F5E6D8]">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl active:bg-[#F5F5F7] transition-colors">
            <ArrowLeft size={18} className="text-[#6E6E73]" />
          </button>
          <h1 className="text-[15px] font-bold text-[#1D1D1F] flex items-center gap-1.5">
            {mode === 'upload' ? '📸 照片头像' : '✨ 捏脸工坊'}
          </h1>
          <button onClick={randomize} className="w-8 h-8 flex items-center justify-center rounded-xl active:bg-[#F5F5F7] transition-colors" title="随机生成">
            <Dice5 size={18} className="text-[#0066CC]" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        {/* 预览区 */}
        <div className="flex flex-col items-center pt-6 pb-4 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(0,102,204,0.15) 0%, transparent 70%)' }} />

          <div key={bounceKey} className="relative" style={{ animation: 'previewPop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div className="rounded-full p-[3px]"
              style={{ background: 'linear-gradient(135deg, #FFD1A9, #0066CC, #FFD1A9)', boxShadow: '0 8px 28px rgba(0,102,204,0.22)' }}>
              <div className="rounded-full overflow-hidden bg-[#F5F5F7]">
                {mode === 'upload' && avatarImage ? (
                  <img src={avatarImage} alt="头像" className="w-36 h-36 object-cover" />
                ) : (
                  <AvatarPreview avatar={avatar} size={144} />
                )}
              </div>
            </div>
          </div>

          {/* 模式切换 */}
          <div className="flex gap-1 mt-4 p-0.5 rounded-full" style={{ background: 'rgba(245,230,216,0.6)' }}>
            <button onClick={() => setMode('customize')}
              className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                mode === 'customize' ? 'bg-white text-[#0066CC] shadow-sm' : 'text-[#8E8E93]'
              }`}>
              <Sparkles size={12} />捏脸
            </button>
            <button onClick={() => setMode('upload')}
              className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                mode === 'upload' ? 'bg-white text-[#0066CC] shadow-sm' : 'text-[#8E8E93]'
              }`}>
              <Image size={12} />上传
            </button>
          </div>
        </div>

        {mode === 'upload' && (
          <div className="px-4 pb-6">
            <ImageUploader
              onImageCropped={(b64) => {
                setAvatarImage(b64);
                setAvatarImageChanged(true);
              }}
              currentImage={avatarImage}
            />
          </div>
        )}

        {mode === 'customize' && (
          <div className="flex flex-col flex-1">
            {/* 分类标签 */}
            <div className="flex items-center gap-0.5 px-3 mb-3">
              <button onClick={() => goCategory(-1)} className="w-6 h-6 flex items-center justify-center shrink-0">
                <ChevronLeft size={16} className="text-[#D0BBA8]" />
              </button>
              <div className="flex gap-1.5 flex-1 overflow-x-auto scrollbar-hide px-1">
                {CATEGORIES.map(cat => (
                  <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                    className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded-full text-[11px] shrink-0 transition-all duration-200 font-medium ${
                      activeCategory === cat.key
                        ? 'bg-[#0066CC] text-white shadow-sm'
                        : 'bg-white text-[#6E6E73] border border-[#F0E4D8] active:scale-95'
                    }`}>
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => goCategory(1)} className="w-6 h-6 flex items-center justify-center shrink-0">
                <ChevronRight size={16} className="text-[#D0BBA8]" />
              </button>
            </div>

            {/* 颜色选择 */}
            {colorOptions && colorKey && (
              <div className="px-4 mb-3">
                <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 border border-[#F5E6D8]"
                  style={{ boxShadow: '0 1px 6px rgba(0,102,204,0.05)' }}>
                  <Palette size={12} className="text-[#D0BBA8] shrink-0" />
                  <div className="flex gap-2 flex-1 justify-center">
                    {colorOptions.map(({ color }) => (
                      <button key={color} onClick={() => updateAvatarField(colorKey, color)}
                        className={`w-6 h-6 rounded-full shrink-0 transition-all duration-150 ${
                          avatar[colorKey] === color ? 'ring-2 ring-[#0066CC] ring-offset-1.5 scale-110' : 'active:scale-90'
                        }`}
                        style={{
                          backgroundColor: color,
                          boxShadow: avatar[colorKey] === color ? '0 2px 6px rgba(0,102,204,0.3)' : '0 1px 2px rgba(0,0,0,0.1)'
                        }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 性别选择 */}
            {isGenderCat && (
              <div className="px-4 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1].map(g => {
                    const isSelected = avatar.gender === g;
                    const previewAvatar: AvatarConfig = {
                      ...avatar,
                      gender: g,
                      hairstyle: g === 0 ? Math.max(avatar.hairstyle, 5) : Math.min(avatar.hairstyle, 4),
                      clothing: g === 0 ? Math.max(avatar.clothing, 4) : Math.min(avatar.clothing, 3)
                    };
                    return (
                      <button key={g} onClick={() => {
                        updateAvatarField('gender', g);
                        if (g === 0 && avatar.hairstyle < 5) updateAvatarField('hairstyle', 5);
                        if (g === 1 && avatar.hairstyle >= 5) updateAvatarField('hairstyle', 0);
                        if (g === 0 && avatar.clothing < 4) updateAvatarField('clothing', 4);
                        if (g === 1 && avatar.clothing >= 4) updateAvatarField('clothing', 0);
                      }}
                        className="relative rounded-2xl overflow-hidden active:scale-[0.96] transition-all duration-150 py-4"
                        style={{
                          background: isSelected ? 'linear-gradient(135deg, #E9F2FF, #E9F2FF)' : 'white',
                          boxShadow: isSelected
                            ? '0 0 0 2.5px #0066CC, 0 4px 14px rgba(0,102,204,0.18)'
                            : '0 1px 4px rgba(0,102,204,0.08)'
                        }}>
                        <div className="flex justify-center">
                          <AvatarPreview avatar={previewAvatar} size={100} />
                        </div>
                        <div className={`text-center mt-2 text-sm font-semibold ${isSelected ? 'text-[#0066CC]' : 'text-[#6E6E73]'}`}>
                          {GENDER_LABELS[g]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 选项网格（非性别） */}
            {!isGenderCat && currentCategory && (
              <div className="px-4 pb-6">
                <div className={`grid gap-2.5 ${
                  activeCategory === 'hairstyle' || activeCategory === 'clothing'
                    ? 'grid-cols-3'
                    : 'grid-cols-3 sm:grid-cols-4'
                }`}>
                  {Array.from({ length: currentCategory.count }, (_, i) => {
                    // 过滤性别不匹配的发型和服饰
                    if (activeCategory === 'hairstyle' && avatar.gender === 0 && i < 5) return null;
                    if (activeCategory === 'hairstyle' && avatar.gender === 1 && i >= 5) return null;
                    if (activeCategory === 'clothing' && avatar.gender === 0 && i < 4) return null;
                    if (activeCategory === 'clothing' && avatar.gender === 1 && i >= 4) return null;

                    const previewAvatar: AvatarConfig = { ...avatar, [activeCategory]: i };
                    const isSelected = avatar[activeCategory as keyof AvatarConfig] === i;
                    return (
                      <button key={i} onClick={() => updateAvatarField(activeCategory as keyof AvatarConfig, i)}
                        className="relative rounded-2xl overflow-hidden active:scale-[0.96] transition-all duration-150"
                        style={{
                          aspectRatio: '1',
                          background: isSelected ? 'linear-gradient(135deg, #E9F2FF, #E9F2FF)' : 'white',
                          boxShadow: isSelected
                            ? '0 0 0 2.5px #0066CC, 0 4px 14px rgba(0,102,204,0.18)'
                            : '0 1px 4px rgba(0,102,204,0.08)'
                        }}>
                        <div className="flex items-center justify-center w-full h-full">
                          <AvatarPreview avatar={previewAvatar} size={72} />
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-[#0066CC] rounded-full flex items-center justify-center shadow-sm">
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

      {/* 底部保存 */}
      <div className="sticky bottom-0 px-4 py-3 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent">
        <button onClick={handleSave}
          className="w-full py-3 bg-gradient-to-r from-[#0066CC] to-[#0071E3] text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform"
          style={{ boxShadow: '0 4px 16px rgba(0,102,204,0.3)' }}>
          保存头像
        </button>
      </div>

      <style>{`
        @keyframes previewPop {
          0% { transform: scale(0.85); opacity: 0.6; }
          70% { transform: scale(1.04); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
