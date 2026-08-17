import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LayoutDashboard } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { CreateSampleForm } from '@/components/samples/CreateSampleForm';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { samplesApi, type Sample, type SampleStatus } from '@/api/samples.api';

export default function DashboardPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const fetchSamples = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await samplesApi.list({ limit: 100 });
      setSamples(res.data.samples);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to fetch samples');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  const handleStatusChange = async (sampleId: string, newStatus: SampleStatus, version: number) => {
    // Optimistic update
    const previousSamples = [...samples];
    setSamples(prev => prev.map(s => s._id === sampleId ? { ...s, status: newStatus } : s));

    try {
      const res = await samplesApi.updateStatus(sampleId, { status: newStatus, version });
      // Update with server response (e.g., new version)
      setSamples(prev => prev.map(s => s._id === sampleId ? res.data.sample : s));
      toast.success('Status updated successfully');
    } catch (err: any) {
      // Revert on error
      setSamples(previousSamples);
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleCardClick = (sample: Sample) => {
    navigate(`/samples/${sample._id}`);
  };

  const canCreateSample = user?.role === 'admin' || user?.role === 'technician';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="h-full flex flex-col pt-6 px-8 pb-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-surface-50 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary-500" />
            Sample Tracker
          </h1>
          <p className="text-surface-400 mt-1">Drag samples between columns to update their workflow status</p>
        </div>

        {canCreateSample && (
          <button
            onClick={() => setIsCreateFormOpen(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white py-2.5 px-5 rounded-xl font-medium transition-all shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            New Sample
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 bg-surface-950/30 rounded-3xl p-6 border border-surface-800/50">
        {isLoading ? (
          <div className="flex gap-6 h-full overflow-x-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-[320px] min-w-[320px] h-full flex flex-col gap-4">
                <div className="h-14 bg-surface-900 rounded-2xl animate-pulse" />
                <div className="h-32 bg-surface-900/50 rounded-2xl animate-pulse" />
                <div className="h-32 bg-surface-900/50 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : samples.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-surface-900 rounded-full flex items-center justify-center mb-6">
              <LayoutDashboard className="w-10 h-10 text-surface-500" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-surface-50 mb-2">No Samples Yet</h3>
            <p className="text-surface-400 max-w-sm mb-8">
              No samples registered yet. Create your first sample to begin tracking.
            </p>
            {canCreateSample && (
              <button
                onClick={() => setIsCreateFormOpen(true)}
                className="flex items-center gap-2 bg-surface-800 hover:bg-surface-700 text-surface-100 py-2.5 px-5 rounded-xl font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Sample
              </button>
            )}
          </div>
        ) : (
          <KanbanBoard
            samples={samples}
            onStatusChange={handleStatusChange}
            onCardClick={handleCardClick}
          />
        )}
      </div>

      <CreateSampleForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onCreated={() => {
          fetchSamples();
          toast.success('Sample created successfully');
        }}
      />
    </motion.div>
  );
}
