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
  rejected: 'bg-status-rejected'
};

export function KanbanColumn({ status, samples, onCardClick }: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-[320px] min-w-[320px] h-full bg-surface-950/50 rounded-2xl border border-surface-800 flex-shrink-0">
      <div className="p-4 border-b border-surface-800 flex items-center justify-between bg-surface-900/50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
          <h3 className="font-heading font-semibold text-surface-100">
            {STATUS_LABELS[status]}
          </h3>
        </div>
        <span className="bg-surface-800 text-surface-300 text-xs py-1 px-2.5 rounded-full font-medium">
          {samples.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 overflow-y-auto custom-scrollbar transition-colors ${
              snapshot.isDraggingOver ? 'bg-surface-800/20' : ''
            }`}
            style={{ minHeight: '150px' }}
          >
            {samples.map((sample, index) => (
              <motion.div
                key={sample._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SampleCard
                  sample={sample}
                  index={index}
                  onClick={() => onCardClick(sample)}
                />
              </motion.div>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
