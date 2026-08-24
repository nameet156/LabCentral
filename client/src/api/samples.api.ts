import api from './axios';
import type { User } from './auth.api';

export type SampleStatus = 'received' | 'in_progress' | 'qc_review' | 'completed' | 'rejected';
export type SampleType = 'water' | 'food' | 'soil';

export interface Note {
  _id: string;
  text: string;
  author: Pick<User, '_id' | 'name' | 'email'>;
  createdAt: string;
}

export interface Sample {
  _id: string;
  sampleCode: string;
  type: SampleType;
  status: SampleStatus;
  assignedTo: Pick<User, '_id' | 'name' | 'email' | 'role'> | null;
  createdBy: Pick<User, '_id' | 'name' | 'email' | 'role'>;
  notes: Note[];
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  _id: string;
  sampleId: string;
  action: 'CREATED' | 'STATUS_CHANGE' | 'NOTE_ADDED';
  previousStatus: string | null;
  newStatus: string;
  performedBy: Pick<User, '_id' | 'name' | 'email' | 'role'>;
  timestamp: string;
}

export interface PaginatedResponse {
  samples: Sample[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const samplesApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse>('/samples', { params }),
  getById: (id: string) =>
    api.get<{ sample: Sample; auditLog: AuditLogEntry[] }>(`/samples/${id}`),
  create: (data: { type: SampleType; assignedTo?: string; notes?: string }) =>
    api.post<{ sample: Sample }>('/samples', data),
  updateStatus: (id: string, data: { status: SampleStatus; version: number }) =>
    api.patch<{ sample: Sample }>(`/samples/${id}/status`, data),
  assign: (id: string, assignedTo: string | null) =>
    api.patch<{ sample: Sample }>(`/samples/${id}/assign`, { assignedTo }),
  addNote: (id: string, text: string) =>
    api.post<{ sample: Sample }>(`/samples/${id}/notes`, { text }),
  getAuditLog: (id: string) =>
    api.get<{ auditLog: AuditLogEntry[] }>(`/samples/${id}/audit-log`),
};
