import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Note } from '@/api/samples.api';
import { MessageSquareText, Send } from 'lucide-react';
import { Button, Card, SpotlightCard } from '@/components/ui/primitives';
import { samplesApi } from '@/api/samples.api';

interface NotesSectionProps {
  notes: Note[];
  sampleId: string;
  onNoteAdded: () => void;
  canEdit: boolean;
}

export function NotesSection({ notes, sampleId, onNoteAdded, canEdit }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newNote.trim()) return;

    try {
      setIsSubmitting(true);
      await samplesApi.addNote(sampleId, newNote.trim());
      setNewNote('');
      onNoteAdded();
    } catch (error) {
      console.error('Failed to add note', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = (new Date(isoString).getTime() - new Date().getTime()) / 1000;
    if (Math.abs(diff) < 60) return 'Just now';
    if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    return rtf.format(Math.round(diff / 86400), 'day');
  };

  return (
    <Card className="flex h-full max-h-[600px] min-h-[300px] flex-col overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-5">
        <div><h3 className="text-sm font-semibold text-surface-100">Notes</h3><p className="mt-1 text-xs text-surface-500">Observations and team context</p></div>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-300"><MessageSquareText className="h-4 w-4" /></span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        {notes.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center text-center"><span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-surface-800 text-surface-500"><MessageSquareText className="h-4 w-4" /></span><p className="text-xs font-medium text-surface-300">No notes yet</p><p className="mt-1 text-[11px] text-surface-500">Add an observation to keep the team in sync.</p></div>
        ) : (
          notes.map((note, index) => (
            <SpotlightCard key={note._id} className="rounded-xl border border-white/[0.06] bg-surface-850/70 p-3.5">
              <motion.article initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16, delay: Math.min(index * 0.035, 0.24) }}>
                <p className="whitespace-pre-wrap text-xs leading-5 text-surface-200">{note.text}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-2.5 text-[10px] text-surface-500"><span className="font-medium text-surface-400">{note.author?.name || 'Unknown'}</span><span>{formatRelativeTime(note.createdAt)}</span></div>
              </motion.article>
            </SpotlightCard>
          ))
        )}
      </div>

      {canEdit && (
        <div className="border-t border-white/[0.06] bg-surface-850/55 p-3.5 sm:p-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
              placeholder="Add an observation or update..."
              aria-label="Add a note"
              className="ui-input min-h-[76px] flex-1 resize-none py-2.5 leading-5 placeholder:text-surface-500"
              disabled={isSubmitting}
            />
            <Button type="submit" aria-label="Send note" title="Send note" disabled={!newNote.trim() || isSubmitting} className="h-10 w-10 shrink-0 !px-0"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      )}
    </Card>
  );
}
