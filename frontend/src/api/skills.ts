import client from './client';

export interface Skill {
  id: number;
  name: string;
  description: string | null;
  source_type: string;
  source_relative_id: number | null;
  personality: Record<string, unknown> | null;
  communication_style: Record<string, unknown> | null;
  knowledge_domains: string[] | null;
  expression_patterns: Record<string, unknown> | null;
  memory_tree: unknown[] | null;
  system_prompt: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillCreateData {
  name: string;
  description?: string;
  source_type?: string;
  source_relative_id?: number;
  personality?: Record<string, unknown>;
  communication_style?: Record<string, unknown>;
  knowledge_domains?: string[];
  expression_patterns?: Record<string, unknown>;
  memory_tree?: unknown[];
  system_prompt?: string;
}

export interface SkillCreatorData {
  name: string;
  goal: string;
  description?: string;
  raw_text?: string;
  debug_cases?: string;
  files?: File[];
}

export const skillsApi = {
  getAll() {
    return client.get<Skill[]>('/skills');
  },
  getOne(id: number) {
    return client.get<Skill>(`/skills/${id}`);
  },
  create(data: SkillCreateData) {
    return client.post<Skill>('/skills', data);
  },
  update(id: number, data: Partial<SkillCreateData>) {
    return client.put<Skill>(`/skills/${id}`, data);
  },
  delete(id: number) {
    return client.delete(`/skills/${id}`);
  },
  distill(relativeId: number) {
    return client.post<Skill>(`/skills/distill/${relativeId}`);
  },
  merge(skillIds: number[], newName: string) {
    return client.post<Skill>('/skills/merge', { skill_ids: skillIds, new_name: newName });
  },
  createWithCreator(data: SkillCreatorData) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('goal', data.goal);
    if (data.description) formData.append('description', data.description);
    if (data.raw_text) formData.append('raw_text', data.raw_text);
    if (data.debug_cases) formData.append('debug_cases', data.debug_cases);
    data.files?.forEach((file) => formData.append('files', file));
    return client.post<Skill>('/skills/creator', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000,
    });
  },
};
