import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

interface ApproveModalProps {
  isOpen: boolean;
  candidateName: string;
  roleTitle: string;
  onApprove: (comment: string, rating: number) => void;
  onCancel: () => void;
}

export function ApproveModal({
  isOpen,
  candidateName,
  roleTitle,
  onApprove,
  onCancel,
}: ApproveModalProps) {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  const handleApprove = () => {
    onApprove(comment.trim(), rating);
    setComment('');
    setRating(5);
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
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Approve Candidate
                  </h3>
                  <p className="text-sm text-gray-600">
                    <strong>{candidateName}</strong> for <strong>{roleTitle}</strong>
                  </p>
                </div>
                <button
                  onClick={onCancel}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                        star <= rating
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment / Notes (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ex: Excellent cultural fit, strong technical skills, recommended for immediate offer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={4}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your feedback helps improve the matching model.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  className="flex-1 bg-white text-gray-900 border-2 border-gray-900 px-4 py-2.5 rounded-xl font-semibold hover:bg-purple-100 hover:border-primary transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Candidate
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
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



