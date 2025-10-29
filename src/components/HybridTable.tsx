import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { MatchScore, Candidate, Role, PipelineEntry } from '../types';
import { Badge } from './Badge';
import { MatchExplain } from './MatchExplain';
import { CandidateCard } from './CandidateCard';
import { RoleCard } from './RoleCard';

interface HybridTableProps {
  items: Role[] | Candidate[];
  matches: MatchScore[];
  candidates: Candidate[];
  roles: Role[];
  pipeline: PipelineEntry[];
  view: 'by-role' | 'by-candidate';
  onRemoveMatch?: (match: MatchScore) => void;
  onAddMatch?: (itemId: string) => void;
}

export function HybridTable({
  items,
  matches,
  candidates,
  roles,
  pipeline,
  view,
  onRemoveMatch,
  onAddMatch,
}: HybridTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 60) return 'text-primary bg-purple-50 border-primary/30';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getTimeInPipeColor = (days: number) => {
    if (days >= 60) return 'text-red-700 bg-red-50';
    if (days >= 30) return 'text-yellow-700 bg-yellow-50';
    return 'text-green-700 bg-green-50';
  };

  const getMatchesForItem = (itemId: string) => {
    if (view === 'by-role') {
      return matches
        .filter((m) => m.role_id === itemId && m.passed_constraints)
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, 3);
    } else {
      return matches
        .filter((m) => m.candidate_id === itemId && m.passed_constraints)
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, 3);
    }
  };

  const getTimeInPipe = (itemId: string) => {
    if (view === 'by-role') {
      const role = items.find((r) => 'id' in r && r.id === itemId) as Role | undefined;
      return role?.age_days || 0;
    } else {
      const pipe = pipeline.find((p) => p.candidate_id === itemId);
      return pipe?.time_in_pipe_days || 0;
    }
  };

  const getType = (item: Role | Candidate) => {
    if (view === 'by-role') {
      const role = item as Role;
      if (role.internal_first_strategy === 'internal_only') return 'Internal Only';
      if (role.internal_first_strategy === 'internal_first') return 'Internal First';
      return 'Both';
    } else {
      const candidate = item as Candidate;
      return candidate.type === 'internal' ? 'Internal' : 'External';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                {view === 'by-role' ? 'Role' : 'Candidate'}
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Time in Pipe
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                {view === 'by-role' ? 'Top 3 Candidates' : 'Top 3 Roles'}
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const itemId = 'id' in item ? item.id : '';
              const itemMatches = getMatchesForItem(itemId);
              const timeInPipe = getTimeInPipe(itemId);
              const isExpanded = expandedRows.has(itemId);
              const type = getType(item);

              return (
                <>
                  <motion.tr
                    key={itemId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">
                        {view === 'by-role' ? (item as Role).title : (item as Candidate).name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {view === 'by-role'
                          ? `${(item as Role).function} • ${(item as Role).country}`
                          : `${(item as Candidate).country} • ${(item as Candidate).experience_years_total} years`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full font-semibold text-sm ${getTimeInPipeColor(timeInPipe)}`}>
                        {timeInPipe}d
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={type.includes('Internal') ? 'success' : type === 'Both' ? 'info' : 'default'}
                        size="sm"
                      >
                        {type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {itemMatches.map((match, index) => {
                          const candidate = candidates.find((c) => c.id === match.candidate_id);
                          const role = roles.find((r) => r.id === match.role_id);
                          
                          if (view === 'by-role' && !candidate) return null;
                          if (view === 'by-candidate' && !role) return null;

                          return (
                            <div
                              key={`${match.candidate_id || match.role_id}-${match.role_id || match.candidate_id}`}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 font-semibold ${getScoreColor(match.total_score)}`}
                            >
                              <span className="text-xs font-bold">#{index + 1}</span>
                              <span className="text-sm truncate max-w-[120px]">
                                {view === 'by-role' ? candidate?.name : role?.title}
                              </span>
                              <span className="text-base font-bold">{match.total_score}%</span>
                            </div>
                          );
                        })}
                        {itemMatches.length === 0 && (
                          <span className="text-sm text-gray-400 italic">No matches</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleRow(itemId)}
                        className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </td>
                  </motion.tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <motion.tr
                      key={`${itemId}-details`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-primary/5"
                    >
                      <td colSpan={5} className="px-6 py-6">
                        <div className="space-y-4">
                          {/* Item Details */}
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            {view === 'by-role' ? (
                              <RoleCard role={item as Role} showAge />
                            ) : (
                              <CandidateCard candidate={item as Candidate} showTimeInPipe={timeInPipe} />
                            )}
                          </div>

                          {/* Top 3 Matches with Full Details */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {view === 'by-role' ? 'Top 3 Candidate Matches' : 'Top 3 Role Matches'}
                              </h4>
                              {onAddMatch && (
                                <button
                                  onClick={() => onAddMatch(itemId)}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-md"
                                >
                                  <Plus className="w-5 h-5" />
                                  Add {view === 'by-role' ? 'Candidate' : 'Role'}
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                              {itemMatches.map((match, index) => {
                                const candidate = candidates.find((c) => c.id === match.candidate_id);
                                const role = roles.find((r) => r.id === match.role_id);
                                
                                if (!candidate || !role) return null;

                                return (
                                  <div
                                    key={`${match.candidate_id}-${match.role_id}`}
                                    className="bg-white border-2 border-gray-200 rounded-xl p-4"
                                  >
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full font-bold ${getScoreColor(match.total_score)}`}>
                                          Top {index + 1}: {match.total_score}%
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        {onRemoveMatch && (
                                          <button
                                            onClick={() => onRemoveMatch(match)}
                                            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-semibold hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-2"
                                            title="Remove from top 3"
                                          >
                                            <X className="w-4 h-4" />
                                            Remove
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      {view === 'by-role' ? (
                                        <>
                                          <CandidateCard
                                            candidate={candidate}
                                            showTimeInPipe={pipeline.find((p) => p.candidate_id === candidate.id)?.time_in_pipe_days}
                                          />
                                          <MatchExplain match={match} />
                                        </>
                                      ) : (
                                        <>
                                          <RoleCard role={role} />
                                          <MatchExplain match={match} />
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
