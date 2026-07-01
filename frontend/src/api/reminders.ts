import client from './client';

export interface ReminderEvent {
  id: number;
  title: string;
  date: string;
  relative_id: number | null;
  advance_days: number[];
  note: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderEventInput {
  title: string;
  date: string;
  relative_id?: number | null;
  advance_days?: number[];
  note?: string | null;
  is_enabled?: boolean;
}

export const remindersApi = {
  getAll() {
    return client.get<ReminderEvent[]>('/reminders');
  },
  create(data: ReminderEventInput) {
    return client.post<ReminderEvent>('/reminders', data);
  },
  update(id: number, data: Partial<ReminderEventInput>) {
    return client.put<ReminderEvent>(`/reminders/${id}`, data);
  },
  delete(id: number) {
    return client.delete(`/reminders/${id}`);
  },
};
