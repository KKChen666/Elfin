import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CalendarBlank, Gift, Heart, Plus, Trash } from '@phosphor-icons/react';
import { remindersApi, ReminderEvent } from '../api/reminders';
import { ConfirmDialog } from '../components/AppDialog';
import { showToast } from '../components/toastBus';
import { useRelativeStore } from '../stores/useRelativeStore';
import { getUpcomingEvents } from '../utils/dateUtils';

const EVENT_META: Record<string, { icon: typeof Gift; badgeText: string; tint: string }> = {
  birthday: { icon: Gift, badgeText: '生日', tint: 'text-[#202123] bg-[#f7f7f8]' },
  mothers_day: { icon: Heart, badgeText: '母亲节', tint: 'text-[#af52de] bg-[#f7edff]' },
  fathers_day: { icon: CalendarBlank, badgeText: '父亲节', tint: 'text-[#248a3d] bg-[#eef8f1]' },
  custom: { icon: Bell, badgeText: '自定义', tint: 'text-[#202123] bg-[#eef2ff]' },
};

function getCountdownText(days: number): string {
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  return `${days} 天后`;
}

export default function Reminders() {
  const { relatives, loadRelatives, hasLoaded } = useRelativeStore();
  const [reminders, setReminders] = useState<ReminderEvent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ReminderEvent | null>(null);
  const [form, setForm] = useState({
    title: '',
    date: '',
    relative_id: '',
    note: '',
    advance_days: '1,3,7',
  });

  useEffect(() => {
    if (!hasLoaded) loadRelatives();
    loadReminders();
  }, [hasLoaded, loadRelatives]);

  const events = useMemo(() => getUpcomingEvents(relatives, reminders), [relatives, reminders]);

  const loadReminders = async () => {
    try {
      const res = await remindersApi.getAll();
      setReminders(res.data);
    } catch {
      showToast('error', '提醒加载失败');
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.date || isSaving) return;
    setIsSaving(true);
    try {
      const advanceDays = form.advance_days
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isFinite(item) && item >= 0);
      await remindersApi.create({
        title: form.title.trim(),
        date: form.date,
        relative_id: form.relative_id ? Number(form.relative_id) : null,
        note: form.note.trim() || null,
        advance_days: advanceDays.length ? advanceDays : [1, 3, 7],
      });
      setForm({ title: '', date: '', relative_id: '', note: '', advance_days: '1,3,7' });
      await loadReminders();
      showToast('success', '提醒已创建');
    } catch {
      showToast('error', '提醒创建失败');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remindersApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await loadReminders();
      showToast('success', '提醒已删除');
    } catch {
      showToast('error', '提醒删除失败');
    }
  };

  return (
    <div className="ios-page h-full overflow-y-auto">
      <div className="ios-container">
        <header className="ios-header">
          <div>
            <p className="ios-kicker">提醒</p>
            <h1 className="ios-title">别错过重要日子</h1>
            <p className="ios-subtitle">
              生日和节日会自动整理，也可以手动添加纪念日、拜访和需要提前准备的事情。
            </p>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <section className="grid gap-3">
            {events.length === 0 ? (
              <div className="ios-panel flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f7f7f8] text-[#202123]">
                  <Bell size={30} />
                </div>
                <h2 className="text-xl font-semibold">暂时没有提醒</h2>
                <p className="mt-2 text-sm text-[#7a7a7a]">添加亲友或自定义提醒后，这里会自动排好时间。</p>
              </div>
            ) : (
              events.map((event, index) => {
                const meta = EVENT_META[event.type] || EVENT_META.birthday;
                const Icon = meta.icon;
                return (
                  <Link
                    key={`${event.id}-${index}`}
                    to={event.relativeId ? `/detail/${event.relativeId}` : '/calendar'}
                    className="ios-card block p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${meta.tint}`}>
                        <Icon size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[16px] font-semibold text-[#1d1d1f]">{event.name || event.label}</h3>
                        <p className="mt-0.5 text-sm text-[#7a7a7a]">
                          {event.date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="rounded-full bg-[#f5f5f7] px-3 py-1 text-sm font-semibold text-[#1d1d1f]">
                          {getCountdownText(event.daysUntil)}
                        </div>
                        <div className="mt-1 text-xs text-[#8e8e93]">{meta.badgeText}</div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </section>

          <aside className="grid gap-5">
            <section className="ios-panel p-4">
              <h2 className="text-lg font-semibold text-[#202123]">添加自定义提醒</h2>
              <div className="mt-4 grid gap-3">
                <input
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="例如：给妈妈买礼物"
                  className="ios-input"
                />
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                  className="ios-input"
                />
                <select
                  value={form.relative_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, relative_id: event.target.value }))}
                  className="ios-input"
                >
                  <option value="">不关联亲友</option>
                  {relatives.map((relative) => (
                    <option key={relative.id} value={relative.id}>{relative.name}</option>
                  ))}
                </select>
                <input
                  value={form.advance_days}
                  onChange={(event) => setForm((prev) => ({ ...prev, advance_days: event.target.value }))}
                  placeholder="提前天数，例如：1,3,7"
                  className="ios-input"
                />
                <textarea
                  value={form.note}
                  onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="备注，可写准备事项"
                  className="ios-input"
                  rows={3}
                />
                <button
                  onClick={handleCreate}
                  disabled={!form.title.trim() || !form.date || isSaving}
                  className="ios-button-primary"
                >
                  <Plus size={17} />
                  {isSaving ? '保存中...' : '保存提醒'}
                </button>
              </div>
            </section>

            <section className="ios-panel p-4">
              <h2 className="text-lg font-semibold text-[#202123]">自定义提醒</h2>
              <div className="mt-3 grid gap-2">
                {reminders.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#202123]">{item.title}</p>
                        <p className="mt-1 text-xs text-[#6b7280]">{item.date}</p>
                        {item.note && <p className="mt-1 line-clamp-2 text-xs text-[#6b7280]">{item.note}</p>}
                      </div>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="ios-icon-button !h-8 !w-8 shrink-0 text-[#8a8f98] hover:text-[#dc2626]"
                        aria-label="删除提醒"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                {reminders.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#d9d9e3] bg-[#f7f7f8] px-4 py-8 text-center text-sm text-[#6b7280]">
                    还没有自定义提醒。
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除这个提醒？"
        description="删除后，这个自定义提醒不会再出现在提醒和日历里。"
        confirmLabel="删除"
        danger
        icon={<Trash size={20} weight="bold" />}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
