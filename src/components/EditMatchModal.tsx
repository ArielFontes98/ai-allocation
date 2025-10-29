import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import type { MatchScore } from '../types';

interface EditMatchModalProps {
  isOpen: boolean;
  match: MatchScore | null;
  onClose: () => void;
  onSave: (match: MatchScore) => void;
}

export function EditMatchModal({ isOpen, match, onClose, onSave }: EditMatchModalProps) {
  const [editedMatch, setEditedMatch] = useState<MatchScore | null>(null);

  if (!match || !isOpen) return null;

  const currentMatch = editedMatch || match;

  const handleChange = (field: keyof MatchScore['breakdown'], value: number) => {
    if (!currentMatch) return;
    
    const updatedBreakdown = {
      ...currentMatch.breakdown,
      [field]: value,
    };
    
    const totalScore = Object.values(updatedBreakdown).reduce((sum, val) => sum + val, 0);
    
    setEditedMatch({
      ...currentMatch,
      breakdown: updatedBreakdown,
      total_score: totalScore,
    });
  };

  const handleSave = () => {
    if (editedMatch) {
      onSave(editedMatch);
      setEditedMatch(null);
      onClose();
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
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Edit Match Score</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Current Total Score</div>
                  <div className="text-3xl font-bold text-primary">{currentMatch.total_score}%</div>
                </div>

                <div className="space-y-3">
                  {Object.entries(currentMatch.breakdown).map(([key, value]) => (
                    <div key={key} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, ' ')}
                        </label>
                        <span className="text-sm font-semibold text-gray-900">{value} pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => handleChange(key as keyof MatchScore['breakdown'], parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}



