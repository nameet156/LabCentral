import { motion } from 'framer-motion';
import type { AuditLogEntry } from '@/api/samples.api';
import { Activity, CheckCircle2, FileText, Plus } from 'lucide-react';
import { Card } from '@/components/ui/primitives';

interface AuditTimelineProps {
  entries: AuditLogEntry[];
}

export function AuditTimeline({ entries }: AuditTimelineProps) {
  if (!entries || entries.length === 0) {
    return (
      <Card className="flex min-h-[300px] flex-col items-center justify-center rounded-xl px-6 py-10 text-center">
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-800 text-surface-400"><Activity className="h-4 w-4" /></span>
        <h3 className="text-sm font-semibold text-surface-200">No audit activity yet</h3>
        <p className="mt-1 max-w-xs text-xs leading-5 text-surface-500">Status changes and sample updates will be recorded here.</p>
      </Card>
    );
  }

  const getActionStyle = (action: string) => {
    switch (action) {
      case 'CREATED': return { color: 'bg-status-completed text-status-completed', icon: Plus };
      case 'STATUS_CHANGE': return { color: 'bg-status-in-progress text-status-in-progress', icon: Activity };
      case 'NOTE_ADDED': return { color: 'bg-status-qc-review text-status-qc-review', icon: FileText };
      default: return { color: 'bg-primary-500 text-primary-400', icon: CheckCircle2 };
    }
  };

  const getActionText = (entry: AuditLogEntry) => {
    if (entry.action === 'CREATED') return 'Sample created';
    if (entry.action === 'NOTE_ADDED') return 'Note added';
    if (entry.action === 'STATUS_CHANGE') return `Status changed from ${formatStatus(entry.previousStatus || '')} to ${formatStatus(entry.newStatus)}`;
    return 'Unknown action';
  };

  const formatStatus = (status: string) => status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const formatDate = (isoString: string) => new Date(isoString).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <Card className="min-h-[300px] rounded-xl p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-semibold text-surface-100">Audit history</h3><p className="mt-1 text-xs text-surface-500">Recorded events for this sample</p></div><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-300"><Activity className="h-4 w-4" /></span></div>
      <div className="relative ml-1 space-y-0 border-l border-surface-700/70 pl-5">
        {entries.map((entry, index) => {
          const actionStyle = getActionStyle(entry.action);
          const Icon = actionStyle.icon;
          return (
            <motion.div key={entry._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16, delay: Math.min(index * 0.04, 0.24) }} className="relative pb-5 last:pb-0">
              <span className={`absolute -left-[27px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-surface-900 ${actionStyle.color}`}><Icon className="h-2.5 w-2.5 text-white" /></span>
              <div className="rounded-lg border border-white/[0.05] bg-surface-850/55 px-3 py-2.5">
                <p className="text-xs font-medium leading-5 text-surface-200">{getActionText(entry)}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-surface-500"><span className="font-medium text-surface-400">{entry.performedBy?.name || 'System'}</span><span aria-hidden="true">·</span><span>{formatDate(entry.timestamp)}</span></div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
