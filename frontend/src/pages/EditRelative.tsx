import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { uploadApi } from '../api/upload';
import { RELATION_CATEGORIES } from '../types';
import AvatarPreview from '../components/avatar/AvatarPreview';
import ImageUploader from '../components/avatar/ImageUploader';
import { getZodiac, getChineseZodiac } from '../utils/dateUtils';
import { showToast } from '../components/toastBus';

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

export default function EditRelative() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRelative, updateRelative, loadRelatives, hasLoaded, isLoading } = useRelativeStore();
  const relative = getRelative(id || '');

  const [customRelation, setCustomRelation] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  // 当自定义输入框内容被清空时，自动回退到预设关系选择
  const handleCustomRelationChange = (value: string) => {
    setCustomRelation(value);
    setIsCustom(!!value.trim());
  };
  const [avatarImage, setAvatarImage] = useState<string>('');
  const [avatarImageChanged, setAvatarImageChanged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    birthday: '',
    isLunar: false,
    relation: 'father',
    phone: '',
    hobbies: '',
    clothingSize: '',
    shoeSize: '',
    notes: '',
    mbti: '',
    address: ''
  });

  const zodiac = form.birthday ? getZodiac(form.birthday) : '';
  const chineseZodiac = form.birthday ? getChineseZodiac(form.birthday) : '';

  useEffect(() => {
    if (!hasLoaded) {
      loadRelatives();
    }
  }, [hasLoaded, loadRelatives]);

  useEffect(() => {
    if (relative) {
      const isPreset = RELATION_CATEGORIES.some(c =>
        c.items.some(item => item.key === relative.relation)
      );
      setIsCustom(!isPreset);
      if (!isPreset) setCustomRelation(relative.relation);
      setForm({
        name: relative.name,
        birthday: relative.birthday.split('T')[0],
        isLunar: relative.isLunar,
        relation: relative.relation,
        phone: relative.phone || '',
        hobbies: relative.hobbies || '',
        clothingSize: relative.clothingSize || '',
        shoeSize: relative.shoeSize || '',
        notes: relative.notes || '',
        mbti: relative.mbti || '',
        address: relative.address || ''
      });
      setAvatarImage(relative.avatarImage || '');
      setAvatarImageChanged(false);
    }
  }, [relative]);

  if (!relative) {
    if (isLoading || !hasLoaded) {
      return <div className="p-4 text-center">正在加载亲友信息...</div>;
    }
    return <div className="p-4 text-center">亲友不存在</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.birthday || submitting) return;
    const relation = isCustom ? customRelation.trim() : form.relation;
    if (!relation) return;
    setSubmitting(true);
    try {
      await updateRelative(id || '', {
        ...form,
        relation,
        zodiac,
        chineseZodiac,
      });
      if (avatarImageChanged && avatarImage && id) {
        const res = await fetch(avatarImage);
        const blob = await res.blob();
        const file = new File([blob], 'avatar.png', { type: 'image/png' });
        await uploadApi.uploadAvatarImage(Number(id), file);
        await loadRelatives();
      }
      showToast('success', '亲友信息已保存');
      navigate(`/detail/${id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        '保存失败，请稍后重试';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg md:text-xl font-bold">编辑亲友</h1>
      </header>

      <div className="lg:flex lg:gap-8">
        {/* 左侧头像区域 */}
        <div className="flex justify-center mb-6 lg:mb-0 lg:w-48 shrink-0">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {avatarImage ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#202123]">
                  <img src={avatarImage} alt="头像" className="w-full h-full object-cover" />
                </div>
              ) : (
                <AvatarPreview avatar={relative.avatar} size={96} />
              )}
            </div>
            <div className="flex gap-3">
              <ImageUploader
                onImageCropped={(img) => {
                  setAvatarImage(img);
                  setAvatarImageChanged(true);
                }}
                currentImage={relative.avatarImage}
              />
              <button
                onClick={() => navigate(`/avatar/${id}`)}
                className="flex flex-col items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg hover:border-[#202123] transition-colors"
              >
                <AvatarPreview avatar={relative.avatar} size={40} />
                <span className="text-xs text-[#202123]">捏脸定制</span>
              </button>
            </div>
          </div>
        </div>

        {/* 右侧表单 */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-4 max-w-2xl">
          <div className="bg-white rounded-xl p-4 border border-gray-50">
            <label className="block text-sm text-gray-500 mb-1">姓名 *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="请输入姓名"
              className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#202123] transition-colors"
              required
            />
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-50">
            <label className="block text-sm text-gray-500 mb-1">生日 *</label>
            <input
              type="date"
              value={form.birthday}
              onChange={e => setForm({ ...form, birthday: e.target.value })}
              className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#202123] transition-colors"
              required
            />
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={form.isLunar}
                onChange={e => setForm({ ...form, isLunar: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-500">农历生日</span>
            </label>
            {form.birthday && (
              <div className="flex gap-3 mt-2">
                {zodiac && (
                  <span className="text-xs text-[#202123] bg-[#f7f7f8] px-2 py-0.5 rounded">{zodiac}</span>
                )}
                {chineseZodiac && (
                  <span className="text-xs text-[#202123] bg-[#f7f7f8] px-2 py-0.5 rounded">{chineseZodiac}</span>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-50">
            <label className="block text-sm text-gray-500 mb-3">关系 *</label>
            {RELATION_CATEGORIES.map(category => (
              <div key={category.key} className="mb-3">
                <div className="text-xs text-gray-400 mb-1.5">{category.label}</div>
                <div className="flex flex-wrap gap-2">
                  {category.items.map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => { setForm({ ...form, relation: item.key }); setIsCustom(false); }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        !isCustom && form.relation === item.key
                          ? 'bg-[#202123] text-white'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-400 mb-1.5">自定义</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customRelation}
                  onChange={e => handleCustomRelationChange(e.target.value)}
                  onFocus={() => { if (customRelation.trim()) setIsCustom(true); }}
                  placeholder="输入自定义关系，如：干妈"
                  className={`flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none transition-colors ${
                    isCustom ? 'border-[#202123]' : 'border-gray-200 focus:border-[#202123]'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-50">
            <label className="block text-sm text-gray-500 mb-1">喜好</label>
            <input
              type="text"
              value={form.hobbies}
              onChange={e => setForm({ ...form, hobbies: e.target.value })}
              placeholder="如：喝茶、看电影、养花"
              className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#202123] transition-colors"
            />
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">衣服码号</label>
              <input
                type="text"
                value={form.clothingSize}
                onChange={e => setForm({ ...form, clothingSize: e.target.value })}
                placeholder="如：M、L、XL"
                className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#202123] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">鞋码</label>
              <input
                type="text"
                value={form.shoeSize}
                onChange={e => setForm({ ...form, shoeSize: e.target.value })}
                placeholder="如：38、42"
                className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#202123] transition-colors"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-50">
            <label className="block text-sm text-gray-500 mb-2">MBTI人格类型</label>
            <div className="flex flex-wrap gap-2">
              {MBTI_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, mbti: type })}
                  className={`px-2.5 py-1 rounded-lg text-sm transition-colors ${
                    form.mbti === type
                      ? 'bg-[#202123] text-white'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-50">
            <label className="block text-sm text-gray-500 mb-1">居住地址</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="请输入居住地址"
              className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#202123] transition-colors"
            />
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-50">
            <label className="block text-sm text-gray-500 mb-1">备注</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="其他需要记住的信息"
              rows={3}
              className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#202123] resize-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#202123] text-white rounded-xl font-medium hover:bg-[#111827] transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs"
          >
            {submitting ? '正在保存...' : '保存修改'}
          </button>
        </form>
      </div>
    </div>
  );
}

