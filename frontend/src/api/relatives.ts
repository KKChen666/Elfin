import client from './client';

export interface RelativeCreateData {
  name: string;
  birthday: string;
  is_lunar?: boolean;
  relation: string;
  phone?: string;
  hobbies?: string;
  clothing_size?: string;
  shoe_size?: string;
  notes?: string;
  mbti?: string;
  address?: string;
  zodiac?: string;
  chinese_zodiac?: string;
  avatar?: Record<string, unknown>;
}

export interface RelativeUpdateData extends Partial<RelativeCreateData> {
  avatar_image_url?: string;
  chat_style?: Record<string, unknown>;
}

// 后端返回的 Relative（id 为 number，字段用 snake_case）
export interface BackendRelative {
  id: number;
  name: string;
  birthday: string;
  is_lunar: boolean;
  relation: string;
  phone: string | null;
  hobbies: string | null;
  clothing_size: string | null;
  shoe_size: string | null;
  notes: string | null;
  mbti: string | null;
  address: string | null;
  zodiac: string | null;
  chinese_zodiac: string | null;
  avatar: Record<string, unknown>;
  avatar_image_url: string | null;
  chat_style: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface RelativeRelationship {
  id: number;
  relative_a_id: number;
  relative_b_id: number;
  relation_label: string;
  reverse_relation_label: string | null;
  note: string | null;
  strength: number;
  created_at: string;
  updated_at: string;
}

export interface RelativeRelationshipInput {
  relative_a_id: number;
  relative_b_id: number;
  relation_label: string;
  reverse_relation_label?: string | null;
  note?: string | null;
  strength?: number;
}

export const relativesApi = {
  getAll() {
    return client.get<BackendRelative[]>('/relatives');
  },

  getOne(id: number) {
    return client.get<BackendRelative>(`/relatives/${id}`);
  },

  create(data: RelativeCreateData) {
    return client.post<BackendRelative>('/relatives', data);
  },

  update(id: number, data: RelativeUpdateData) {
    return client.put<BackendRelative>(`/relatives/${id}`, data);
  },

  delete(id: number) {
    return client.delete(`/relatives/${id}`);
  },

  getStats() {
    return client.get('/relatives/stats/summary');
  },

  getRelationships() {
    return client.get<RelativeRelationship[]>('/relatives/relationships/network');
  },

  saveRelationship(data: RelativeRelationshipInput) {
    return client.post<RelativeRelationship>('/relatives/relationships/network', data);
  },

  updateRelationship(id: number, data: Partial<RelativeRelationshipInput>) {
    return client.put<RelativeRelationship>(`/relatives/relationships/network/${id}`, data);
  },

  deleteRelationship(id: number) {
    return client.delete(`/relatives/relationships/network/${id}`);
  },
};
