import client from './client';

export interface Agent {
  id: number;
  name: string;
  description: string | null;
  avatar_url: string | null;
  system_prompt: string | null;
  config: Record<string, unknown> | null;
  is_active: boolean;
  skills: { id: number; name: string; weight: number }[] | null;
  created_at: string;
  updated_at: string;
}

export interface AgentCreateData {
  name: string;
  description?: string;
  avatar_url?: string;
  system_prompt?: string;
  config?: Record<string, unknown>;
  skill_ids?: number[];
}

export const agentsApi = {
  getAll() {
    return client.get<Agent[]>('/agents');
  },
  getOne(id: number) {
    return client.get<Agent>(`/agents/${id}`);
  },
  create(data: AgentCreateData) {
    return client.post<Agent>('/agents', data);
  },
  update(id: number, data: Partial<AgentCreateData>) {
    return client.put<Agent>(`/agents/${id}`, data);
  },
  delete(id: number) {
    return client.delete(`/agents/${id}`);
  },
  addSkill(agentId: number, skillId: number, weight: number = 1.0) {
    return client.post<Agent>(`/agents/${agentId}/skills`, { skill_id: skillId, weight });
  },
  removeSkill(agentId: number, skillId: number) {
    return client.delete(`/agents/${agentId}/skills/${skillId}`);
  },
};
