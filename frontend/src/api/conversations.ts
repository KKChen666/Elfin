import client from './client';

export interface Conversation {
  id: number;
  title: string | null;
  type: 'direct' | 'group';
  participants: { agent_id: number; agent_name: string; agent_avatar: string | null }[] | null;
  last_message: { id: number; content: string; sender_type: string; created_at: string } | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_type: 'user' | 'agent';
  sender_id: number;
  sender_name: string | null;
  content: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

export const conversationsApi = {
  getAll(archived = false) {
    return client.get<Conversation[]>('/conversations', { params: { archived } });
  },
  getOne(id: number) {
    return client.get<Conversation>(`/conversations/${id}`);
  },
  create(agentIds: number[], title?: string, type?: string) {
    return client.post<Conversation>('/conversations', {
      agent_ids: agentIds,
      title,
      type: type || (agentIds.length > 1 ? 'group' : 'direct'),
    });
  },
  delete(id: number) {
    return client.delete(`/conversations/${id}`);
  },
  update(id: number, data: { title?: string | null; is_archived?: boolean }) {
    return client.patch<Conversation>(`/conversations/${id}`, data);
  },
  archive(id: number) {
    return client.patch<Conversation>(`/conversations/${id}`, { is_archived: true });
  },
  restore(id: number) {
    return client.patch<Conversation>(`/conversations/${id}`, { is_archived: false });
  },
  getMessages(convId: number) {
    return client.get<Message[]>(`/conversations/${convId}/messages`);
  },
  sendMessage(convId: number, content: string) {
    return client.post<Message>(`/conversations/${convId}/messages`, { content });
  },
  triggerAgentReply(convId: number, agentId?: number) {
    const params = agentId ? `?agent_id=${agentId}` : '';
    return fetch(`/api/conversations/${convId}/messages/agent${params}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).then((response) => {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return response;
    });
  },
};
