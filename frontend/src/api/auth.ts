import client from './client';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface LLMSettings {
  api_key_masked: string | null;
  api_base: string;
  model: string;
  timeout: number;
  is_configured: boolean;
}

export interface LLMSettingsUpdate {
  api_key?: string | null;
  api_base?: string | null;
  model?: string | null;
  timeout?: number | null;
}

export const authApi = {
  register(username: string, password: string) {
    return client.post<User>('/auth/register', { username, password });
  },

  login(username: string, password: string) {
    return client.post<LoginResponse>('/auth/login', { username, password });
  },

  getMe() {
    return client.get<User>('/auth/me');
  },

  getLLMSettings() {
    return client.get<LLMSettings>('/auth/llm-settings');
  },

  updateLLMSettings(data: LLMSettingsUpdate) {
    return client.put<LLMSettings>('/auth/llm-settings', data);
  },
};
