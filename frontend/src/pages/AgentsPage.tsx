import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Robot, Trash, ChatCircleDots } from '@phosphor-icons/react';
import { agentsApi, Agent } from '../api/agents';
import { skillsApi, Skill } from '../api/skills';
import { showToast } from '../components/Toast';
import gsap from 'gsap';

export default function AgentsPage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    skill_ids: [] as number[],
  });
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAgents();
    loadSkills();
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
  }, [agents]);

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
      // 静默失败
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

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这个 Agent？')) return;
    try {
      await agentsApi.delete(id);
      showToast('success', '已删除');
      loadAgents();
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
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Agents</h1>
            <p className="text-sm text-[#999] mt-1">管理你的 AI 智能体</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl text-sm font-medium shadow-sm hover:bg-[#E55D00] transition-all active:scale-[0.98]"
            style={{ boxShadow: '0 4px 16px rgba(255, 106, 0, 0.3)' }}
          >
            <Plus size={16} weight="bold" />
            创建 Agent
          </button>
        </div>

        {/* 创建表单 */}
        {showCreate && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-[#F0F0F0]">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">创建新 Agent</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#666] mb-1.5">名称 *</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="给 Agent 起个名字"
                  className="w-full bg-[#F7F8FA] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-opacity-30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-1.5">描述</label>
                <textarea
                  value={newAgent.description}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="描述这个 Agent 的用途"
                  className="w-full bg-[#F7F8FA] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-opacity-30 resize-none transition-all"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-2">关联技能</label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => {
                        setNewAgent(prev => ({
                          ...prev,
                          skill_ids: prev.skill_ids.includes(skill.id)
                            ? prev.skill_ids.filter(id => id !== skill.id)
                            : [...prev.skill_ids, skill.id]
                        }));
                      }}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                        ${newAgent.skill_ids.includes(skill.id)
                          ? 'bg-[#FF6A00] text-white shadow-sm'
                          : 'bg-[#F7F8FA] text-[#666] hover:bg-[#E8E8E8]'
                        }
                      `}
                    >
                      {skill.name}
                    </button>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-xs text-[#999]">暂无技能，先去创建技能</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={!newAgent.name.trim()}
                  className="px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-[#E55D00] transition-all active:scale-[0.98] shadow-sm"
                  style={{ boxShadow: '0 4px 16px rgba(255, 106, 0, 0.3)' }}
                >
                  创建
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-5 py-2.5 bg-[#F7F8FA] text-[#666] rounded-xl text-sm font-medium hover:bg-[#E8E8E8] transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agent 列表 */}
        <div ref={listRef} className="grid gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0F0F0] hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6A00] to-[#FF8A33] flex items-center justify-center shadow-sm">
                    {agent.avatar_url ? (
                      <img src={agent.avatar_url} alt="" className="w-14 h-14 rounded-2xl" />
                    ) : (
                      <Robot size={28} className="text-white" weight="fill" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1A1A] text-[15px]">{agent.name}</h3>
                    <p className="text-sm text-[#999] mt-1">
                      {agent.description || 'AI Agent'}
                    </p>
                    {agent.skills && agent.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {agent.skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2.5 py-1 bg-[#FFF5EE] rounded-lg text-xs text-[#FF6A00] font-medium"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/chat/new?agent=${agent.id}`)}
                    className="p-2.5 rounded-xl hover:bg-[#FFF5EE] text-[#999] hover:text-[#FF6A00] transition-colors"
                    title="开始对话"
                  >
                    <ChatCircleDots size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="p-2.5 rounded-xl hover:bg-red-50 text-[#999] hover:text-[#FF3B30] transition-colors"
                    title="删除"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {agents.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <Robot size={56} className="mx-auto text-[#E8E8E8] mb-4" />
              <p className="text-[#999] mb-2">还没有 Agent</p>
              <p className="text-xs text-[#CCC] mb-6">创建你的第一个 AI 智能体</p>
              <button
                onClick={() => setShowCreate(true)}
                className="px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl text-sm font-medium shadow-sm hover:bg-[#E55D00] transition-all"
                style={{ boxShadow: '0 4px 16px rgba(255, 106, 0, 0.3)' }}
              >
                创建第一个 Agent
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
