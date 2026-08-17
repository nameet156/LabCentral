import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import type { Sample, SampleType, SampleStatus } from '@/api/samples.api';

interface SampleCardProps {
  sample: Sample;
  index: number;
  onClick: () => void;
}

const TYPE_COLORS: Record<SampleType, string> = {
  water: 'text-blue-400 bg-blue-400/10',
  food: 'text-amber-400 bg-amber-400/10',
  soil: 'text-emerald-400 bg-emerald-400/10'
};

const STATUS_BORDER: Record<SampleStatus, string> = {
  received: 'border-l-status-received',
  in_progress: 'border-l-status-in-progress',
  qc_review: 'border-l-status-qc-review',
  completed: 'border-l-status-completed',
  rejected: 'border-l-status-rejected'
};

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}

export function SampleCard({ sample, index, onClick }: SampleCardProps) {
  return (
    <Draggable draggableId={sample._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          onClick={onClick}
          className="mb-3 cursor-pointer outline-none"
        >
          <motion.div
            layout
            className={`glass-card p-4 rounded-xl border-l-[4px] bg-surface-900 border-surface-800 transition-all duration-200 
              ${STATUS_BORDER[sample.status]} 
              ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary-500/50 scale-[1.02]' : 'hover:scale-[1.02] hover:shadow-lg'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono font-bold text-surface-50 text-sm">
                {sample.sampleCode}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[sample.type]}`}>
                {sample.type.charAt(0).toUpperCase() + sample.type.slice(1)}
              </span>
            </div>
            
            <div className="flex justify-between items-end mt-4">
              <div className="flex flex-col">
                <span className="text-xs text-surface-400">Assigned to</span>
                <span className="text-sm font-medium text-surface-200">
                  {sample.assignedTo?.name || 'Unassigned'}
                </span>
              </div>
              <span className="text-xs text-surface-500">
                {getRelativeTime(sample.createdAt)}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}
