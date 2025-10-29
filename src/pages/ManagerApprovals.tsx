import { useState, useMemo } from 'react';
import { useStore } from '../state/store';
import { RoleCard } from '../components/RoleCard';
import { CandidateCard } from '../components/CandidateCard';
import { MatchExplain } from '../components/MatchExplain';
import { ConflictModal } from '../components/ConflictModal';
import { RejectModal } from '../components/RejectModal';
import { ApproveModal } from '../components/ApproveModal';
import { addToast } from '../components/Layout';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { addDays } from 'date-fns';
import type { Rejection } from '../types';

export function ManagerApprovals() {
  const roles = useStore((state) => state.roles);
  const candidates = useStore((state) => state.candidates);
  const currentBatch = useStore((state) => state.currentBatch);
  const reservations = useStore((state) => state.reservations);
  const selectCandidate = useStore((state) => state.selectCandidate);

  const [selectedCandidates, setSelectedCandidates] = useState<Map<string, string>>(new Map());
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    candidateName: string;
    conflictingRole: string;
    candidateId: string;
    roleId: string;
  } | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    candidateId: string;
    roleId: string;
    candidateName: string;
    roleTitle: string;
  } | null>(null);
  const [approveModal, setApproveModal] = useState<{
    isOpen: boolean;
    candidateId: string;
    roleId: string;
    candidateName: string;
    roleTitle: string;
  } | null>(null);

  // Get roles in current batch
  const batchRoles = useMemo(() => {
    if (!currentBatch) return [];
    const roleIds = new Set(currentBatch.matches.map((m) => m.role_id));
    return roles.filter((r) => roleIds.has(r.id));
  }, [currentBatch, roles]);

  // Get matches for each role
  const getMatchesForRole = (roleId: string) => {
    if (!currentBatch) return [];
    return currentBatch.matches
      .filter((m) => m.role_id === roleId && m.passed_constraints)
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 3);
  };

  const checkBufferViolation = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const bufferDays = 30;
    const minStartDate = addDays(today, bufferDays);
    return start < minStartDate;
  };


  const handleResolveConflict = () => {
    if (!conflictModal) return;
    // In production, this would call an API to resolve the conflict
    // For demo, we'll just proceed
    const success = selectCandidate(conflictModal.candidateId, conflictModal.roleId);
    if (success) {
      setSelectedCandidates((prev) => {
        const newMap = new Map(prev);
        newMap.set(conflictModal.roleId, conflictModal.candidateId);
        return newMap;
      });
      addToast('Candidate selected (conflict overridden in demo)', 'warning');
    }
    setConflictModal(null);
  };

  const handleRejectClick = (candidateId: string, roleId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    const role = roles.find((r) => r.id === roleId);
    setRejectModal({
      isOpen: true,
      candidateId,
      roleId,
      candidateName: candidate?.name || 'Unknown',
      roleTitle: role?.title || 'Unknown Role',
    });
  };

  const handleReject = (reason: string) => {
    if (!rejectModal) return;

    const rejection: Rejection = {
      candidate_id: rejectModal.candidateId,
      role_id: rejectModal.roleId,
      reason,
      rejected_at: new Date().toISOString(),
      rejected_by: 'manager', // In real app, get from auth
    };

    setRejections((prev) => [...prev, rejection]);
    addToast('Candidate rejected. Feedback tracked for analytics.', 'success');
    setRejectModal(null);
  };

  const handleApproveClick = (candidateId: string, roleId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    const role = roles.find((r) => r.id === roleId);
    setApproveModal({
      isOpen: true,
      candidateId,
      roleId,
      candidateName: candidate?.name || 'Unknown',
      roleTitle: role?.title || 'Unknown Role',
    });
  };

  const handleApprove = (comment: string, rating: number) => {
    if (!approveModal) return;

    // Check for conflicts first
    const conflict = reservations.find(
      (r) => r.candidate_id === approveModal.candidateId && r.role_id !== approveModal.roleId
    );

    if (conflict) {
      const candidate = candidates.find((c) => c.id === approveModal.candidateId);
      const conflictingRole = roles.find((r) => r.id === conflict.role_id);
      setConflictModal({
        isOpen: true,
        candidateName: candidate?.name || 'Unknown',
        conflictingRole: conflictingRole?.title || 'Unknown Role',
        candidateId: approveModal.candidateId,
        roleId: approveModal.roleId,
      });
      setApproveModal(null);
      return;
    }

    // Check if candidate is already selected for this role (deselction)
    if (selectedCandidates.get(approveModal.roleId) === approveModal.candidateId) {
      setSelectedCandidates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(approveModal.roleId);
        return newMap;
      });
      addToast('Selection cleared', 'info');
      setApproveModal(null);
      return;
    }

    // Approve the candidate
    const success = selectCandidate(approveModal.candidateId, approveModal.roleId);
    if (success) {
      setSelectedCandidates((prev) => {
        const newMap = new Map(prev);
        newMap.set(approveModal.roleId, approveModal.candidateId);
        return newMap;
      });
      
      // Store approval feedback for model improvement
      const approvalFeedback = {
        candidate_id: approveModal.candidateId,
        role_id: approveModal.roleId,
        rating,
        comment,
        approved_at: new Date().toISOString(),
        approved_by: 'manager',
      };
      
      // In production, this would be sent to backend
      console.log('Approval feedback:', approvalFeedback);
      
      addToast(`Candidate approved with rating ${rating}/5. Feedback saved for model improvement.`, 'success');
    } else {
      addToast('Failed to approve candidate', 'error');
    }
    setApproveModal(null);
  };

  if (!currentBatch || batchRoles.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Batch Available</h3>
        <p className="text-gray-600 mb-4">
          Please generate and send a batch from the TA Review screen first.
        </p>
        <button
          onClick={() => useStore.getState().setCurrentScreen('ta-review')}
          className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
        >
          Go to TA Review
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Manager Approvals</h2>
        <p className="text-gray-600">
          Review recommended candidates and select the best fit for each role.
        </p>
      </div>

      <div className="space-y-6">
        {batchRoles.map((role) => {
          const matches = getMatchesForRole(role.id);
          const selectedCandidateId = selectedCandidates.get(role.id);
          const bufferViolation = checkBufferViolation(role.start_preference);

          return (
            <div key={role.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="mb-6">
                <RoleCard role={role} showAge />
                {bufferViolation && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Warning: Start date is less than 30 days from today. Offer-to-start buffer may be violated.
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recommended Candidates (Top 3)
                </h3>
                <div className="space-y-4">
                  {matches.length === 0 ? (
                    <p className="text-gray-500">No matches found for this role</p>
                  ) : (
                    matches.map((match) => {
                      const candidate = candidates.find((c) => c.id === match.candidate_id);
                      if (!candidate) return null;
                      
                      const isSelected = selectedCandidateId === candidate.id;
                      const candidateReservation = reservations.find(
                        (r) => r.candidate_id === candidate.id && r.role_id === role.id
                      );

                      return (
                        <div
                          key={match.candidate_id}
                          className={`border-2 rounded-2xl p-4 ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <CandidateCard candidate={candidate} />
                            <MatchExplain match={match} />
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle2 className="w-5 h-5" />
                                  <span className="font-medium">Selected</span>
                                </div>
                              )}
                              {rejections.find(r => r.candidate_id === candidate.id && r.role_id === role.id) && (
                                <div className="flex items-center gap-2 text-red-600">
                                  <XCircle className="w-5 h-5" />
                                  <span className="font-medium">Rejected</span>
                                </div>
                              )}
                              {candidateReservation && !isSelected && (
                                <div className="text-sm text-gray-600">
                                  Reserved since {new Date(candidateReservation.reserved_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRejectClick(candidate.id, role.id)}
                                className="px-4 py-2 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                              <button
                                onClick={() => handleApproveClick(candidate.id, role.id)}
                                className={`px-6 py-2 rounded-xl font-semibold transition-colors shadow-md ${
                                  isSelected
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-white text-primary border-2 border-primary hover:bg-purple-50 hover:text-primary'
                                }`}
                              >
                                {isSelected ? 'Deselect' : 'Approve'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {conflictModal && (
        <ConflictModal
          isOpen={conflictModal.isOpen}
          candidateName={conflictModal.candidateName}
          conflictingRole={conflictModal.conflictingRole}
          onResolve={handleResolveConflict}
          onCancel={() => setConflictModal(null)}
        />
      )}

      {rejectModal && (
        <RejectModal
          isOpen={rejectModal.isOpen}
          candidateName={rejectModal.candidateName}
          roleTitle={rejectModal.roleTitle}
          onReject={handleReject}
          onCancel={() => setRejectModal(null)}
        />
      )}

      {approveModal && (
        <ApproveModal
          isOpen={approveModal.isOpen}
          candidateName={approveModal.candidateName}
          roleTitle={approveModal.roleTitle}
          onApprove={handleApprove}
          onCancel={() => setApproveModal(null)}
        />
      )}
    </div>
  );
}

