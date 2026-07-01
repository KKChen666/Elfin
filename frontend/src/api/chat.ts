import client from './client';

export interface ChatMessageOut {
  id: number;
  relative_id: number;
  content: string;
  sender: 'user' | 'avatar';
  timestamp: string;
}

export interface AvatarResponse {
  content: string;
}

export interface ChatStyleResponse {
  chat_style: Record<string, unknown>;
}

export interface MemoryBackendStatus {
  backend: string;
  available: boolean;
  reason?: string;
}

export const chatApi = {
  getMessages(relativeId: number) {
    return client.get<ChatMessageOut[]>(`/relatives/${relativeId}/messages`);
  },

  addMessage(relativeId: number, content: string, sender: 'user' | 'avatar') {
    return client.post<ChatMessageOut>(`/relatives/${relativeId}/messages`, {
      content,
      sender,
    });
  },

  clearMessages(relativeId: number) {
    return client.delete(`/relatives/${relativeId}/messages`);
  },

  getAvatarResponse(relativeId: number, content: string) {
    return client.post<AvatarResponse>(
      `/relatives/${relativeId}/messages/respond`,
      { content, sender: 'user' }
    );
  },

  uploadChatFile(relativeId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<ChatStyleResponse>(
      `/relatives/${relativeId}/chat-style/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  getChatStyle(relativeId: number) {
    return client.get<ChatStyleResponse>(`/relatives/${relativeId}/chat-style`);
  },

  getMemoryBackend(relativeId: number) {
    return client.get<MemoryBackendStatus>(`/relatives/${relativeId}/chat-style/memory-backend`);
  },
};
