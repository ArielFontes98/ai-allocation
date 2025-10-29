import type { MatchScore } from '../types';
import { Badge } from './Badge';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

interface MatchExplainProps {
  match: MatchScore;
  className?: string;
}

export function MatchExplain({ match, className = '' }: MatchExplainProps) {
  if (!match.passed_constraints) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-2xl p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <h4 className="font-semibold text-red-900">Constraints Not Met</h4>
        </div>
        <ul className="space-y-1">
          {match.constraint_violations?.map((violation, idx) => (
            <li key={idx} className="text-sm text-red-700">
              • {violation}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-gray-900">Match Score: {match.total_score}/100</h4>
        </div>
        <Badge variant="success" size="lg">
          {match.total_score}%
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-600 mb-1">Leveling</div>
          <div className="text-lg font-semibold text-gray-900">{match.breakdown.leveling} pts</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-600 mb-1">Function Skills</div>
          <div className="text-lg font-semibold text-gray-900">{match.breakdown.function_skills} pts</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-600 mb-1">Tools</div>
          <div className="text-lg font-semibold text-gray-900">{match.breakdown.tools} pts</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-600 mb-1">Background Fit</div>
          <div className="text-lg font-semibold text-gray-900">{match.breakdown.background_fit} pts</div>
        </div>
      </div>

      {match.evidence.length > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Key Evidence</span>
          </div>
          <ul className="space-y-1">
            {match.evidence.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-600">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

