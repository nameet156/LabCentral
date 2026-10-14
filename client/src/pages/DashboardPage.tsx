import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FlaskConical, Plus, Sparkles } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { CreateSampleForm } from '@/components/samples/CreateSampleForm';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { samplesApi, type Sample, type SampleStatus } from '@/api/samples.api';
import { Badge, Button, Card, Skeleton } from '@/components/ui/primitives';

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
    const previousSamples = [...samples];
    setSamples(prev => prev.map(s => s._id === sampleId ? { ...s, status: newStatus } : s));

    try {
      const res = await samplesApi.updateStatus(sampleId, { status: newStatus, version });
      setSamples(prev => prev.map(s => s._id === sampleId ? res.data.sample : s));
      toast.success('Status updated successfully');
    } catch (err: any) {
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
      transition={{ duration: 0.18 }}
      className="flex min-h-[calc(100vh-116px)] flex-col gap-5 pb-1"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-primary-300/15 bg-gradient-to-br from-primary-500/20 to-cyan-400/10 text-primary-300 shadow-[0_0_28px_rgba(45,91,255,0.12)] sm:flex">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-[26px] font-semibold tracking-tight text-surface-50 sm:text-[30px]">Sample Tracker</h1>
              {!isLoading && <Badge tone="blue" className="font-mono tabular-nums">{samples.length} total</Badge>}
            </div>
            <p className="mt-1 text-[13px] text-surface-400">Follow every sample through the laboratory workflow.</p>
          </div>
        </div>

        {canCreateSample && (
          <Button onClick={() => setIsCreateFormOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New sample
          </Button>
        )}
      </div>

      <Card className="relative flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-2xl bg-surface-950/35 p-3 sm:p-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/30 to-transparent" />
        {isLoading ? (
          <div className="flex h-full min-h-[490px] gap-3 overflow-x-hidden">
            {[1, 2, 3, 4, 5].map((column) => (
              <div key={column} className="flex w-[280px] min-w-[280px] flex-col gap-3 rounded-xl border border-white/[0.06] bg-surface-900/60 p-3">
                <Skeleton className="h-11 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                {column % 2 === 0 && <Skeleton className="h-28 w-full rounded-xl" />}
              </div>
            ))}
          </div>
        ) : samples.length === 0 ? (
          <div className="flex min-h-[480px] flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-300/15 bg-gradient-to-br from-primary-500/15 to-cyan-400/10 text-primary-300">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-surface-50">Your sample queue is ready</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-surface-400">When samples are registered, you can track assignments and workflow progress here.</p>
            {canCreateSample && (
              <Button onClick={() => setIsCreateFormOpen(true)} className="mt-6">
                <Plus className="h-4 w-4" />
                Create your first sample
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <KanbanBoard
            samples={samples}
            onStatusChange={handleStatusChange}
            onCardClick={handleCardClick}
          />
        )}
      </Card>

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
