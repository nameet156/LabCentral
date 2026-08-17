import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { samplesApi, type Sample, type SampleStatus, type AuditLogEntry } from '@/api/samples.api';
import { AuditTimeline } from '@/components/samples/AuditTimeline';
import { NotesSection } from '@/components/samples/NotesSection';

const STATE_TRANSITIONS: Record<string, string[]> = {
  received: ['in_progress', 'rejected'],
  in_progress: ['qc_review', 'rejected'],
  qc_review: ['completed', 'rejected'],
  completed: [],
  rejected: []
};

const formatStatus = (status: string) => {
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'received': return 'bg-surface-800 text-surface-200';
    case 'in_progress': return 'bg-blue-500/20 text-blue-400';
    case 'qc_review': return 'bg-amber-500/20 text-amber-400';
    case 'completed': return 'bg-emerald-500/20 text-emerald-400';
    case 'rejected': return 'bg-rose-500/20 text-rose-400';
    default: return 'bg-surface-800 text-surface-200';
  }
};

export default function SampleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [sample, setSample] = useState<Sample | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

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
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !sample) return;
    try {
      setStatusUpdating(true);
      await samplesApi.updateStatus(id, { status: newStatus as SampleStatus, version: sample.__v });
      await fetchSampleData();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status. The sample may have been modified by someone else.');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8 animate-pulse space-y-8">
        <div className="h-6 w-24 bg-surface-800 rounded"></div>
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="h-8 w-48 bg-surface-800 rounded"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-surface-800 rounded"></div>)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-surface-800 rounded-xl"></div>
          <div className="h-96 bg-surface-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !sample) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-surface-400">
        <h2 className="text-2xl font-bold text-surface-200 mb-2">404 - Sample Not Found</h2>
        <p>{error}</p>
        <Link to="/" className="mt-6 flex items-center gap-2 text-primary-400 hover:text-primary-300">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const canEdit = user?.role === 'admin' || user?.role === 'technician';
  const nextStatuses = STATE_TRANSITIONS[sample.status] || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-4 md:p-8 space-y-8"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Samples
      </Link>

      <div className="glass-card rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-surface-100 flex items-center gap-3">
              {sample.sampleCode}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(sample.status)}`}>
                {formatStatus(sample.status)}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-surface-800 text-surface-300">
                {sample.type}
              </span>
            </div>
          </div>

          {canEdit && nextStatuses.length > 0 && (
            <div className="flex flex-wrap gap-2 border border-surface-800 rounded-lg p-2 bg-surface-900/50">
              <span className="text-xs text-surface-500 w-full mb-1">Update Status</span>
              {nextStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={statusUpdating}
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-surface-800 text-surface-200 hover:bg-surface-700 disabled:opacity-50 transition-colors"
                >
                  Mark {formatStatus(status)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-surface-800">
          <div>
            <div className="text-xs text-surface-500 mb-1">Created By</div>
            <div className="text-sm font-medium text-surface-200">{sample.createdBy?.name || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-xs text-surface-500 mb-1">Assigned To</div>
            <div className="text-sm font-medium text-surface-200">{sample.assignedTo?.name || 'Unassigned'}</div>
          </div>
          <div>
            <div className="text-xs text-surface-500 mb-1">Created At</div>
            <div className="text-sm font-medium text-surface-200">
              {new Date(sample.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-surface-500 mb-1">Last Updated</div>
            <div className="text-sm font-medium text-surface-200">
              {new Date(sample.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AuditTimeline entries={auditLog} />
        <NotesSection 
          notes={sample.notes || []} 
          sampleId={sample._id} 
          onNoteAdded={fetchSampleData}
          canEdit={canEdit}
        />
      </div>
    </motion.div>
  );
}
