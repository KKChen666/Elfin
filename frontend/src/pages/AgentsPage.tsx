import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Robot, Trash, ChatCircleDots, X } from '@phosphor-icons/react';
import { agentsApi, Agent } from '../api/agents';
import { skillsApi, Skill } from '../api/skills';
import { conversationsApi } from '../api/conversations';
import { showToast } from '../components/toastBus';
import { useGsapEntrance } from '../hooks/useGsapEntrance';
import { ConfirmDialog } from '../components/AppDialog';
import WorkflowGuide from '../components/WorkflowGuide';
import NextStepPanel from '../components/NextStepPanel';

export default function AgentsPage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [startingAgentId, setStartingAgentId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    skill_ids: [] as number[],
  });
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    loadAgents();
    loadSkills();
  }, []);

  useGsapEntrance(panelRef, [showCreate], { y: 12, scale: 0.98, stagger: 0.035 });

  const loadAgents = async () => {
    try {
      const res = await agentsApi.getAll();
      setAgents(res.data);
    } catch {
      showToast('error', '加载 Agent 列表失败');
    }
  };

  const loadSkills = async () => {
    try {
      const res = await skillsApi.getAll();
      setSkills(res.data);
    } catch {
      // Skills are optional when creating a basic Agent.
    }
  };

  const handleCreate = async () => {
    if (!newAgent.name.trim()) return;
    try {
      await agentsApi.create({
        name: newAgent.name,
        description: newAgent.description || undefined,
        skill_ids: newAgent.skill_ids.length > 0 ? newAgent.skill_ids : undefined,
      });
      setShowCreate(false);
      setNewAgent({ name: '', description: '', skill_ids: [] });
      showToast('success', 'Agent 创建成功');
      loadAgents();
    } catch {
      showToast('error', '创建失败');
    }
  };

  const handleDelete = async (agent: Agent) => {
    setDeleteTarget(agent);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await agentsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      showToast('success', '已删除');
      loadAgents();
    } catch {
      showToast('error', '删除失败');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartChat = async (agent: Agent) => {
    if (startingAgentId) return;
    setStartingAgentId(agent.id);
    try {
      const res = await conversationsApi.create([agent.id]);
      navigate(`/chat/${res.data.id}`);
      window.dispatchEvent(new Event('elfin:conversations-changed'));
    } catch {
      showToast('error', '开启对话失败');
    } finally {
      setStartingAgentId(null);
    }
  };

  return (
    <div className="ios-page h-full overflow-y-auto">
      <div className="ios-container">
        <header className="ios-header">
          <div>
            <p className="ios-kicker">AI 伙伴</p>
            <h1 className="ios-title">管理你的 Agent。</h1>
            <p className="ios-subtitle">为不同关系场景配置专属能力，让对话更有边界，也更有温度。</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="ios-button-primary shrink-0">
            <Plus size={18} weight="bold" />
            创建 Agent
          </button>
        </header>

        <WorkflowGuide />

        {agents.length > 0 && skills.length === 0 && (
          <NextStepPanel
            eyebrow="增强 Agent"
            title="先生成一个 Skill，再把它绑定到 Agent"
            description="没有 Skill 的 Agent 也能对话，但缺少来自亲友资料、聊天记录或规则文件的稳定能力。"
            actions={[
              { label: '去生成 Skill', to: '/skills', primary: true },
              { label: '查看亲友', to: '/relatives' },
            ]}
          />
        )}

        {showCreate && (
          <section ref={panelRef} className="ios-panel mb-6 p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.01em]">创建新 Agent</h2>
                <p className="mt-1 text-sm text-[#7a7a7a]">先定义名字和用途，稍后可以继续补充技能。</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="ios-icon-button !h-9 !w-9" aria-label="关闭">
                <X size={16} />
              </button>
            </div>
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">名称</span>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：温柔提醒助手"
                  className="ios-input"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">描述</span>
                <textarea
                  value={newAgent.description}
                  onChange={(e) => setNewAgent((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="说明这个 Agent 适合处理什么事情"
                  className="ios-input"
                  rows={3}
                />
              </label>
              <div>
                <span className="mb-2 block text-sm font-medium text-[#6e6e73]">关联技能</span>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => {
                    const active = newAgent.skill_ids.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        onClick={() => {
                          setNewAgent((prev) => ({
                            ...prev,
                            skill_ids: active
                              ? prev.skill_ids.filter((id) => id !== skill.id)
                              : [...prev.skill_ids, skill.id],
                          }));
                        }}
                        className="ios-chip"
                        data-active={active}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                  {skills.length === 0 && <p className="text-sm text-[#8e8e93]">暂无可关联技能。</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={handleCreate} disabled={!newAgent.name.trim()} className="ios-button-primary">
                  创建
                </button>
                <button onClick={() => setShowCreate(false)} className="ios-button-secondary">
                  取消
                </button>
              </div>
            </div>
          </section>
        )}

        <div ref={listRef} className="grid gap-3">
          {agents.map((agent) => (
            <article key={agent.id} className="ios-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f7f7f8] text-[#202123]">
                    {agent.avatar_url ? (
                      <img src={agent.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Robot size={28} weight="fill" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[17px] font-semibold text-[#1d1d1f]">{agent.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#6e6e73]">
                      {agent.description || '一个尚未填写描述的 AI Agent'}
                    </p>
                    {agent.skills && agent.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {agent.skills.map((skill) => (
                          <span key={skill.id} className="rounded-full bg-[#f7f7f8] px-2.5 py-1 text-xs font-medium text-[#202123]">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => handleStartChat(agent)}
                    disabled={startingAgentId === agent.id}
                    className="ios-icon-button"
                    title={startingAgentId === agent.id ? '正在开启' : '开始对话'}
                    aria-label={startingAgentId === agent.id ? '正在开启' : '开始对话'}
                  >
                    <ChatCircleDots size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(agent)}
                    className="ios-icon-button text-[#8e8e93] hover:text-[#ff3b30]"
                    title="删除"
                    aria-label="删除"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}

          {agents.length === 0 && (
            <div className="ios-panel px-6 py-16 text-center">
              <Robot size={48} className="mx-auto mb-4 text-[#8e8e93]" />
              <h2 className="text-xl font-semibold">还没有 Agent</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7a7a7a]">
                Agent 是最终对话对象。你可以先从聊天记录生成 Skill，也可以先创建一个空 Agent，稍后再绑定技能。
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button onClick={() => setShowCreate(true)} className="ios-button-primary">
                  创建第一个 Agent
                </button>
                <button onClick={() => navigate('/skills')} className="ios-button-secondary">
                  先生成 Skill
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除这个 Agent？"
        detail={deleteTarget?.name}
        description="删除后，这个 Agent 不会再出现在对话创建和 Agent 列表里。"
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

