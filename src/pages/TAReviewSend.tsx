import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../state/store';
import { RoleCard } from '../components/RoleCard';
import { CandidateCard } from '../components/CandidateCard';
import { MatchExplain } from '../components/MatchExplain';
import { FiltersBar } from '../components/FiltersBar';
import { addToast } from '../components/Layout';
import { getTopMatchesForRole, getTopMatchesForCandidate } from '../lib/matching';
import { ChevronDown, ChevronUp, Send, Filter, Download } from 'lucide-react';
import type { MatchScore } from '../types';

export function TAReviewSend() {
  const candidates = useStore((state) => state.candidates);
  const roles = useStore((state) => state.roles);
  const interviews = useStore((state) => state.interviews);
  const pipeline = useStore((state) => state.pipeline);
  const selectedView = useStore((state) => state.selectedView);
  const setSelectedView = useStore((state) => state.setSelectedView);
  const setMatches = useStore((state) => state.setMatches);
  const createBatch = useStore((state) => state.createBatch);
  const sendBatch = useStore((state) => state.sendBatch);
  const filters = useStore((state) => state.filters);
  const setFilters = useStore((state) => state.setFilters);

  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [expandedCandidates, setExpandedCandidates] = useState<Set<string>>(new Set());
  const [currentMatches, setCurrentMatches] = useState<MatchScore[]>([]);

  // Compute matches for all roles and candidates
  useEffect(() => {
    const matches: MatchScore[] = [];
    
    if (selectedView === 'by-role') {
      roles.forEach((role) => {
        const topMatches = getTopMatchesForRole(role, candidates, interviews, pipeline, 3);
        matches.push(...topMatches);
      });
    } else {
      candidates.forEach((candidate) => {
        const topMatches = getTopMatchesForCandidate(candidate, roles, interviews, pipeline, 3);
        matches.push(...topMatches);
      });
    }
    
    setCurrentMatches(matches);
  }, [candidates, roles, interviews, pipeline, selectedView]);

  // Apply filters
  const filteredData = useMemo(() => {
    if (selectedView === 'by-role') {
      let filtered: typeof roles = [...roles];

      if (filters.country) {
        filtered = filtered.filter((item) => item.country === filters.country);
      }
      if (filters.function) {
        filtered = filtered.filter((item) => item.function === filters.function);
      }
      if (filters.level) {
        filtered = filtered.filter((item) => item.target_levels.includes(filters.level as string));
      }
      if (filters.language) {
        filtered = filtered.filter((item) => 
          item.languages_required.some((l) => l.code === filters.language)
        );
      }
      if (filters.staleInPipe) {
        filtered = filtered.filter((item) => item.age_days >= filters.staleInPipe!);
      }
      if (filters.oldRole) {
        filtered = filtered.filter((item) => item.age_days >= filters.oldRole!);
      }

      return filtered;
    } else {
      let filtered: typeof candidates = [...candidates];

      if (filters.country) {
        filtered = filtered.filter((item) => item.country === filters.country);
      }
      if (filters.language) {
        filtered = filtered.filter((item) => 
          item.languages.some((l) => l.code === filters.language)
        );
      }
      if (filters.staleInPipe) {
        filtered = filtered.filter((item) => {
          const pipe = pipeline.find((p) => p.candidate_id === item.id);
          return pipe && pipe.time_in_pipe_days >= filters.staleInPipe!;
        });
      }

      return filtered;
    }
  }, [selectedView, roles, candidates, filters, pipeline]);

  const toggleRoleExpand = (roleId: string) => {
    const newSet = new Set(expandedRoles);
    if (newSet.has(roleId)) {
      newSet.delete(roleId);
    } else {
      newSet.add(roleId);
    }
    setExpandedRoles(newSet);
  };

  const toggleCandidateExpand = (candidateId: string) => {
    const newSet = new Set(expandedCandidates);
    if (newSet.has(candidateId)) {
      newSet.delete(candidateId);
    } else {
      newSet.add(candidateId);
    }
    setExpandedCandidates(newSet);
  };

  const getMatchesForRole = (roleId: string) => {
    return currentMatches.filter((m) => m.role_id === roleId && m.passed_constraints).slice(0, 3);
  };

  const getMatchesForCandidate = (candidateId: string) => {
    return currentMatches.filter((m) => m.candidate_id === candidateId && m.passed_constraints).slice(0, 3);
  };

  const handleGenerateBatch = () => {
    const batch = createBatch(currentMatches.filter((m) => m.passed_constraints));
    setMatches(batch.matches);
    addToast(`Generated batch with ${batch.matches.length} matches`, 'success');
  };

  const handleSendBatch = () => {
    const batch = useStore.getState().currentBatch;
    // Se não houver batch, criar um automaticamente com os matches atuais
    if (!batch) {
      if (currentMatches.length === 0) {
        addToast('No matches to send. Please ensure there are matching candidates.', 'error');
        return;
      }
      const newBatch = createBatch(currentMatches.filter((m) => m.passed_constraints));
      sendBatch(newBatch.id);
      addToast('Batch created and sent to managers', 'success');
    } else {
      sendBatch(batch.id);
      addToast('Batch sent to managers', 'success');
    }
  };

  const handleExportCSV = () => {
    // Simple CSV export
    const csv = currentMatches
      .map((m) => {
        const role = roles.find((r) => r.id === m.role_id);
        const candidate = candidates.find((c) => c.id === m.candidate_id);
        return `${role?.title || ''},${candidate?.name || ''},${m.total_score}`;
      })
      .join('\n');
    
    const blob = new Blob(['Role,Candidate,Score\n' + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matches-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('CSV exported successfully', 'success');
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">TA Review & Send</h2>
            <p className="text-gray-600">
              Review AI-generated matches and send recommendations to managers.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedView('by-role')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              selectedView === 'by-role'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Role
          </button>
          <button
            onClick={() => setSelectedView('by-candidate')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              selectedView === 'by-candidate'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Candidate
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={filters.country || ''}
                onChange={(e) => setFilters({ country: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All</option>
                <option value="Brazil">Brazil</option>
                <option value="Mexico">Mexico</option>
                <option value="Colombia">Colombia</option>
                <option value="United States">United States</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Function</label>
              <select
                value={filters.function || ''}
                onChange={(e) => setFilters({ function: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All</option>
                <option value="DS">DS</option>
                <option value="BA">BA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedView === 'by-role' ? 'Stale Role (days)' : 'Stale in Pipe (days)'}
              </label>
              <input
                type="number"
                value={filters.staleInPipe || ''}
                onChange={(e) => setFilters({ staleInPipe: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Min days"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={filters.language || ''}
                onChange={(e) => setFilters({ language: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All</option>
                <option value="en">English</option>
                <option value="pt">Portuguese</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>
          <FiltersBar
            filters={filters}
            onClearFilter={(key) => setFilters({ [key]: undefined })}
            onClearAll={() => setFilters({})}
          />
        </div>

        {/* Batch Actions */}
        <div className="bg-primary/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Weekly Batch Workflow</h3>
            <p className="text-sm text-gray-600">
              Generate and send the week's top matches to managers
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateBatch}
              className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
            >
              Generate This Week's Picks
            </button>
            <button
              onClick={handleSendBatch}
              className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send to Managers
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {selectedView === 'by-role' ? (
        <div className="space-y-4">
          {(filteredData as typeof roles).map((role) => {
            const matches = getMatchesForRole(role.id);
            const isExpanded = expandedRoles.has(role.id);

            return (
              <div key={role.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <RoleCard role={role} showAge />
                    <button
                      onClick={() => toggleRoleExpand(role.id)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 space-y-4">
                    <h4 className="font-semibold text-gray-900">Top 3 Matches</h4>
                    {matches.length === 0 ? (
                      <p className="text-gray-500">No matches found</p>
                    ) : (
                      matches.map((match) => {
                        const candidate = candidates.find((c) => c.id === match.candidate_id);
                        if (!candidate) return null;
                        const pipe = pipeline.find((p) => p.candidate_id === candidate.id);
                        return (
                          <div key={match.candidate_id} className="border border-gray-200 rounded-2xl p-4">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <CandidateCard
                                candidate={candidate}
                                showTimeInPipe={pipe?.time_in_pipe_days}
                              />
                              <MatchExplain match={match} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {(filteredData as typeof candidates).map((candidate) => {
            const matches = getMatchesForCandidate(candidate.id);
            const isExpanded = expandedCandidates.has(candidate.id);
            const pipe = pipeline.find((p) => p.candidate_id === candidate.id);

            return (
              <div key={candidate.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <CandidateCard candidate={candidate} showTimeInPipe={pipe?.time_in_pipe_days} />
                    <button
                      onClick={() => toggleCandidateExpand(candidate.id)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 space-y-4">
                    <h4 className="font-semibold text-gray-900">Top 3 Role Matches</h4>
                    {matches.length === 0 ? (
                      <p className="text-gray-500">No matches found</p>
                    ) : (
                      matches.map((match) => {
                        const role = roles.find((r) => r.id === match.role_id);
                        if (!role) return null;
                        return (
                          <div key={match.role_id} className="border border-gray-200 rounded-2xl p-4">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <RoleCard role={role} />
                              <MatchExplain match={match} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

