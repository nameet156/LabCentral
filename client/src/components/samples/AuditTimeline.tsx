import React from 'react';
import { motion } from 'framer-motion';
import { AuditLogEntry } from '@/api/samples.api';

interface AuditTimelineProps {
  entries: AuditLogEntry[];
}

export function AuditTimeline({ entries }: AuditTimelineProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center text-surface-400">
        No audit history available.
      </div>
    );
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATED': return 'bg-emerald-500';
      case 'STATUS_CHANGE': return 'bg-blue-500';
      case 'NOTE_ADDED': return 'bg-surface-400';
      default: return 'bg-primary-500';
    }
  };

  const getActionText = (entry: AuditLogEntry) => {
    if (entry.action === 'CREATED') return 'Sample created';
    if (entry.action === 'NOTE_ADDED') return 'Note added';
    if (entry.action === 'STATUS_CHANGE') {
      return `Status changed from ${formatStatus(entry.previousStatus || '')} to ${formatStatus(entry.newStatus)}`;
    }
    return 'Unknown action';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold text-surface-100 mb-6">Audit History</h3>
      <div className="relative pl-6 border-l border-surface-800 space-y-8">
        {entries.map((entry, index) => (
          <motion.div
            key={entry._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
          >
            <div className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-surface-950 ${getActionColor(entry.action)}`} />
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-surface-200">{getActionText(entry)}</span>
              <div className="flex items-center gap-2 mt-1 text-xs text-surface-400">
                <span>{entry.performedBy?.name || 'System'}</span>
                <span>•</span>
                <span>{formatDate(entry.timestamp)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
