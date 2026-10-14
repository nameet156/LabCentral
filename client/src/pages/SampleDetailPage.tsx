import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Clock3, FlaskConical, UserCheck, UserRound, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { samplesApi, type Sample, type SampleStatus, type AuditLogEntry } from '@/api/samples.api';
import { usersApi } from '@/api/users.api';
import type { User } from '@/api/auth.api';
import { AuditTimeline } from '@/components/samples/AuditTimeline';
import { NotesSection } from '@/components/samples/NotesSection';
import { Badge, Button, Card, Select, Skeleton } from '@/components/ui/primitives';

const STATE_TRANSITIONS: Record<string, string[]> = {
  received: ['in_progress', 'rejected'],
  in_progress: ['qc_review', 'rejected'],
  qc_review: ['completed', 'rejected'],
  completed: [],
  rejected: [],
};

const formatStatus = (status: string) => status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

const getStatusColor = (status: string) => {
  switch (status) {
    case 'received': return 'text-status-received bg-status-received-bg';
    case 'in_progress': return 'text-status-in-progress bg-status-in-progress-bg';
    case 'qc_review': return 'text-status-qc-review bg-status-qc-review-bg';
    case 'completed': return 'text-status-completed bg-status-completed-bg';
    case 'rejected': return 'text-status-rejected bg-status-rejected-bg';
    default: return 'text-surface-300 bg-surface-800';
  }
};

export default function SampleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();

  const [sample, setSample] = useState<Sample | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [staffList, setStaffList] = useState<Pick<User, '_id' | 'name' | 'email' | 'role'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchSampleData = async () => {
    if (!id) return;
    try {
      const response = await samplesApi.getById(id);
      setSample(response.data.sample);
      setAuditLog(response.data.auditLog || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch sample', err);
      setError('Sample not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSampleData();
    usersApi.listAssignable()
      .then(res => setStaffList(res.data.users))
      .catch(err => console.error('Failed to fetch staff list', err));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !sample) return;
    try {
      setStatusUpdating(true);
      await samplesApi.updateStatus(id, { status: newStatus as SampleStatus, version: sample.__v });
      await fetchSampleData();
      toast.success(`Sample status updated to ${formatStatus(newStatus)}`);
    } catch (err: any) {
      console.error('Failed to update status', err);
      toast.error(err.response?.data?.error || 'Failed to update status. The sample may have been modified by someone else.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssignChange = async (newAssigneeId: string) => {
    if (!id || !sample) return;
    try {
      setIsAssigning(true);
      const res = await samplesApi.assign(id, newAssigneeId || null);
      setSample(res.data.sample);
      const assigneeName = res.data.sample.assignedTo?.name || 'Unassigned';
      toast.success(`Assigned to ${assigneeName}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update assignment');
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-5 py-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2"><Skeleton className="h-[360px] rounded-xl" /><Skeleton className="h-[360px] rounded-xl" /></div>
      </div>
    );
  }

  if (error || !sample) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-status-rejected/20 bg-status-rejected-bg text-status-rejected"><FlaskConical className="h-5 w-5" /></span>
        <h2 className="font-heading text-xl font-semibold text-surface-100">Sample not found</h2>
        <p className="mt-1 text-sm text-surface-400">{error}</p>
        <Link to="/" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-primary-300 transition hover:bg-primary-500/10 focus-visible:ring-2 focus-visible:ring-primary-500"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
      </div>
    );
  }

  const canEdit = user?.role === 'admin' || user?.role === 'technician';
  const nextStatuses = STATE_TRANSITIONS[sample.status] || [];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="mx-auto max-w-6xl space-y-4 py-1 sm:space-y-5">
      <Link to="/" className="inline-flex min-h-9 items-center gap-2 rounded-lg pr-3 text-xs font-medium text-surface-400 transition hover:text-primary-300 focus-visible:ring-2 focus-visible:ring-primary-500"><ArrowLeft className="h-4 w-4" />Back to samples</Link>

      <Card className="overflow-hidden rounded-xl">
        <div className="relative p-4 sm:p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-64 rounded-full bg-primary-500/[0.05] blur-3xl" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-300/15 bg-primary-500/10 text-primary-300"><FlaskConical className="h-5 w-5" /></span>
                <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-surface-500">Sample record</p><h1 className="mt-0.5 break-all font-mono text-xl font-semibold tracking-wide text-surface-50 tabular-nums sm:text-2xl">{sample.sampleCode}</h1></div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2"><Badge className={`min-h-7 px-2.5 text-[10px] uppercase tracking-wide ${getStatusColor(sample.status)}`}>{formatStatus(sample.status)}</Badge><Badge tone="neutral" className="min-h-7 px-2.5 capitalize">{sample.type}</Badge></div>
            </div>

            {canEdit && nextStatuses.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl border border-white/[0.07] bg-surface-850/70 p-3 xl:min-w-[250px]">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-surface-500">Move workflow forward</span>
                <div className="flex flex-wrap gap-2">{nextStatuses.map(status => <Button key={status} variant="secondary" onClick={() => handleStatusChange(status)} disabled={statusUpdating} className="min-h-9 px-3 text-xs">{statusUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Mark {formatStatus(status)}</Button>)}</div>
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/[0.07] pt-5 sm:grid-cols-2 xl:grid-cols-4">
            <div><p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-surface-500"><UserRound className="h-3.5 w-3.5" />Created by</p><p className="text-[13px] font-medium text-surface-200">{sample.createdBy?.name || 'Unknown'}</p></div>
            <div><p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-surface-500"><UserCheck className="h-3.5 w-3.5" />Assigned to</p>{canEdit ? <div className="relative"><Select value={sample.assignedTo?._id || ''} onChange={(event) => handleAssignChange(event.target.value)} disabled={isAssigning} className="min-h-9 py-1.5 pr-8 text-xs font-medium"><option value="">Unassigned</option>{staffList.map((staff) => <option key={staff._id} value={staff._id}>{staff.name} ({staff.role.charAt(0).toUpperCase() + staff.role.slice(1)})</option>)}</Select>{isAssigning && <Loader2 className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 animate-spin text-primary-400" />}</div> : <p className="text-[13px] font-medium text-surface-200">{sample.assignedTo?.name || 'Unassigned'}</p>}</div>
            <div><p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-surface-500"><CalendarDays className="h-3.5 w-3.5" />Created</p><p className="text-[13px] font-medium text-surface-200">{new Date(sample.createdAt).toLocaleDateString()}</p></div>
            <div><p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-surface-500"><Clock3 className="h-3.5 w-3.5" />Last updated</p><p className="text-[13px] font-medium text-surface-200">{new Date(sample.updatedAt).toLocaleDateString()}</p></div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
        <AuditTimeline entries={auditLog} />
        <NotesSection notes={sample.notes || []} sampleId={sample._id} onNoteAdded={fetchSampleData} canEdit={canEdit} />
      </div>
    </motion.div>
  );
}
