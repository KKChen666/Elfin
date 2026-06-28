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
};
