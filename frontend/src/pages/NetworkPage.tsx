import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilSimple, Plus, ShareNetwork, Trash } from '@phosphor-icons/react';
import { Relative } from '../types';
import { RelativeRelationship, relativesApi } from '../api/relatives';
import { ConfirmDialog } from '../components/AppDialog';
import { showToast } from '../components/toastBus';
import { useRelativeStore } from '../stores/useRelativeStore';
import NextStepPanel from '../components/NextStepPanel';

type Perspective = 'self' | string;

const DEFAULT_RELATIONS = ['父母', '子女', '配偶', '兄弟姐妹', '朋友', '同事', '同学', '亲戚'];

function emptyForm(relatives: Relative[]) {
  return {
    relative_a_id: relatives[0]?.id || '',
    relative_b_id: relatives[1]?.id || '',
    relation_label: '',
    reverse_relation_label: '',
    note: '',
    strength: 3,
  };
}

function relationFromPerspective(edge: RelativeRelationship, perspective: Perspective) {
  if (perspective === 'self') return edge.relation_label;
  const id = Number(perspective);
  if (edge.relative_a_id === id) return edge.relation_label;
  if (edge.relative_b_id === id) return edge.reverse_relation_label || edge.relation_label;
  return edge.relation_label;
}

function otherRelativeId(edge: RelativeRelationship, id: number) {
  return edge.relative_a_id === id ? edge.relative_b_id : edge.relative_a_id;
}

export default function NetworkPage() {
  const { relatives, loadRelatives } = useRelativeStore();
  const [relationships, setRelationships] = useState<RelativeRelationship[]>([]);
  const [perspective, setPerspective] = useState<Perspective>('self');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<RelativeRelationship | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RelativeRelationship | null>(null);
  const [form, setForm] = useState(() => emptyForm(relatives));

  const relativeById = useMemo(
    () => new Map(relatives.map((relative) => [Number(relative.id), relative])),
    [relatives],
  );

  useEffect(() => {
    if (relatives.length === 0) loadRelatives();
    loadRelationships();
  }, [loadRelatives, relatives.length]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      relative_a_id: current.relative_a_id || relatives[0]?.id || '',
      relative_b_id: current.relative_b_id || relatives[1]?.id || '',
    }));
  }, [relatives]);

  const loadRelationships = async () => {
    setIsLoading(true);
    try {
      const res = await relativesApi.getRelationships();
      setRelationships(res.data);
    } catch {
      showToast('error', '关系网加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  const visibleEdges = useMemo(() => {
    if (perspective === 'self') return relationships;
    const id = Number(perspective);
    return relationships.filter((edge) => edge.relative_a_id === id || edge.relative_b_id === id);
  }, [perspective, relationships]);

  const visibleRelatives = useMemo(() => {
    if (perspective === 'self') return relatives;
    const centerId = Number(perspective);
    const ids = new Set<number>([centerId]);
    visibleEdges.forEach((edge) => {
      ids.add(edge.relative_a_id);
      ids.add(edge.relative_b_id);
    });
    return relatives.filter((relative) => ids.has(Number(relative.id)));
  }, [perspective, relatives, visibleEdges]);

  const startEdit = (edge: RelativeRelationship) => {
    setEditing(edge);
    setForm({
      relative_a_id: String(edge.relative_a_id),
      relative_b_id: String(edge.relative_b_id),
      relation_label: edge.relation_label,
      reverse_relation_label: edge.reverse_relation_label || '',
      note: edge.note || '',
      strength: edge.strength,
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm(relatives));
  };

  const handleSave = async () => {
    const aId = Number(form.relative_a_id);
    const bId = Number(form.relative_b_id);
    if (!aId || !bId || aId === bId || !form.relation_label.trim()) {
      showToast('error', '请选择两位不同亲友，并填写关系');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        relative_a_id: aId,
        relative_b_id: bId,
        relation_label: form.relation_label.trim(),
        reverse_relation_label: form.reverse_relation_label.trim() || null,
        note: form.note.trim() || null,
        strength: form.strength,
      };
      if (editing) {
        await relativesApi.updateRelationship(editing.id, payload);
      } else {
        await relativesApi.saveRelationship(payload);
      }
      resetForm();
      await loadRelationships();
      showToast('success', editing ? '关系已更新' : '关系已保存');
    } catch {
      showToast('error', '关系保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await relativesApi.deleteRelationship(deleteTarget.id);
      setDeleteTarget(null);
      await loadRelationships();
      showToast('success', '关系已删除');
    } catch {
      showToast('error', '删除失败');
    }
  };

  return (
    <div className="ios-page h-full overflow-y-auto">
      <div className="ios-container">
        <header className="ios-header">
          <div>
            <p className="ios-kicker">关系网</p>
            <h1 className="ios-title">不只从“我”看关系</h1>
            <p className="ios-subtitle">记录亲友之间的关系，并切换到任意亲友视角查看 TA 的直接关系。</p>
          </div>
          <Link to="/add" className="ios-button-secondary shrink-0">
            <Plus size={17} />
            添加亲友
          </Link>
        </header>

        <section className="ios-panel mb-5 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#202123]">视角切换</h2>
              <p className="mt-1 text-xs text-[#6b7280]">选择某位亲友后，只展示 TA 直接相关的人和关系称呼。</p>
            </div>
            <select value={perspective} onChange={(event) => setPerspective(event.target.value)} className="ios-input max-w-xs">
              <option value="self">全局视角</option>
              {relatives.map((relative) => (
                <option key={relative.id} value={relative.id}>{relative.name} 的视角</option>
              ))}
            </select>
          </div>
        </section>

        {relatives.length < 2 && (
          <NextStepPanel
            eyebrow="关系网还缺节点"
            title="至少添加两位亲友，才能建立他们之间的关系"
            description="关系网的价值来自“亲友之间”的连接。先补充两位人物，再回来记录称呼、亲密度和备注。"
            actions={[
              { label: '添加亲友', to: '/add', primary: true },
              { label: '查看亲友列表', to: '/relatives' },
            ]}
          />
        )}

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <section className="ios-panel min-h-[460px] overflow-hidden p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#202123]">网络图</h2>
                <p className="text-sm text-[#6b7280]">
                  {isLoading ? '正在加载...' : `${visibleRelatives.length} 位亲友 · ${visibleEdges.length} 条关系`}
                </p>
              </div>
              <ShareNetwork size={24} className="text-[#8a8f98]" />
            </div>
            <NetworkCanvas
              relatives={visibleRelatives}
              relationships={visibleEdges}
              perspective={perspective}
              relativeById={relativeById}
            />
          </section>

          <aside className="grid gap-5">
            <section className="ios-panel p-4">
              <h2 className="text-lg font-semibold text-[#202123]">{editing ? '编辑关系' : '添加关系'}</h2>
              <div className="mt-4 grid gap-3">
                <select value={form.relative_a_id} disabled={Boolean(editing)} onChange={(event) => setForm((prev) => ({ ...prev, relative_a_id: event.target.value }))} className="ios-input">
                  <option value="">选择第一位亲友</option>
                  {relatives.map((relative) => <option key={relative.id} value={relative.id}>{relative.name}</option>)}
                </select>
                <select value={form.relative_b_id} disabled={Boolean(editing)} onChange={(event) => setForm((prev) => ({ ...prev, relative_b_id: event.target.value }))} className="ios-input">
                  <option value="">选择第二位亲友</option>
                  {relatives.map((relative) => <option key={relative.id} value={relative.id}>{relative.name}</option>)}
                </select>
                <input value={form.relation_label} onChange={(event) => setForm((prev) => ({ ...prev, relation_label: event.target.value }))} placeholder="第一位如何称呼第二位，例如：妈妈" list="network-relation-labels" className="ios-input" />
                <input value={form.reverse_relation_label} onChange={(event) => setForm((prev) => ({ ...prev, reverse_relation_label: event.target.value }))} placeholder="第二位如何称呼第一位，可选" list="network-relation-labels" className="ios-input" />
                <datalist id="network-relation-labels">
                  {DEFAULT_RELATIONS.map((label) => <option key={label} value={label} />)}
                </datalist>
                <label className="text-sm text-[#6b7280]">
                  亲密度：{form.strength}
                  <input type="range" min={1} max={5} value={form.strength} onChange={(event) => setForm((prev) => ({ ...prev, strength: Number(event.target.value) }))} className="mt-2 w-full accent-[#202123]" />
                </label>
                <textarea value={form.note} onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))} placeholder="补充说明，例如：关系亲近、很久没见、需要避开的话题..." className="ios-input" rows={3} />
                <div className="flex gap-2">
                  {editing && <button onClick={resetForm} className="ios-button-secondary flex-1">取消</button>}
                  <button onClick={handleSave} disabled={isSaving || relatives.length < 2} className="ios-button-primary flex-1">
                    {isSaving ? '保存中...' : editing ? '更新关系' : '保存关系'}
                  </button>
                </div>
              </div>
            </section>

            <section className="ios-panel p-4">
              <h2 className="text-lg font-semibold text-[#202123]">当前视角关系</h2>
              <div className="mt-3 grid gap-2">
                {visibleEdges.map((edge) => {
                  const a = relativeById.get(edge.relative_a_id);
                  const b = relativeById.get(edge.relative_b_id);
                  const focusedId = perspective === 'self' ? edge.relative_a_id : Number(perspective);
                  const targetId = perspective === 'self' ? edge.relative_b_id : otherRelativeId(edge, focusedId);
                  const focused = relativeById.get(focusedId);
                  const target = relativeById.get(targetId);
                  return (
                    <div key={edge.id} className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#202123]">
                            {perspective === 'self'
                              ? `${a?.name || '未知'} · ${edge.relation_label} · ${b?.name || '未知'}`
                              : `${focused?.name || '未知'} 视角：${relationFromPerspective(edge, perspective)} · ${target?.name || '未知'}`}
                          </p>
                          <p className="mt-1 text-xs text-[#6b7280]">亲密度 {edge.strength}/5</p>
                          {edge.note && <p className="mt-1 line-clamp-2 text-xs text-[#6b7280]">{edge.note}</p>}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button onClick={() => startEdit(edge)} className="ios-icon-button !h-8 !w-8 text-[#8a8f98]" aria-label="编辑关系">
                            <PencilSimple size={15} />
                          </button>
                          <button onClick={() => setDeleteTarget(edge)} className="ios-icon-button !h-8 !w-8 text-[#8a8f98] hover:text-[#dc2626]" aria-label="删除关系">
                            <Trash size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {visibleEdges.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#d9d9e3] bg-[#f7f7f8] px-4 py-8 text-center text-sm text-[#6b7280]">
                    这个视角下还没有关系。先添加两位亲友之间的关系。
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除这条关系？"
        description="删除后，关系网中这两位亲友之间的连接会被移除。"
        confirmLabel="确认删除"
        danger
        icon={<Trash size={20} weight="bold" />}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function NetworkCanvas({
  relatives,
  relationships,
  perspective,
  relativeById,
}: {
  relatives: Relative[];
  relationships: RelativeRelationship[];
  perspective: Perspective;
  relativeById: Map<number, Relative>;
}) {
  const centerLabel = perspective === 'self' ? '我' : relativeById.get(Number(perspective))?.name || '视角';
  const nodes = perspective === 'self' ? relatives : relatives.filter((relative) => relative.id !== perspective);
  const radius = 170;
  const center = { x: 280, y: 220 };
  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach((relative, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1) - Math.PI / 2;
    positions.set(relative.id, {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  });

  return (
    <div className="relative h-[420px] overflow-hidden rounded-[28px] bg-[#f7f7f8]">
      <svg viewBox="0 0 560 440" className="h-full w-full">
        {relationships.map((edge) => {
          const a = perspective === 'self'
            ? positions.get(String(edge.relative_a_id))
            : edge.relative_a_id === Number(perspective)
              ? center
              : positions.get(String(edge.relative_a_id));
          const b = perspective === 'self'
            ? positions.get(String(edge.relative_b_id))
            : edge.relative_b_id === Number(perspective)
              ? center
              : positions.get(String(edge.relative_b_id));
          if (!a || !b) return null;
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          return (
            <g key={edge.id}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d1d5db" strokeWidth={Math.max(1, edge.strength)} strokeLinecap="round" />
              <text x={mid.x} y={mid.y - 6} textAnchor="middle" className="fill-[#6b7280] text-[11px]">
                {relationFromPerspective(edge, perspective)}
              </text>
            </g>
          );
        })}
      </svg>

      <NodeCard x={center.x} y={center.y} label={centerLabel} active />
      {nodes.map((relative) => {
        const pos = positions.get(relative.id);
        if (!pos) return null;
        return <NodeCard key={relative.id} x={pos.x} y={pos.y} label={relative.name} />;
      })}
    </div>
  );
}

function NodeCard({ x, y, label, active = false }: { x: number; y: number; label: string; active?: boolean }) {
  return (
    <div
      className={`absolute flex h-14 min-w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-4 text-sm font-semibold shadow-sm ring-1 ${
        active ? 'bg-[#202123] text-white ring-[#202123]' : 'bg-white text-[#202123] ring-[#e5e7eb]'
      }`}
      style={{ left: `${(x / 560) * 100}%`, top: `${(y / 440) * 100}%` }}
    >
      <span className="max-w-24 truncate">{label}</span>
    </div>
  );
}
