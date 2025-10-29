import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { MatchScore, Candidate, Role, PipelineEntry } from '../types';
import { Badge } from './Badge';
import { MatchExplain } from './MatchExplain';
import { CandidateCard } from './CandidateCard';

interface RoleMatchesTableProps {
  role: Role;
  matches: MatchScore[];
  candidates: Candidate[];
  pipeline: PipelineEntry[];
  onEditMatch?: (match: MatchScore) => void;
  onRemoveMatch?: (matchId: string) => void;
  onAddCandidate?: (roleId: string) => void;
}

export function RoleMatchesTable({
  role,
  matches: initialMatches,
  candidates,
  pipeline,
  onEditMatch,
  onRemoveMatch,
  onAddCandidate,
}: RoleMatchesTableProps) {
  const [matches, setMatches] = useState<MatchScore[]>(initialMatches);
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-primary bg-purple-50 border-primary/20';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTimeInPipeColor = (days: number) => {
    if (days >= 60) return 'text-red-600 bg-red-50';
    if (days >= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const handleRemove = (match: MatchScore) => {
    setMatches((prev) => prev.filter((m) => !(m.candidate_id === match.candidate_id && m.role_id === match.role_id)));
    if (onRemoveMatch) {
      onRemoveMatch(`${match.candidate_id}-${match.role_id}`);
    }
  };

  // Get top 3 matches
  const topMatches = matches
    .filter(m => m.passed_constraints)
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 3);

  // Ensure we have exactly 3 slots
  const displayMatches = [...topMatches];
  while (displayMatches.length < 3) {
    displayMatches.push(null as any);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
            <p className="text-sm text-gray-600">{role.function} • {role.country}</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Top 3 Scores Row */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50">
        {displayMatches.map((match, index) => {
          if (!match) {
            return (
              <div key={`empty-${index}`} className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-400 mb-2">Top {index + 1}</p>
                <p className="text-xs text-gray-400">No match</p>
              </div>
            );
          }

          const candidate = candidates.find(c => c.id === match.candidate_id);
          const pipe = pipeline.find(p => p.candidate_id === match.candidate_id && (p.role_id === match.role_id || !p.role_id));
          const timeInPipe = pipe?.time_in_pipe_days || 0;

          if (!candidate) return null;

          return (
            <div
              key={`${match.candidate_id}-${match.role_id}`}
              className={`bg-white border-2 rounded-xl p-4 ${getScoreColor(match.total_score)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase">Top {index + 1}</span>
                {onRemoveMatch && (
                  <button
                    onClick={() => handleRemove(match)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="Remove from top 3"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="text-2xl font-bold mb-1">{match.total_score}%</div>
              <div className="text-xs font-medium mb-2">{candidate.name}</div>
              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTimeInPipeColor(timeInPipe)}`}>
                {timeInPipe}d
              </div>
              <Badge variant={candidate.type === 'internal' ? 'success' : 'default'} size="sm" className="mt-2">
                {candidate.type}
              </Badge>
            </div>
          );
        })}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-gray-200 p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Match Details</h4>
            {onAddCandidate && (
              <button
                onClick={() => onAddCandidate(role.id)}
                className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Candidate
              </button>
            )}
          </div>

          <div className="space-y-4">
            {topMatches.map((match, index) => {
              const candidate = candidates.find(c => c.id === match.candidate_id);
              const pipe = pipeline.find(p => p.candidate_id === match.candidate_id && (p.role_id === match.role_id || !p.role_id));
              
              if (!candidate) return null;

              return (
                <div key={`${match.candidate_id}-${match.role_id}`} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full font-bold ${getScoreColor(match.total_score)}`}>
                        Top {index + 1}: {match.total_score}%
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {onEditMatch && (
                        <button
                          onClick={() => onEditMatch(match)}
                          className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit match score"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onRemoveMatch && (
                        <button
                          onClick={() => handleRemove(match)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from top 3"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <CandidateCard candidate={candidate} showTimeInPipe={pipe?.time_in_pipe_days} />
                    <MatchExplain match={match} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

