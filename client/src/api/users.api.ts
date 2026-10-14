import api from './axios';
import type { User } from './auth.api';

export interface ManagedUser extends User {
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  list: () => api.get<{ users: ManagedUser[] }>('/users'),
  listAssignable: () => api.get<{ users: Pick<User, '_id' | 'name' | 'email' | 'role'>[] }>('/users/assignable'),
  update: (id: string, data: { name?: string; role?: 'admin' | 'technician' | 'viewer' }) =>
    api.patch<{ user: ManagedUser }>(`/users/${id}`, data),
  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/users/${id}`),
};
