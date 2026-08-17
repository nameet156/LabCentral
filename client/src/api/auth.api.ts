import api from './axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'viewer';
}

interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  getMe: () => api.get<{ user: User }>('/auth/me'),
};
