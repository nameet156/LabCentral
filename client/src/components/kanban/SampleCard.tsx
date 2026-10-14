import { Draggable } from '@hello-pangea/dnd';
import { Clock3, UserRound } from 'lucide-react';
import type { Sample, SampleType, SampleStatus } from '@/api/samples.api';
import { SpotlightCard } from '@/components/ui/primitives';

interface SampleCardProps {
  sample: Sample;
  index: number;
  onClick: () => void;
}

const TYPE_COLORS: Record<SampleType, string> = {
  water: 'type-water',
  food: 'type-food',
  soil: 'type-soil',
};

const STATUS_BORDER: Record<SampleStatus, string> = {
  received: 'border-l-status-received',
  in_progress: 'border-l-status-in-progress',
  qc_review: 'border-l-status-qc-review',
  completed: 'border-l-status-completed',
  rejected: 'border-l-status-rejected',
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
          className="mb-2.5 cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <SpotlightCard
            disabled={snapshot.isDragging}
            className={`group relative overflow-hidden rounded-xl border border-white/[0.08] border-l-[3px] bg-surface-900 p-3.5 shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-shadow duration-150 ${STATUS_BORDER[sample.status]} ${snapshot.isDragging ? 'z-50 border-primary-300/50 shadow-[0_16px_36px_rgba(0,0,0,0.3)] ring-2 ring-primary-400/30' : 'hover:border-primary-300/25 hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)] hover:shadow-primary-500/[0.06]'}`}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="font-mono text-[13px] font-semibold tracking-wide text-surface-50 tabular-nums">{sample.sampleCode}</span>
              <span className={`inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${TYPE_COLORS[sample.type]}`}>
                {sample.type}
              </span>
            </div>
            <div className="flex items-end justify-between gap-3 border-t border-white/[0.06] pt-2.5">
              <div className="min-w-0">
                <span className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-surface-500"><UserRound className="h-3 w-3" />Assigned to</span>
                <span className="block max-w-[170px] truncate text-xs font-medium text-surface-200">{sample.assignedTo?.name || 'Unassigned'}</span>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-[10px] text-surface-500"><Clock3 className="h-3 w-3" />{getRelativeTime(sample.createdAt)}</span>
            </div>
          </SpotlightCard>
        </div>
      )}
    </Draggable>
  );
}
