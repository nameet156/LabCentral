import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Clock3, FlaskConical, XCircle } from 'lucide-react';
import { reportsApi } from '@/api/reports.api';
import { StatCard } from '@/components/reports/StatCard';
import { StatusBarChart, TypePieChart } from '@/components/reports/Charts';
import { Card, Skeleton } from '@/components/ui/primitives';

interface SummaryData {
  total: number;
  byStatus: { status: string; count: number }[];
  byType: { type: string; count: number }[];
}

export default function ReportsPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await reportsApi.getSummary();
        setData(response.data.summary);
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getStatusCount = (status: string) => data?.byStatus.find(item => item.status === status)?.count || 0;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 py-2">
        <div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64" /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => <Skeleton key={index} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Skeleton className="h-[360px] rounded-xl" />
          <Skeleton className="h-[360px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-status-rejected/20 bg-status-rejected-bg text-status-rejected"><Activity className="h-5 w-5" /></span>
        <h1 className="font-heading text-lg font-semibold text-surface-100">Reports couldn’t be loaded</h1>
        <p className="mt-1 text-sm text-surface-400">Please try again later.</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.045 } },
  };
  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="mx-auto max-w-7xl space-y-6 py-1 sm:space-y-7">
      <motion.div variants={item} className="flex items-center gap-3.5">
        <span className="hidden h-11 w-11 items-center justify-center rounded-xl border border-primary-300/15 bg-gradient-to-br from-primary-500/15 to-cyan-400/10 text-primary-300 sm:flex"><Activity className="h-5 w-5" /></span>
        <div>
          <h1 className="font-heading text-[26px] font-semibold tracking-tight text-surface-50 sm:text-[30px]">Reports</h1>
          <p className="mt-1 text-[13px] text-surface-400">A live overview of sample volume and laboratory workflow.</p>
        </div>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
        <StatCard order={0} label="Total samples" value={data.total} icon={FlaskConical} color="text-primary-300" bgColor="bg-primary-500/10" />
        <StatCard order={1} label="Completed" value={getStatusCount('completed')} icon={CheckCircle2} color="text-status-completed" bgColor="bg-status-completed-bg" />
        <StatCard order={2} label="In progress" value={getStatusCount('in_progress')} icon={Clock3} color="text-status-in-progress" bgColor="bg-status-in-progress-bg" />
        <StatCard order={3} label="Rejected" value={getStatusCount('rejected')} icon={XCircle} color="text-status-rejected" bgColor="bg-status-rejected-bg" />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <motion.div variants={item}>
          <Card className="h-full overflow-hidden rounded-xl p-4 sm:p-5">
            <div className="mb-1 flex items-start justify-between gap-3">
              <div><h2 className="text-sm font-semibold text-surface-100">Samples by status</h2><p className="mt-1 text-xs text-surface-500">Current workflow distribution</p></div>
              <span className="rounded-lg border border-white/[0.06] bg-surface-850 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-surface-400">Workflow</span>
            </div>
            <StatusBarChart data={data.byStatus} />
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="h-full overflow-hidden rounded-xl p-4 sm:p-5">
            <div className="mb-1 flex items-start justify-between gap-3">
              <div><h2 className="text-sm font-semibold text-surface-100">Samples by type</h2><p className="mt-1 text-xs text-surface-500">Material category breakdown</p></div>
              <span className="rounded-lg border border-white/[0.06] bg-surface-850 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-surface-400">Categories</span>
            </div>
            <TypePieChart data={data.byType} />
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
