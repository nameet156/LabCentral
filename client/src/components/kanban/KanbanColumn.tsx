import { Droppable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { SampleCard } from './SampleCard';
import type { Sample, SampleStatus } from '@/api/samples.api';

interface KanbanColumnProps {
  status: SampleStatus;
  samples: Sample[];
  onCardClick: (sample: Sample) => void;
}

const STATUS_LABELS: Record<SampleStatus, string> = {
  received: 'Received',
  in_progress: 'In Progress',
  qc_review: 'QC Review',
  completed: 'Completed',
  rejected: 'Rejected',
};

const STATUS_DOT: Record<SampleStatus, string> = {
  received: 'bg-status-received',
  in_progress: 'bg-status-in-progress',
  qc_review: 'bg-status-qc-review',
  completed: 'bg-status-completed',
  rejected: 'bg-status-rejected',
};

const STATUS_TINT: Record<SampleStatus, string> = {
  received: 'border-t-status-received',
  in_progress: 'border-t-status-in-progress',
  qc_review: 'border-t-status-qc-review',
  completed: 'border-t-status-completed',
  rejected: 'border-t-status-rejected',
};

const STATUS_BADGE: Record<SampleStatus, string> = {
  received: 'text-status-received bg-status-received-bg',
  in_progress: 'text-status-in-progress bg-status-in-progress-bg',
  qc_review: 'text-status-qc-review bg-status-qc-review-bg',
  completed: 'text-status-completed bg-status-completed-bg',
  rejected: 'text-status-rejected bg-status-rejected-bg',
};

export function KanbanColumn({ status, samples, onCardClick }: KanbanColumnProps) {
  return (
    <section className={`flex h-full w-[276px] min-w-[276px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/[0.07] border-t-2 bg-surface-900/75 sm:w-[292px] sm:min-w-[292px] ${STATUS_TINT[status]}`} aria-label={`${STATUS_LABELS[status]} samples`}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`h-2 w-2 shrink-0 rounded-full shadow-[0_0_10px_currentColor] ${STATUS_DOT[status]}`} />
          <h3 className="truncate text-[13px] font-semibold text-surface-100">{STATUS_LABELS[status]}</h3>
        </div>
        <span className={`ml-2 rounded-md px-2 py-1 font-mono text-[11px] font-semibold tabular-nums ${STATUS_BADGE[status]}`}>{samples.length}</span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-2.5 transition-colors duration-150 sm:p-3 ${snapshot.isDraggingOver ? 'bg-primary-500/[0.06] shadow-[inset_0_0_0_1px_rgba(45,91,255,0.18)]' : ''}`}
            style={{ minHeight: '150px' }}
          >
            {samples.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-surface-700/60 px-3 text-center text-[11px] text-surface-500">No samples in this stage</div>
            )}
            {snapshot.isDraggingOver && samples.length === 0 && (
              <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-primary-400/40 px-3 text-center text-[11px] font-medium text-primary-300">Drop sample here</div>
            )}
            {samples.map((sample, index) => (
              <motion.div
                key={sample._id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: index * 0.035 }}
              >
                <SampleCard sample={sample} index={index} onClick={() => onCardClick(sample)} />
              </motion.div>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  );
}
