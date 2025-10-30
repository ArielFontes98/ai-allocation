import { motion } from 'framer-motion';
import type { Role } from '../types';
import { Badge } from './Badge';
import { Building2, MapPin, Calendar, Users, UserCheck, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RoleCardProps {
  role: Role;
  onClick?: () => void;
  className?: string;
  showAge?: boolean;
}

export function RoleCard({ role, onClick, className = '', showAge = false }: RoleCardProps) {
  const isStale = role.age_days > 30;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {role.hot_squad && (
              <Flame className="w-5 h-5 text-orange-500 flex-shrink-0" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Building2 className="w-4 h-4" />
            <span>{role.function} • {role.subfunction}</span>
          </div>
        </div>
        {isStale && (
          <Badge variant="warning" size="sm">
            {role.age_days} days
          </Badge>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{role.country} • {role.work_model}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{role.target_levels.join(', ')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Start: {new Date(role.start_preference).toLocaleDateString()}</span>
        </div>
        {role.manager && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserCheck className="w-4 h-4" />
            <span>Manager: {role.manager}</span>
          </div>
        )}
        {role.ta_responsible && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserCheck className="w-4 h-4" />
            <span>TA Responsible: {role.ta_responsible}</span>
          </div>
        )}
      </div>

      {showAge && (
        <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
          Created {formatDistanceToNow(new Date(role.created_at), { addSuffix: true })}
        </div>
      )}
    </motion.div>
  );
}



