import { motion } from 'framer-motion';
import type { Candidate } from '../types';
import { Badge } from './Badge';
import { MapPin, Briefcase, Globe, Clock } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
  className?: string;
  showTimeInPipe?: number;
}

export function CandidateCard({
  candidate,
  onClick,
  className = '',
  showTimeInPipe,
}: CandidateCardProps) {
  const isStale = showTimeInPipe ? showTimeInPipe > 60 : false;
  const primaryLanguage = candidate.languages.find(l => l.code === 'en') || candidate.languages[0];
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
            <Badge variant={candidate.type === 'internal' ? 'success' : 'default'} size="sm">
              {candidate.type}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{candidate.country}</span>
            <span className="text-gray-400">•</span>
            <Globe className="w-4 h-4" />
            <span>{primaryLanguage?.code.toUpperCase()} {primaryLanguage?.level}</span>
          </div>
        </div>
        {isStale && showTimeInPipe && (
          <Badge variant="warning" size="sm">
            {showTimeInPipe}d
          </Badge>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase className="w-4 h-4" />
          <span>{candidate.experience_years_total} years • {candidate.experience_domains[0] || 'General'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Available: {new Date(candidate.availability_date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {candidate.skills.slice(0, 5).map((skill, idx) => (
          <Badge key={idx} variant="default" size="sm">
            {skill}
          </Badge>
        ))}
      </div>

      {candidate.internal_history && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          Internal: {candidate.internal_history.function} • {candidate.internal_history.tenure_months} months
          {candidate.internal_history.last_bu && ` • ${candidate.internal_history.last_bu}`}
        </div>
      )}
    </motion.div>
  );
}

