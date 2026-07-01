import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ClipboardText,
  Download,
  FileText,
  GitMerge,
  MagicWand,
  Plus,
  Sparkle,
  Trash,
  X,
} from '@phosphor-icons/react';
import { skillsApi, Skill } from '../api/skills';
import { relativesApi, BackendRelative } from '../api/relatives';
import { showToast } from '../components/toastBus';
import { useGsapEntrance } from '../hooks/useGsapEntrance';
import { ConfirmDialog } from '../components/AppDialog';
import WorkflowGuide from '../components/WorkflowGuide';

type PanelMode = 'creator' | 'create' | 'distill' | 'merge' | null;

type CreatorForm = {
  name: string;
  goal: string;
  description: string;
  rawText: string;
  debugCases: string;
  files: File[];
};

const emptyCreatorForm: CreatorForm = {
  name: '',
  goal: '',
  description: '',
  rawText: '',
  debugCases: '',
  files: [],
};

const sourceLabels: Record<string, string> = {
  chat_import: '聊天蒸馏',
  merge: '合并',
  manual: '手动',
  creator: '生成器',
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [relatives, setRelatives] = useState<BackendRelative[]>([]);
  const [panelMode, setPanelMode] = useState<PanelMode>('creator');
  const [newSkill, setNewSkill] = useState({ name: '', description: '' });
  const [creatorForm, setCreatorForm] = useState<CreatorForm>(emptyCreatorForm);
  const [mergeName, setMergeName] = useState('');
  const [selectedForMerge, setSelectedForMerge] = useState<number[]>([]);
  const [expandedSkillId, setExpandedSkillId] = useState<number | null>(null);
  const [distilling, setDistilling] = useState(false);
  const [creatingSkill, setCreatingSkill] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSkills();
    loadRelatives();
  }, []);

  useGsapEntrance(panelRef, [panelMode], { y: 12, scale: 0.98, stagger: 0.035 });

  const importableRelatives = useMemo(
    () => relatives.filter((relative) => relative.chat_style),
    [relatives],
  );

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

  const openPanel = (mode: Exclude<PanelMode, null>) => {
    setPanelMode((current) => (current === mode ? null : mode));
  };

  const handleCreate = async () => {
    if (!newSkill.name.trim()) return;
    try {
      await skillsApi.create({
        name: newSkill.name.trim(),
        description: newSkill.description.trim() || undefined,
      });
      setPanelMode(null);
      setNewSkill({ name: '', description: '' });
      showToast('success', '技能创建成功');
      loadSkills();
    } catch {
      showToast('error', '创建失败');
    }
  };

  const handleCreatorFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setCreatorForm((prev) => ({
      ...prev,
      files: [...prev.files, ...selected].slice(0, 8),
    }));
    event.target.value = '';
  };

  const removeCreatorFile = (index: number) => {
    setCreatorForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleCreatorSubmit = async () => {
    if (!creatorForm.name.trim() || !creatorForm.goal.trim()) {
      showToast('error', '请填写技能名称和目标');
      return;
    }

    setCreatingSkill(true);
    try {
      const res = await skillsApi.createWithCreator({
        name: creatorForm.name.trim(),
        goal: creatorForm.goal.trim(),
        description: creatorForm.description.trim() || undefined,
        raw_text: creatorForm.rawText.trim() || undefined,
        debug_cases: creatorForm.debugCases.trim() || undefined,
        files: creatorForm.files,
      });
      setCreatorForm(emptyCreatorForm);
      setExpandedSkillId(res.data.id);
      if (res.data.expression_patterns?.generation_mode === 'fallback') {
        showToast('info', 'Skill created from fallback template; configure an API Key for model-based generation.');
      } else {
        showToast('success', 'Skill 已生成');
      }
      loadSkills();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        '生成失败';
      showToast('error', msg);
    } finally {
      setCreatingSkill(false);
    }
  };

  const handleDistill = async (relativeId: number) => {
    setDistilling(true);
    try {
      await skillsApi.distill(relativeId);
      setPanelMode(null);
      showToast('success', '聊天技能蒸馏成功');
      loadSkills();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        '蒸馏失败';
      showToast('error', msg);
    } finally {
      setDistilling(false);
    }
  };

  const handleMerge = async () => {
    if (selectedForMerge.length < 2 || !mergeName.trim()) return;
    try {
      await skillsApi.merge(selectedForMerge, mergeName.trim());
      setPanelMode(null);
      setSelectedForMerge([]);
      setMergeName('');
      showToast('success', '合并成功');
      loadSkills();
    } catch {
      showToast('error', '合并失败');
    }
  };

  const handleDelete = async (skill: Skill) => {
    setDeleteTarget(skill);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await skillsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      showToast('success', '已删除');
      loadSkills();
    } catch {
      showToast('error', '删除失败');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyPrompt = async (skill: Skill) => {
    if (!skill.system_prompt) return;
    await navigator.clipboard.writeText(skill.system_prompt);
    showToast('success', 'Prompt 已复制');
  };

  return (
    <div className="ios-page h-full overflow-y-auto">
      <div className="ios-container">
        <header className="ios-header">
          <div>
            <p className="ios-kicker">能力系统</p>
            <h1 className="ios-title">技能管理</h1>
            <p className="ios-subtitle">
              把描述、文件、聊天记录和失败案例整理成可复用的 Agent 能力。
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            <button onClick={() => openPanel('creator')} className="ios-button-primary">
              <MagicWand size={17} weight="bold" />
              Skill Creator
            </button>
            <button onClick={() => openPanel('merge')} className="ios-button-secondary">
              <GitMerge size={17} />
              合并
            </button>
            <button onClick={() => openPanel('distill')} className="ios-button-secondary">
              <Download size={17} />
              聊天蒸馏
            </button>
            <button onClick={() => openPanel('create')} className="ios-button-secondary">
              <Plus size={17} weight="bold" />
              手动
            </button>
          </div>
        </header>

        <WorkflowGuide />

        {panelMode && (
          <section ref={panelRef} className="ios-panel mb-6 p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.01em]">
                  {panelMode === 'creator'
                    ? 'Skill Creator'
                    : panelMode === 'create'
                      ? '手动创建技能'
                      : panelMode === 'distill'
                        ? '从聊天记录蒸馏'
                        : '合并技能'}
                </h2>
                <p className="mt-1 text-sm text-[#7a7a7a]">
                  {panelMode === 'creator'
                    ? '导入素材并生成触发条件、执行步骤、护栏和验证题。'
                    : panelMode === 'create'
                      ? '手动创建一个可被 Agent 关联的能力。'
                      : panelMode === 'distill'
                        ? '选择已导入聊天记录的亲友，生成沟通风格技能。'
                        : '选择至少两个技能，合并成一个新的能力包。'}
                </p>
              </div>
              <button
                onClick={() => setPanelMode(null)}
                className="ios-icon-button !h-9 !w-9"
                aria-label="关闭"
              >
                <X size={16} />
              </button>
            </div>

            {panelMode === 'creator' && (
              <div className="grid gap-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <label>
                    <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">
                      技能名称
                    </span>
                    <input
                      value={creatorForm.name}
                      onChange={(e) =>
                        setCreatorForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="例如：AI 回复调试器"
                      className="ios-input"
                    />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">
                      简短描述
                    </span>
                    <input
                      value={creatorForm.description}
                      onChange={(e) =>
                        setCreatorForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="用于技能列表展示"
                      className="ios-input"
                    />
                  </label>
                </div>
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">
                    目标
                  </span>
                  <textarea
                    value={creatorForm.goal}
                    onChange={(e) =>
                      setCreatorForm((prev) => ({ ...prev, goal: e.target.value }))
                    }
                    placeholder="这个 skill 应该让 AI 学会什么？用来调试什么行为？"
                    className="ios-input"
                    rows={3}
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">
                    素材 / 聊天记录 / 规则
                  </span>
                  <textarea
                    value={creatorForm.rawText}
                    onChange={(e) =>
                      setCreatorForm((prev) => ({ ...prev, rawText: e.target.value }))
                    }
                    placeholder="粘贴聊天记录、需求、调试过程、你希望 AI 遵守的规则..."
                    className="ios-input"
                    rows={5}
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">
                    失败案例 / 验证题
                  </span>
                  <textarea
                    value={creatorForm.debugCases}
                    onChange={(e) =>
                      setCreatorForm((prev) => ({ ...prev, debugCases: e.target.value }))
                    }
                    placeholder="一行一个：输入是什么、AI 错在哪里、理想输出是什么"
                    className="ios-input"
                    rows={3}
                  />
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".txt,.md,.json,.csv,.log,.pdf,.docx,image/*"
                      className="hidden"
                      onChange={handleCreatorFileChange}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="ios-button-secondary"
                    >
                      <FileText size={17} />
                      添加 PDF / 图片 / 文本
                    </button>
                    {creatorForm.files.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {creatorForm.files.map((file, index) => (
                          <button
                            key={`${file.name}-${index}`}
                            onClick={() => removeCreatorFile(index)}
                            className="ios-chip max-w-full truncate"
                            title="点击移除"
                          >
                            {file.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleCreatorSubmit}
                    disabled={creatingSkill || !creatorForm.name.trim() || !creatorForm.goal.trim()}
                    className="ios-button-primary w-fit"
                  >
                    <Sparkle size={17} weight="fill" />
                    {creatingSkill ? '生成中...' : '生成 Skill'}
                  </button>
                </div>
              </div>
            )}

            {panelMode === 'create' && (
              <div className="grid gap-4">
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">
                    名称
                  </span>
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：妈妈的表达习惯"
                    className="ios-input"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">
                    描述
                  </span>
                  <textarea
                    value={newSkill.description}
                    onChange={(e) =>
                      setNewSkill((prev) => ({ ...prev, description: e.target.value }))
                    }
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

            {panelMode === 'distill' && (
              <div className="grid gap-2">
                {importableRelatives.map((relative) => (
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
                    <Sparkle size={20} className="text-[#202123]" />
                  </button>
                ))}
                {importableRelatives.length === 0 && (
                  <p className="rounded-2xl bg-white/65 px-4 py-5 text-center text-sm text-[#7a7a7a]">
                    暂无可蒸馏的聊天记录。先到亲友详情页导入聊天记录。
                  </p>
                )}
              </div>
            )}

            {panelMode === 'merge' && (
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
          {skills.map((skill) => {
            const isExpanded = expandedSkillId === skill.id;
            const domains = skill.knowledge_domains ?? [];
            const validation =
              (skill.communication_style?.validation as string[] | undefined) ?? [];

            return (
              <article key={skill.id} className="ios-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <button
                    onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-[17px] font-semibold text-[#1d1d1f]">
                        {skill.name}
                      </h3>
                      <span className="rounded-full bg-[#f7f7f8] px-2.5 py-1 text-xs font-medium text-[#202123]">
                        {sourceLabels[skill.source_type] || skill.source_type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[#6e6e73]">
                      {skill.description || '暂无描述'}
                    </p>
                    {domains.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {domains.slice(0, 6).map((domain) => (
                          <span
                            key={domain}
                            className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs text-[#6e6e73]"
                          >
                            {domain}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                  <div className="flex shrink-0 gap-1">
                    {skill.system_prompt && (
                      <button
                        onClick={() => copyPrompt(skill)}
                        className="ios-icon-button text-[#8e8e93]"
                        title="复制 Prompt"
                        aria-label="复制 Prompt"
                      >
                        <ClipboardText size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(skill)}
                      className="ios-icon-button text-[#8e8e93] hover:text-[#ff3b30]"
                      title="删除"
                      aria-label="删除"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 border-t border-black/5 pt-4">
                    {validation.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mb-2 text-sm font-semibold text-[#1d1d1f]">验证点</h4>
                        <ul className="space-y-1 text-sm text-[#6e6e73]">
                          {validation.map((item, index) => (
                            <li key={`${item}-${index}`}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <h4 className="mb-2 text-sm font-semibold text-[#1d1d1f]">System Prompt</h4>
                    <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#1d1d1f] p-4 text-xs leading-5 text-white">
                      {skill.system_prompt || '这个技能还没有 system prompt。'}
                    </pre>
                  </div>
                )}
              </article>
            );
          })}

          {skills.length === 0 && (
            <div className="ios-panel px-6 py-16 text-center">
              <Sparkle size={48} className="mx-auto mb-4 text-[#8e8e93]" />
              <h2 className="text-xl font-semibold">还没有技能</h2>
              <p className="mt-2 text-sm text-[#7a7a7a]">
                先用 Skill Creator 从一段描述或文件生成一个。
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button onClick={() => openPanel('creator')} className="ios-button-primary">
                  打开 Skill Creator
                </button>
                <button onClick={() => openPanel('distill')} className="ios-button-secondary">
                  从聊天记录蒸馏
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除这个技能？"
        detail={deleteTarget?.name}
        description="删除后，后续 Agent 将不能再关联这个技能；已生成的内容不会自动恢复。"
        confirmLabel="确认删除"
        danger
        loading={isDeleting}
        icon={<Trash size={20} weight="bold" />}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

