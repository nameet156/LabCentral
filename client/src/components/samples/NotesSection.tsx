import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Note, samplesApi } from '@/api/samples.api';
import { Send } from 'lucide-react';

interface NotesSectionProps {
  notes: Note[];
  sampleId: string;
  onNoteAdded: () => void;
  canEdit: boolean;
}

export function NotesSection({ notes, sampleId, onNoteAdded, canEdit }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="glass-card rounded-xl flex flex-col h-full max-h-[600px]">
      <div className="p-6 pb-4 border-b border-surface-800">
        <h3 className="text-lg font-semibold text-surface-100">Notes</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {notes.length === 0 ? (
          <div className="text-center text-surface-400 text-sm py-4">No notes added yet.</div>
        ) : (
          notes.map((note, index) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-lg bg-surface-900/50 border-l-2 border-primary-500"
            >
              <p className="text-sm text-surface-200 whitespace-pre-wrap">{note.text}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-surface-500">
                <span className="font-medium text-surface-400">{note.author?.name || 'Unknown'}</span>
                <span>•</span>
                <span>{formatRelativeTime(note.createdAt)}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {canEdit && (
        <div className="p-4 border-t border-surface-800 bg-surface-900/30">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full bg-surface-950 border border-surface-800 rounded-lg p-3 pr-12 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none h-20"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!newNote.trim() || isSubmitting}
              className="absolute right-3 bottom-3 p-1.5 rounded-md text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
