import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { reportsApi } from '@/api/reports.api';
import { StatCard } from '@/components/reports/StatCard';
import { StatusBarChart, TypePieChart } from '@/components/reports/Charts';

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

  const getStatusCount = (status: string) => {
    return data?.byStatus.find(s => s.status === status)?.count || 0;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div>
          <div className="h-8 bg-surface-800 rounded w-48 mb-2"></div>
          <div className="h-4 bg-surface-800 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-surface-800 rounded-xl"></div>
          <div className="h-[400px] bg-surface-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-surface-400">Failed to load reports.</div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="p-8 space-y-8 max-w-7xl mx-auto"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-heading font-bold text-surface-100">Reports</h1>
        <p className="text-surface-400 mt-1">Sample analytics overview</p>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Samples"
          value={data.total}
          icon={FlaskConical}
          color="text-primary-400"
          bgColor="bg-primary-400/10"
        />
        <StatCard
          label="Completed"
          value={getStatusCount('completed')}
          icon={CheckCircle2}
          color="text-emerald-400"
          bgColor="bg-emerald-400/10"
        />
        <StatCard
          label="In Progress"
          value={getStatusCount('in_progress')}
          icon={Clock}
          color="text-blue-400"
          bgColor="bg-blue-400/10"
        />
        <StatCard
          label="Rejected"
          value={getStatusCount('rejected')}
          icon={XCircle}
          color="text-rose-400"
          bgColor="bg-rose-400/10"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-surface-100 mb-6">Samples by Status</h2>
          <StatusBarChart data={data.byStatus} />
        </motion.div>
        
        <motion.div variants={item} className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-surface-100 mb-6">Samples by Type</h2>
          <TypePieChart data={data.byType} />
        </motion.div>
      </div>
    </motion.div>
  );
}
