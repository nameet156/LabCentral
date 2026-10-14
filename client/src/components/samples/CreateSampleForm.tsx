import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Droplets, Leaf, Loader2, UserCheck, Wheat, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { samplesApi, type SampleType } from '@/api/samples.api';
import { usersApi } from '@/api/users.api';
import type { User } from '@/api/auth.api';
import { Button } from '@/components/ui/primitives';

interface CreateSampleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const SAMPLE_TYPES: { value: SampleType; label: string; icon: typeof Droplets; color: string }[] = [
  { value: 'water', label: 'Water', icon: Droplets, color: 'type-water' },
  { value: 'food', label: 'Food', icon: Wheat, color: 'type-food' },
  { value: 'soil', label: 'Soil', icon: Leaf, color: 'type-soil' },
];

export function CreateSampleForm({ isOpen, onClose, onCreated }: CreateSampleFormProps) {
  const { user } = useAuth();
  const [type, setType] = useState<SampleType>('water');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [staffList, setStaffList] = useState<Pick<User, '_id' | 'name' | 'email' | 'role'>[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (user?._id) setAssignedTo(user._id);
      usersApi.listAssignable()
        .then(res => setStaffList(res.data.users))
        .catch(err => console.error('Failed to load assignable staff', err));
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await samplesApi.create({
        type,
        assignedTo: assignedTo || undefined,
        notes: notes.trim() || undefined,
      });
      onCreated();
      onClose();
      setType('water');
      setNotes('');
      if (user?._id) setAssignedTo(user._id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create sample');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close new sample form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-40 cursor-default bg-black/65 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-sample-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-50 flex h-[100dvh] w-full max-w-[440px] flex-col border-l border-white/[0.08] bg-surface-950 shadow-2xl shadow-black/30"
          >
            <div className="relative flex items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-6">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/50 to-cyan-300/30" />
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-300/15 bg-primary-500/10 text-primary-300"><Droplets className="h-5 w-5" /></span>
                <div>
                  <h2 id="create-sample-title" className="font-heading text-lg font-semibold text-surface-50">New sample</h2>
                  <p className="mt-0.5 text-xs text-surface-400">Register a sample for analysis</p>
                </div>
              </div>
              <button type="button" aria-label="Close" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-400 transition hover:bg-surface-800 hover:text-surface-50 focus-visible:ring-2 focus-visible:ring-primary-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
              <form id="create-sample-form" onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-status-rejected/20 bg-status-rejected-bg px-3.5 py-3 text-[13px] text-status-rejected">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-surface-200">Sample type <span className="text-status-rejected">*</span></label>
                    <p className="mt-1 text-xs text-surface-500">Choose the material being analyzed.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {SAMPLE_TYPES.map((sampleType) => {
                      const Icon = sampleType.icon;
                      const isSelected = type === sampleType.value;
                      return (
                        <button
                          key={sampleType.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setType(sampleType.value)}
                          className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border p-3 transition duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 ${isSelected ? `${sampleType.color} shadow-[0_0_20px_rgba(45,91,255,0.08)]` : 'border-white/[0.08] bg-surface-900 text-surface-400 hover:border-surface-600 hover:bg-surface-850'}`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs font-semibold">{sampleType.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label htmlFor="sample-assigned-to" className="flex items-center justify-between text-[13px] font-semibold text-surface-200">
                    <span className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-primary-300" />Assigned to</span>
                    <span className="text-[11px] font-normal text-surface-500">Optional</span>
                  </label>
                  <select id="sample-assigned-to" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="ui-select">
                    {user?._id && <option value={user._id}>Assign to me ({user.name}) — Current User</option>}
                    <option value="">Unassigned (Queue for Triage)</option>
                    {staffList.filter(staff => staff._id !== user?._id).map((staff) => (
                      <option key={staff._id} value={staff._id}>{staff.name} ({staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}) — {staff.email}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2.5">
                  <label htmlFor="sample-initial-notes" className="flex items-center justify-between text-[13px] font-semibold text-surface-200">
                    Initial notes <span className="text-[11px] font-normal text-surface-500">Optional</span>
                  </label>
                  <textarea
                    id="sample-initial-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add observations, conditions, or instructions..."
                    rows={5}
                    maxLength={1000}
                    className="ui-input min-h-32 resize-y leading-5 placeholder:text-surface-500"
                  />
                  <p className="text-right text-[11px] text-surface-500 tabular-nums">{notes.length}/1000</p>
                </div>
              </form>
            </div>

            <div className="border-t border-white/[0.07] bg-surface-900/75 px-5 py-4 sm:px-6">
              <Button type="submit" form="create-sample-form" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Droplets className="h-4 w-4" />Create sample</>}
              </Button>
              <p className="mt-2 text-center text-[10px] text-surface-500">Sample details can be updated from its record.</p>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
