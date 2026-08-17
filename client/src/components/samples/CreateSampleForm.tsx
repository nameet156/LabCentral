import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Droplets, Leaf, Wheat } from 'lucide-react';
import { samplesApi, type SampleType } from '@/api/samples.api';

interface CreateSampleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const SAMPLE_TYPES: { value: SampleType; label: string; icon: typeof Droplets; color: string }[] = [
  { value: 'water', label: 'Water', icon: Droplets, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  { value: 'food', label: 'Food', icon: Wheat, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  { value: 'soil', label: 'Soil', icon: Leaf, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
];

export function CreateSampleForm({ isOpen, onClose, onCreated }: CreateSampleFormProps) {
  const [type, setType] = useState<SampleType>('water');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await samplesApi.create({
        type,
        notes: notes.trim() || undefined,
      });
      onCreated();
      onClose();
      setType('water');
      setNotes('');
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-surface-950 border-l border-surface-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-surface-800">
              <div>
                <h2 className="text-xl font-heading font-semibold text-surface-50">New Sample</h2>
                <p className="text-sm text-surface-400 mt-0.5">Register a new sample for analysis</p>
              </div>
              <button
                onClick={onClose}
                className="text-surface-400 hover:text-surface-100 transition-colors p-2 rounded-lg hover:bg-surface-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="create-sample-form" onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-surface-300">
                    Sample Type *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {SAMPLE_TYPES.map((st) => {
                      const Icon = st.icon;
                      const isSelected = type === st.value;
                      return (
                        <button
                          key={st.value}
                          type="button"
                          onClick={() => setType(st.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? `${st.color} border-current scale-[1.02]`
                              : 'border-surface-700 bg-surface-900/50 text-surface-400 hover:border-surface-600 hover:bg-surface-800/50'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-sm font-medium">{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-300">
                    Initial Notes
                    <span className="text-surface-500 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add initial observations, conditions, or instructions..."
                    rows={4}
                    maxLength={1000}
                    className="w-full bg-surface-900 border border-surface-700 text-surface-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder:text-surface-500"
                  />
                  <p className="text-xs text-surface-500 text-right">{notes.length}/1000</p>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-surface-800 bg-surface-900/50">
              <button
                type="submit"
                form="create-sample-form"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Sample'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
