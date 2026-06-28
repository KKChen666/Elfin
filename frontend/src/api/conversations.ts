import client from './client';

export interface Conversation {
  id: number;
  title: string | null;
  type: 'direct' | 'group';
  participants: { agent_id: number; agent_name: string; agent_avatar: string | null }[] | null;
  last_message: { id: number; content: string; sender_type: string; created_at: string } | null;
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
  getAll() {
    return client.get<Conversation[]>('/conversations');
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
  getMessages(convId: number) {
    return client.get<Message[]>(`/conversations/${convId}/messages`);
  },
  sendMessage(convId: number, content: string) {
    return client.post<Message>(`/conversations/${convId}/messages`, { content });
  },
  triggerAgentReply(convId: number, agentId?: number) {
    const params = agentId ? `?agent_id=${agentId}` : '';
    return client.post(`/conversations/${convId}/messages/agent${params}`, {}, {
      responseType: 'stream',
    });
  },
};
