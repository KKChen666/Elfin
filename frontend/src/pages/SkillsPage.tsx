import { useState, useEffect, useRef } from 'react';
import { Plus, Sparkle, Trash, GitMerge, Download, X } from '@phosphor-icons/react';
import { skillsApi, Skill } from '../api/skills';
import { relativesApi, BackendRelative } from '../api/relatives';
import { showToast } from '../components/toastBus';
import gsap from 'gsap';
import { useGsapEntrance } from '../hooks/useGsapEntrance';

const sourceLabels: Record<string, string> = {
  chat_import: '蒸馏',
  merge: '合并',
  manual: '手动',
};

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
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    loadSkills();
    loadRelatives();
  }, []);

  useEffect(() => {
    if (listRef.current?.children) {
      gsap.fromTo(
        listRef.current.children,
        { y: 14, opacity: 0, scale: 0.985 },
        { y: 0, opacity: 1, scale: 1, duration: 0.32, stagger: 0.04, ease: 'power2.out', clearProps: 'transform' },
      );
    }
  }, [skills]);

  useGsapEntrance(panelRef, [showCreate, showDistill, showMerge], { y: 12, scale: 0.98, stagger: 0.035 });

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
      // Relative data is only needed for distillation.
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
      showToast('success', '蒸馏成功');
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
      showToast('success', '合并成功');
      loadSkills();
    } catch {
      showToast('error', '合并失败');
    }
  };

  const handleDelete = async (skill: Skill) => {
    if (!confirm(`确定删除「${skill.name}」吗？`)) return;
    try {
      await skillsApi.delete(skill.id);
      showToast('success', '已删除');
      loadSkills();
    } catch {
      showToast('error', '删除失败');
    }
  };

  const panelOpen = showCreate || showDistill || showMerge;

  return (
    <div className="ios-page h-full overflow-y-auto">
      <div className="ios-container">
        <header className="ios-header">
          <div>
            <p className="ios-kicker">能力系统</p>
            <h1 className="ios-title">沉淀沟通技能。</h1>
            <p className="ios-subtitle">把聊天风格、表达习惯和知识片段整理成可复用的 Agent 能力。</p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            <button onClick={() => { setShowMerge(true); setShowCreate(false); setShowDistill(false); }} className="ios-button-secondary">
              <GitMerge size={17} />
              合并
            </button>
            <button onClick={() => { setShowDistill(true); setShowCreate(false); setShowMerge(false); }} className="ios-button-secondary">
              <Download size={17} />
              蒸馏
            </button>
            <button onClick={() => { setShowCreate(true); setShowDistill(false); setShowMerge(false); }} className="ios-button-primary">
              <Plus size={17} weight="bold" />
              创建
            </button>
          </div>
        </header>

        {panelOpen && (
          <section ref={panelRef} className="ios-panel mb-6 p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.01em]">
                  {showCreate ? '创建技能' : showDistill ? '从聊天记录蒸馏' : '合并技能'}
                </h2>
                <p className="mt-1 text-sm text-[#7a7a7a]">
                  {showCreate
                    ? '手动创建一个可被 Agent 关联的能力。'
                    : showDistill
                      ? '选择已导入聊天记录的亲友，生成沟通风格技能。'
                      : '选择至少两个技能，合并成一个新的能力包。'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setShowDistill(false);
                  setShowMerge(false);
                }}
                className="ios-icon-button !h-9 !w-9"
                aria-label="关闭"
              >
                <X size={16} />
              </button>
            </div>

            {showCreate && (
              <div className="grid gap-4">
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">名称</span>
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：妈妈的表达习惯"
                    className="ios-input"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">描述</span>
                  <textarea
                    value={newSkill.description}
                    onChange={(e) => setNewSkill((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="说明这个技能的使用场景"
                    className="ios-input"
                    rows={3}
                  />
                </label>
                <button onClick={handleCreate} disabled={!newSkill.name.trim()} className="ios-button-primary w-fit">
                  创建技能
                </button>
              </div>
            )}

            {showDistill && (
              <div className="grid gap-2">
                {relatives
                  .filter((r) => r.chat_style)
                  .map((relative) => (
                    <button
                      key={relative.id}
                      onClick={() => handleDistill(relative.id)}
                      disabled={distilling}
                      className="ios-card flex items-center justify-between gap-3 p-4 text-left disabled:opacity-50"
                    >
                      <div>
                        <p className="text-[15px] font-semibold text-[#1d1d1f]">{relative.name}</p>
                        <p className="mt-0.5 text-xs text-[#7a7a7a]">{relative.relation}</p>
                      </div>
                      <Sparkle size={20} className="text-[#0066cc]" />
                    </button>
                  ))}
                {relatives.filter((r) => r.chat_style).length === 0 && (
                  <p className="rounded-2xl bg-white/65 px-4 py-5 text-center text-sm text-[#7a7a7a]">
                    暂无可蒸馏的聊天记录。先到亲友详情页导入聊天记录。
                  </p>
                )}
              </div>
            )}

            {showMerge && (
              <div className="grid gap-4">
                <input
                  type="text"
                  value={mergeName}
                  onChange={(e) => setMergeName(e.target.value)}
                  placeholder="新技能名称"
                  className="ios-input"
                />
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => {
                    const active = selectedForMerge.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        onClick={() => {
                          setSelectedForMerge((prev) =>
                            active ? prev.filter((id) => id !== skill.id) : [...prev, skill.id],
                          );
                        }}
                        className="ios-chip"
                        data-active={active}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleMerge}
                  disabled={selectedForMerge.length < 2 || !mergeName.trim()}
                  className="ios-button-primary w-fit"
                >
                  合并技能
                </button>
              </div>
            )}
          </section>
        )}

        <div ref={listRef} className="grid gap-3">
          {skills.map((skill) => (
            <article key={skill.id} className="ios-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-[17px] font-semibold text-[#1d1d1f]">{skill.name}</h3>
                    <span className="rounded-full bg-[#e9f2ff] px-2.5 py-1 text-xs font-medium text-[#0066cc]">
                      {sourceLabels[skill.source_type] || skill.source_type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[#6e6e73]">{skill.description || '暂无描述'}</p>
                  {skill.personality && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs text-[#6e6e73]">
                        {((skill.personality as Record<string, unknown>).type as string) || '未分类'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(skill)}
                  className="ios-icon-button shrink-0 text-[#8e8e93] hover:text-[#ff3b30]"
                  title="删除"
                  aria-label="删除"
                >
                  <Trash size={18} />
                </button>
              </div>
            </article>
          ))}

          {skills.length === 0 && (
            <div className="ios-panel px-6 py-16 text-center">
              <Sparkle size={48} className="mx-auto mb-4 text-[#8e8e93]" />
              <h2 className="text-xl font-semibold">还没有技能</h2>
              <p className="mt-2 text-sm text-[#7a7a7a]">从聊天记录蒸馏，或手动创建一个新的技能。</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button onClick={() => setShowDistill(true)} className="ios-button-secondary">
                  从聊天记录蒸馏
                </button>
                <button onClick={() => setShowCreate(true)} className="ios-button-primary">
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
