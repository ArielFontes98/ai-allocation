import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import type { Role } from '../types';
import { RoleCard } from './RoleCard';

interface RoleSelectorModalProps {
  isOpen: boolean;
  candidateId: string;
  availableRoles: Role[];
  currentTop3Ids: string[];
  onSelect: (roleId: string) => void;
  onClose: () => void;
}

export function RoleSelectorModal({
  isOpen,
  candidateId: _candidateId,
  availableRoles,
  currentTop3Ids,
  onSelect,
  onClose,
}: RoleSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = availableRoles.filter((r) => {
    if (currentTop3Ids.includes(r.id)) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(term) ||
      r.function.toLowerCase().includes(term) ||
      r.country.toLowerCase().includes(term)
    );
  });

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
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Select Role</h3>
                  <p className="text-lg text-gray-600">Add role to candidate's top 3 matches</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, function, country..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No roles found</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filtered.map((role) => (
                      <div
                        key={role.id}
                        className="border-2 border-gray-200 rounded-xl p-4 hover:border-primary transition-colors cursor-pointer"
                        onClick={() => {
                          onSelect(role.id);
                          onClose();
                        }}
                      >
                        <RoleCard role={role} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

