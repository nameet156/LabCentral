import api from './axios';

export interface ReportSummary {
  total: number;
  byStatus: { status: string; count: number }[];
  byType: { type: string; count: number }[];
}

export const reportsApi = {
  getSummary: () => api.get<{ summary: ReportSummary }>('/reports/summary'),
};
