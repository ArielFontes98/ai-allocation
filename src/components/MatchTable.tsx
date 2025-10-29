import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, User, Briefcase } from 'lucide-react';
import type { MatchScore, Candidate, Role, PipelineEntry } from '../types';
import { Badge } from './Badge';
import { MatchExplain } from './MatchExplain';

interface MatchTableProps {
  matches: MatchScore[];
  candidates: Candidate[];
  roles: Role[];
  pipeline: PipelineEntry[];
  view: 'by-role' | 'by-candidate';
  onEditMatch?: (match: MatchScore) => void;
  onSelectCandidate?: (candidateId: string) => void;
  onSelectRole?: (roleId: string) => void;
}

type SortField = 'score' | 'time_in_pipe' | 'name' | 'role';
type SortDirection = 'asc' | 'desc';

export function MatchTable({
  matches,
  candidates,
  roles,
  pipeline,
  view,
  onEditMatch,
  onSelectCandidate,
  onSelectRole,
}: MatchTableProps) {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedMatches = () => {
    const sorted = [...matches];
    
    sorted.sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      if (sortField === 'score') {
        aValue = a.total_score;
        bValue = b.total_score;
      } else if (sortField === 'time_in_pipe') {
        const aPipe = pipeline.find(p => p.candidate_id === a.candidate_id && (p.role_id === a.role_id || !p.role_id));
        const bPipe = pipeline.find(p => p.candidate_id === b.candidate_id && (p.role_id === b.role_id || !p.role_id));
        aValue = aPipe?.time_in_pipe_days || 0;
        bValue = bPipe?.time_in_pipe_days || 0;
      } else if (sortField === 'name') {
        const aCandidate = candidates.find(c => c.id === a.candidate_id);
        const bCandidate = candidates.find(c => c.id === b.candidate_id);
        aValue = aCandidate?.name || '';
        bValue = bCandidate?.name || '';
      } else if (sortField === 'role') {
        const aRole = roles.find(r => r.id === a.role_id);
        const bRole = roles.find(r => r.id === b.role_id);
        aValue = aRole?.title || '';
        bValue = bRole?.title || '';
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return sortDirection === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return sorted;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-primary bg-purple-50';
    return 'text-red-600 bg-red-50';
  };

  const getTimeInPipeColor = (days: number) => {
    if (days >= 60) return 'text-red-600 bg-red-50';
    if (days >= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const sortedMatches = getSortedMatches();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {view === 'by-role' ? 'Candidate' : 'Role'}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('score')}>
                <div className="flex items-center gap-2">
                  Score
                  {sortField === 'score' && (
                    sortDirection === 'desc' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('time_in_pipe')}>
                <div className="flex items-center gap-2">
                  Time in Pipe
                  {sortField === 'time_in_pipe' && (
                    sortDirection === 'desc' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />
                  )}
                </div>
              </th>
              {view === 'by-candidate' && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedMatches.map((match, index) => {
              const candidate = candidates.find(c => c.id === match.candidate_id);
              const role = roles.find(r => r.id === match.role_id);
              const pipe = pipeline.find(p => p.candidate_id === match.candidate_id && (p.role_id === match.role_id || !p.role_id));
              const rowId = `${match.candidate_id}-${match.role_id}-${index}`;
              const isExpanded = expandedRows.has(rowId);
              const timeInPipe = pipe?.time_in_pipe_days || 0;

              if (!candidate || !role) return null;

              return (
                <motion.tr
                  key={rowId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (view === 'by-role' && onSelectCandidate) {
                            onSelectCandidate(candidate.id);
                          } else if (view === 'by-candidate' && onSelectRole) {
                            onSelectRole(role.id);
                          }
                        }}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        {view === 'by-role' ? (
                          <>
                            <User className="w-5 h-5 text-primary" />
                            <div className="text-left">
                              <div className="font-semibold text-gray-900">{candidate.name}</div>
                              <div className="text-sm text-gray-500">{candidate.country}</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <Briefcase className="w-5 h-5 text-primary" />
                            <div className="text-left">
                              <div className="font-semibold text-gray-900">{role.title}</div>
                              <div className="text-sm text-gray-500">{role.country} • {role.function}</div>
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-lg ${getScoreColor(match.total_score)}`}>
                      {match.total_score}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${getTimeInPipeColor(timeInPipe)}`}>
                      {timeInPipe}d
                    </div>
                  </td>
                  {view === 'by-candidate' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={candidate.type === 'internal' ? 'success' : 'default'} size="sm">
                        {candidate.type}
                      </Badge>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRow(rowId)}
                        className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {onEditMatch && (
                        <button
                          onClick={() => onEditMatch(match)}
                          className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit match"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Expanded Match Details */}
      {sortedMatches.map((match) => {
        const rowId = `${match.candidate_id}-${match.role_id}`;
        const isExpanded = expandedRows.has(rowId);
        
        if (!isExpanded) return null;

        const candidate = candidates.find(c => c.id === match.candidate_id);
        const role = roles.find(r => r.id === match.role_id);

        if (!candidate || !role) return null;

        return (
          <motion.tr
            key={`${rowId}-details`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/5"
          >
            <td colSpan={5} className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <MatchExplain match={match} />
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {view === 'by-role' ? 'Candidate Details' : 'Role Details'}
                  </h4>
                  {view === 'by-role' ? (
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Skills:</span> {candidate.skills.slice(0, 5).join(', ')}</div>
                      <div><span className="font-medium">Tools:</span> {candidate.tools.slice(0, 5).join(', ')}</div>
                      <div><span className="font-medium">Experience:</span> {candidate.experience_years_total} years</div>
                      <div><span className="font-medium">Domains:</span> {candidate.experience_domains.join(', ')}</div>
                      {candidate.internal_history && (
                        <div><span className="font-medium">Internal:</span> {candidate.internal_history.last_bu} ({candidate.internal_history.tenure_months} months)</div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Function:</span> {role.function} • {role.subfunction}</div>
                      <div><span className="font-medium">Level:</span> {role.target_levels.join(', ')}</div>
                      <div><span className="font-medium">Must Haves:</span> {role.leveling_must_haves.slice(0, 3).join(', ')}</div>
                      <div><span className="font-medium">Tools:</span> {role.tools_top5.join(', ')}</div>
                      <div><span className="font-medium">Start:</span> {new Date(role.start_preference).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              </div>
            </td>
          </motion.tr>
        );
      })}
    </div>
  );
}

