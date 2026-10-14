import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import type { Sample, SampleStatus } from '@/api/samples.api';

interface KanbanBoardProps {
  samples: Sample[];
  onStatusChange: (sampleId: string, newStatus: SampleStatus, version: number) => Promise<void>;
  onCardClick: (sample: Sample) => void;
}

const STATUSES: SampleStatus[] = ['received', 'in_progress', 'qc_review', 'completed', 'rejected'];

export function KanbanBoard({ samples, onStatusChange, onCardClick }: KanbanBoardProps) {
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as SampleStatus;
    const sample = samples.find(s => s._id === draggableId);
    if (sample) await onStatusChange(sample._id, newStatus, sample.__v);
  };

  const getSamplesByStatus = (status: SampleStatus) => samples.filter(sample => sample.status === status);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-full min-h-[490px] gap-3 overflow-x-auto overscroll-x-contain pb-2 sm:gap-4">
        {STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            samples={getSamplesByStatus(status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
