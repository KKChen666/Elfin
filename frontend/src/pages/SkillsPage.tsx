import { useState, useEffect, useRef } from 'react';
import { Plus, Sparkle, Trash, GitMerge, Download } from '@phosphor-icons/react';
import { skillsApi, Skill } from '../api/skills';
import { relativesApi, BackendRelative } from '../api/relatives';
import { showToast } from '../components/Toast';
import gsap from 'gsap';

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [relatives, setRelatives] = useState<BackendRelative[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDistill, setShowDistill] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', description: '' });
  const [mergeName, setMergeName] = useState('');
  const [selectedForMerge, setSelectedForMerge] = useState<number[]>([]);
  const [distilling, setDistilling] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSkills();
    loadRelatives();
  }, []);

  useEffect(() => {
    if (listRef.current?.children) {
      gsap.from(listRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
      });
    }
  }, [skills]);

  const loadSkills = async () => {
    try {
      const res = await skillsApi.getAll();
      setSkills(res.data);
    } catch {
      showToast('error', '加载技能列表失败');
    }
  };

  const loadRelatives = async () => {
    try {
      const res = await relativesApi.getAll();
      setRelatives(res.data);
    } catch {
      // 静默失败
    }
  };

  const handleCreate = async () => {
    if (!newSkill.name.trim()) return;
    try {
      await skillsApi.create({ name: newSkill.name, description: newSkill.description || undefined });
      setShowCreate(false);
      setNewSkill({ name: '', description: '' });
      showToast('success', '技能创建成功');
      loadSkills();
    } catch {
      showToast('error', '创建失败');
    }
  };

  const handleDistill = async (relativeId: number) => {
    setDistilling(true);
    try {
      await skillsApi.distill(relativeId);
      setShowDistill(false);
      showToast('success', '蒸馏成功！');
      loadSkills();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || '蒸馏失败';
      showToast('error', msg);
    } finally {
      setDistilling(false);
    }
  };

  const handleMerge = async () => {
    if (selectedForMerge.length < 2 || !mergeName.trim()) return;
    try {
      await skillsApi.merge(selectedForMerge, mergeName);
      setShowMerge(false);
      setSelectedForMerge([]);
      setMergeName('');
      showToast('success', '合并成功！');
      loadSkills();
    } catch {
      showToast('error', '合并失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这个技能？')) return;
    try {
      await skillsApi.delete(id);
      showToast('success', '已删除');
      loadSkills();
    } catch {
      showToast('error', '删除失败');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">技能管理</h1>
            <p className="text-sm text-[#999] mt-1">管理和蒸馏沟通技能</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMerge(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#666] rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all border border-[#E8E8E8]"
            >
              <GitMerge size={16} />
              合并
            </button>
            <button
              onClick={() => setShowDistill(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#666] rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all border border-[#E8E8E8]"
            >
              <Download size={16} />
              蒸馏
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl text-sm font-medium shadow-sm hover:bg-[#E55D00] transition-all active:scale-[0.98]"
              style={{ boxShadow: '0 4px 16px rgba(255, 106, 0, 0.3)' }}
            >
              <Plus size={16} weight="bold" />
              创建
            </button>
          </div>
        </div>

        {/* 蒸馏面板 */}
        {showDistill && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-[#F0F0F0]">
            <h3 className="font-semibold text-[#1A1A1A] mb-2">从聊天记录蒸馏技能</h3>
            <p className="text-sm text-[#999] mb-4">
              选择一个已导入聊天记录的亲友，系统会自动分析并生成技能
            </p>
            <div className="grid gap-2">
              {relatives
                .filter(r => r.chat_style)
                .map((relative) => (
                  <button
                    key={relative.id}
                    onClick={() => handleDistill(relative.id)}
                    disabled={distilling}
                    className="flex items-center justify-between p-4 bg-[#F7F8FA] rounded-xl hover:bg-[#F0F0F0] transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm text-[#1A1A1A]">{relative.name}</p>
                      <p className="text-xs text-[#999]">{relative.relation}</p>
                    </div>
                    <Sparkle size={18} className="text-[#FF6A00]" />
                  </button>
                ))}
              {relatives.filter(r => r.chat_style).length === 0 && (
                <p className="text-sm text-[#999] text-center py-6">
                  没有已导入聊天记录的亲友，请先导入聊天记录
                </p>
              )}
            </div>
            <button
              onClick={() => setShowDistill(false)}
              className="mt-4 px-4 py-2.5 bg-[#F7F8FA] text-[#666] rounded-xl text-sm font-medium hover:bg-[#E8E8E8]"
            >
              关闭
            </button>
          </div>
        )}

        {/* 合并面板 */}
        {showMerge && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-[#F0F0F0]">
            <h3 className="font-semibold text-[#1A1A1A] mb-2">合并技能</h3>
            <p className="text-sm text-[#999] mb-4">选择至少2个技能进行合并</p>
            <input
              type="text"
              value={mergeName}
              onChange={(e) => setMergeName(e.target.value)}
              placeholder="新技能名称"
              className="w-full bg-[#F7F8FA] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-opacity-30"
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => {
                    setSelectedForMerge(prev =>
                      prev.includes(skill.id)
                        ? prev.filter(id => id !== skill.id)
                        : [...prev, skill.id]
                    );
                  }}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${selectedForMerge.includes(skill.id)
                      ? 'bg-[#FF6A00] text-white'
                      : 'bg-[#F7F8FA] text-[#666] hover:bg-[#E8E8E8]'
                    }
                  `}
                >
                  {skill.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleMerge}
                disabled={selectedForMerge.length < 2 || !mergeName.trim()}
                className="px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-[#E55D00] shadow-sm"
                style={{ boxShadow: '0 4px 16px rgba(255, 106, 0, 0.3)' }}
              >
                合并
              </button>
              <button
                onClick={() => setShowMerge(false)}
                className="px-5 py-2.5 bg-[#F7F8FA] text-[#666] rounded-xl text-sm font-medium hover:bg-[#E8E8E8]"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 创建表单 */}
        {showCreate && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-[#F0F0F0]">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">创建技能</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#666] mb-1.5">名称 *</label>
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="技能名称"
                  className="w-full bg-[#F7F8FA] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-opacity-30"
                />
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-1.5">描述</label>
                <textarea
                  value={newSkill.description}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="技能描述"
                  className="w-full bg-[#F7F8FA] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-opacity-30 resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!newSkill.name.trim()}
                  className="px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-[#E55D00] shadow-sm"
                  style={{ boxShadow: '0 4px 16px rgba(255, 106, 0, 0.3)' }}
                >
                  创建
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-5 py-2.5 bg-[#F7F8FA] text-[#666] rounded-xl text-sm font-medium hover:bg-[#E8E8E8]"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 技能列表 */}
        <div ref={listRef} className="grid gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0F0F0] hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#1A1A1A]">{skill.name}</h3>
                    <span className="px-2.5 py-0.5 bg-[#FFF5EE] rounded-lg text-xs text-[#FF6A00] font-medium">
                      {skill.source_type === 'chat_import' ? '蒸馏' : skill.source_type === 'merge' ? '合并' : '手动'}
                    </span>
                  </div>
                  <p className="text-sm text-[#999] mt-1">{skill.description || '无描述'}</p>
                  {skill.personality && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="px-2 py-0.5 bg-[#F7F8FA] rounded-lg text-xs text-[#666]">
                        {(skill.personality as Record<string, unknown>).type as string || '未知'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="p-2.5 rounded-xl hover:bg-red-50 text-[#999] hover:text-[#FF3B30] transition-colors"
                  title="删除"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}

          {skills.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <Sparkle size={56} className="mx-auto text-[#E8E8E8] mb-4" />
              <p className="text-[#999] mb-2">还没有技能</p>
              <p className="text-xs text-[#CCC] mb-6">从聊天记录蒸馏或手动创建</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowDistill(true)}
                  className="px-5 py-2.5 bg-white text-[#666] rounded-xl text-sm font-medium shadow-sm border border-[#E8E8E8] hover:shadow-md"
                >
                  从聊天记录蒸馏
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl text-sm font-medium shadow-sm hover:bg-[#E55D00]"
                  style={{ boxShadow: '0 4px 16px rgba(255, 106, 0, 0.3)' }}
                >
                  手动创建
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
