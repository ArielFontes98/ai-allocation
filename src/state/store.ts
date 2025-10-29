import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Candidate, Role, Interview, PipelineEntry, MatchScore, Batch, Reservation } from '../types';

interface AppState {
  // Data
  candidates: Candidate[];
  roles: Role[];
  interviews: Interview[];
  pipeline: PipelineEntry[];
  
  // Matches
  matches: MatchScore[];
  
  // Batches
  batches: Batch[];
  currentBatch?: Batch;
  
  // Reservations
  reservations: Reservation[];
  
  // Filters
  filters: {
    country?: string;
    function?: string;
    level?: string;
    language?: string;
    tools?: string;
    staleInPipe?: number;
    oldRole?: number;
  };
  
  // UI state
  currentScreen: 'ta-allocation' | 'confirm-roles' | 'role-intake' | 'ta-review' | 'manager-approvals';
  selectedView: 'by-role' | 'by-candidate';
  pendingRoleIntake?: Partial<Role>;
  
  // Actions
  setCandidates: (candidates: Candidate[]) => void;
  setRoles: (roles: Role[]) => void;
  setInterviews: (interviews: Interview[]) => void;
  setPipeline: (pipeline: PipelineEntry[]) => void;
  setMatches: (matches: MatchScore[]) => void;
  addRole: (role: Role) => void;
  updateRole: (roleId: string, updates: Partial<Role>) => void;
  createBatch: (matches: MatchScore[]) => Batch;
  sendBatch: (batchId: string) => void;
  addReservation: (reservation: Reservation) => void;
  removeReservation: (candidateId: string, roleId: string) => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
  setCurrentScreen: (screen: AppState['currentScreen']) => void;
  setSelectedView: (view: AppState['selectedView']) => void;
  setPendingRoleIntake: (role: Partial<Role>) => void;
  clearPendingRoleIntake: () => void;
  selectCandidate: (candidateId: string, roleId: string) => boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      candidates: [],
      roles: [],
      interviews: [],
      pipeline: [],
      matches: [],
      batches: [],
      currentBatch: undefined,
      reservations: [],
      filters: {},
      currentScreen: 'ta-allocation',
      selectedView: 'by-role',
      
      setCandidates: (candidates) => set({ candidates }),
      setRoles: (roles) => set({ roles }),
      setInterviews: (interviews) => set({ interviews }),
      setPipeline: (pipeline) => set({ pipeline }),
      setMatches: (matches) => set({ matches }),
      
      addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
      
      updateRole: (roleId, updates) =>
        set((state) => ({
          roles: state.roles.map((r) => (r.id === roleId ? { ...r, ...updates } : r)),
        })),
      
      createBatch: (matches) => {
        const batch: Batch = {
          id: `batch_${Date.now()}`,
          created_at: new Date().toISOString(),
          matches,
        };
        set((state) => ({
          batches: [...state.batches, batch],
          currentBatch: batch,
        }));
        return batch;
      },
      
      sendBatch: (batchId) =>
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId ? { ...b, sent_at: new Date().toISOString() } : b
          ),
          currentScreen: 'manager-approvals',
        })),
      
      addReservation: (reservation) =>
        set((state) => ({
          reservations: [...state.reservations, reservation],
        })),
      
      removeReservation: (candidateId, roleId) =>
        set((state) => ({
          reservations: state.reservations.filter(
            (r) => !(r.candidate_id === candidateId && r.role_id === roleId)
          ),
        })),
      
      setFilters: (newFilters) =>
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      setSelectedView: (view) => set({ selectedView: view }),
      setPendingRoleIntake: (role) => set({ pendingRoleIntake: role }),
      clearPendingRoleIntake: () => set({ pendingRoleIntake: undefined }),
      
      selectCandidate: (candidateId, roleId) => {
        const state = get();
        
        // Check for conflicts
        const conflict = state.reservations.find(
          (r) => r.candidate_id === candidateId && r.role_id !== roleId
        );
        
        if (conflict) {
          // Conflict exists - could show modal here
          return false;
        }
        
        // Add reservation
        const reservation: Reservation = {
          candidate_id: candidateId,
          role_id: roleId,
          reserved_at: new Date().toISOString(),
          reserved_by: 'manager', // In real app, get from auth
        };
        
        state.addReservation(reservation);
        
        // Remove candidate from other role matches in current batch
        if (state.currentBatch) {
          const updatedMatches = state.currentBatch.matches.filter(
            (m) => !(m.candidate_id === candidateId && m.role_id !== roleId)
          );
          state.setMatches(updatedMatches);
        }
        
        return true;
      },
    }),
    {
      name: 'ai-allocation-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        candidates: state.candidates,
        roles: state.roles,
        interviews: state.interviews,
        pipeline: state.pipeline,
        batches: state.batches,
        currentBatch: state.currentBatch,
        reservations: state.reservations,
      }),
    }
  )
);

