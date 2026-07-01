import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Trash, Sparkle, Robot, Upload, ChatCircle } from '@phosphor-icons/react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { getRelationLabel } from '../types';
import AvatarPreview from '../components/avatar/AvatarPreview';
import { getDaysUntilBirthday, formatDate } from '../utils/dateUtils';
import { skillsApi } from '../api/skills';
import { showToast } from '../components/toastBus';
import { ConfirmDialog } from '../components/AppDialog';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRelative, deleteRelative, loadRelatives, hasLoaded, isLoading } = useRelativeStore();
  const relative = getRelative(id || '');
  const [distilling, setDistilling] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!hasLoaded) {
      loadRelatives();
    }
  }, [hasLoaded, loadRelatives]);

  if (!relative) {
    if (isLoading || !hasLoaded) {
      return <div className="p-4 text-center">正在加载亲友信息...</div>;
    }
    return <div className="p-4 text-center">亲友不存在</div>;
  }

  const daysUntilBirthday = getDaysUntilBirthday(relative.birthday, relative.isLunar);

  const handleDelete = async () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteRelative(id || '');
      navigate('/relatives');
    } catch {
      showToast('error', '删除失败');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDistillSkill = async () => {
    if (!id || distilling) return;
    setDistilling(true);
    try {
      await skillsApi.distill(Number(id));
      showToast('success', '已生成沟通技能');
      navigate('/skills');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        '技能生成失败';
      showToast('error', msg);
    } finally {
      setDistilling(false);
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
            title="编辑"
          >
            <Pencil size={20} />
          </button>
          <button onClick={handleDelete} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
            <Trash size={20} />
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
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover mx-auto border-2 border-[#202123]"
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
                <span className="text-xs text-[#202123] bg-[#f7f7f8] px-2 py-0.5 rounded">{relative.zodiac}</span>
              )}
              {relative.chineseZodiac && (
                <span className="text-xs text-[#202123] bg-[#f7f7f8] px-2 py-0.5 rounded">{relative.chineseZodiac}</span>
              )}
            </div>
          )}
        </div>

        {/* 右侧：详细信息 */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white rounded-xl p-4 text-center border border-gray-50">
              {daysUntilBirthday === 0 ? (
                <>
                  <div className="text-2xl md:text-3xl font-bold text-[#202123]">今天</div>
                  <div className="text-xs text-[#202123] mt-1 font-medium">生日快乐！</div>
                </>
              ) : daysUntilBirthday !== null ? (
                <>
                  <div className="text-2xl md:text-3xl font-bold text-[#202123]">{daysUntilBirthday}</div>
                  <div className="text-xs text-gray-400 mt-1">天后生日</div>
                </>
              ) : (
                <>
                  <div className="text-2xl md:text-3xl font-bold text-gray-300">-</div>
                  <div className="text-xs text-gray-400 mt-1">天后生日</div>
                </>
              )}
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
                <div className="w-9 h-9 rounded-lg bg-[#f7f7f8] flex items-center justify-center text-sm shrink-0">❤️</div>
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
                  {relative.chatStyle.expressionDNA && relative.chatStyle.expressionDNA.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-400">表达特点：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {relative.chatStyle.expressionDNA.slice(0, 3).map((dna, i) => (
                          <span key={i} className="px-2 py-0.5 bg-[#f7f7f8] rounded text-xs text-[#202123]">{dna}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 蒸馏分身功能卡片 */}
            <div
              onClick={() => relative.chatStyle ? navigate(`/avatar-chat/${id}`) : navigate(`/import/${id}`)}
              className="rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-all border"
              style={relative.chatStyle ? {
                background: 'linear-gradient(135deg, #F5F5F7 0%, #FDE8D8 100%)',
                borderColor: '#FFD1A9',
              } : {
                background: 'linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)',
                borderColor: '#E0E0E0',
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  relative.chatStyle ? 'bg-[#202123]' : 'bg-gray-400'
                }`}>
                  {relative.chatStyle ? (
                    <Robot size={22} className="text-white" />
                  ) : (
                    <Sparkle size={22} className="text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-800">
                    {relative.chatStyle ? '与分身对话' : '蒸馏分身'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {relative.chatStyle
                      ? '基于聊天记录生成的 AI 分身，模拟说话风格'
                      : '导入聊天记录，提取说话风格，创建 AI 分身'
                    }
                  </p>
                </div>
                <div className="shrink-0">
                  {relative.chatStyle ? (
                    <ChatCircle size={18} className="text-[#202123]" />
                  ) : (
                    <Upload size={18} className="text-gray-400" />
                  )}
                </div>
              </div>
              {!relative.chatStyle && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                  <div className="flex-1 text-xs text-gray-400">上传微信/QQ聊天记录 → 自动提取风格 → 生成分身</div>
                  <span className="text-xs text-[#202123] font-medium">开始 →</span>
                </div>
              )}
              {relative.chatStyle && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#e5e7eb]">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-white/80 rounded text-xs text-gray-600">{relative.chatStyle.personality}</span>
                    <span className="px-2 py-0.5 bg-white/80 rounded text-xs text-gray-600">
                      {relative.chatStyle.languageStyle === 'casual' ? '随意' : relative.chatStyle.languageStyle === 'formal' ? '正式' : '混合'}
                    </span>
                    <span className="px-2 py-0.5 bg-white/80 rounded text-xs text-gray-600">
                      {relative.chatStyle.commonEmojis.slice(0, 2).join('')}
                    </span>
                  </div>
                  <span className="text-xs text-[#202123] font-medium ml-auto">聊天 →</span>
                </div>
              )}
            </div>

            {relative.chatStyle && (
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7f7f8] text-[#202123]">
                    <Sparkle size={22} weight="fill" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-800">生成可复用技能</h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      把这份聊天风格整理成 Skill，之后可以在 Agent 中关联使用。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDistillSkill}
                    disabled={distilling}
                    className="rounded-full bg-[#202123] px-3 py-2 text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {distilling ? '生成中...' : '生成 Skill'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={showDeleteDialog}
        title="删除这位亲友？"
        detail={relative.name}
        description="删除后，这位亲友的资料、生日提醒和本地聊天风格记录都会从当前列表移除。"
        confirmLabel="确认删除"
        danger
        loading={isDeleting}
        icon={<Trash size={20} weight="bold" />}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

