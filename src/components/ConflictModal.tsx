import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  candidateName: string;
  conflictingRole: string;
  onResolve: () => void;
  onCancel: () => void;
}

export function ConflictModal({
  isOpen,
  candidateName,
  conflictingRole,
  onResolve,
  onCancel,
}: ConflictModalProps) {
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
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Reservation Conflict
                  </h3>
                  <p className="text-sm text-gray-600">
                    <strong>{candidateName}</strong> has already been reserved for{' '}
                    <strong>{conflictingRole}</strong>.
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

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700">
                  In a production system, this would trigger a workflow where:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                  <li>Both managers are notified</li>
                  <li>The reservation TTL is enforced</li>
                  <li>A priority queue handles conflict resolution</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onResolve}
                  className="flex-1 bg-primary text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors"
                >
                  Override (Demo)
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

