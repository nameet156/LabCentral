import { DragDropContext, DropResult } from '@hello-pangea/dnd';
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

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as SampleStatus;
    const sample = samples.find(s => s._id === draggableId);
    
    if (sample) {
      await onStatusChange(sample._id, newStatus, sample.__v);
    }
  };

  const getSamplesByStatus = (status: SampleStatus) => {
    return samples.filter(sample => sample.status === status);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[500px]">
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
