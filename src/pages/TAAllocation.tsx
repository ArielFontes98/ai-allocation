import { useState, useMemo } from 'react';
import { useStore } from '../state/store';
import { addToast } from '../components/Layout';
import { Users, Save } from 'lucide-react';
import type { Role } from '../types';

export function TAAllocation() {
  const roles = useStore((state) => state.roles);
  const updateRole = useStore((state) => state.updateRole);

  const [filters, setFilters] = useState({
    function: '',
    country: '',
    level: '',
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Get unique values for filters
  const uniqueFunctions = useMemo(() => Array.from(new Set(roles.map(r => r.function))), [roles]);
  const uniqueCountries = useMemo(() => Array.from(new Set(roles.map(r => r.country))), [roles]);
  const uniqueLevels = useMemo(() => {
    const levels = new Set<string>();
    roles.forEach(r => r.target_levels.forEach(l => levels.add(l)));
    return Array.from(levels).sort();
  }, [roles]);

  // Filter roles
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      if (filters.function && role.function !== filters.function) return false;
      if (filters.country && role.country !== filters.country) return false;
      if (filters.level && !role.target_levels.includes(filters.level)) return false;
      if (searchTerm && !role.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [roles, filters, searchTerm]);

  // TA assignments map
  const assignmentKey = (role: Role) => `${role.function}-${role.country}-${role.target_levels.join(',')}`;

  const handleAssignTA = (roleId: string, taName: string) => {
    if (!taName.trim()) {
      addToast('Please enter a TA name', 'error');
      return;
    }

    updateRole(roleId, { ta_responsible: taName.trim() });
    addToast(`TA assigned successfully`, 'success');
  };

  // Group roles by function, country, level
  const groupedRoles = useMemo(() => {
    const groups = new Map<string, Role[]>();
    
    filteredRoles.forEach(role => {
      const key = assignmentKey(role);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(role);
    });
    
    return groups;
  }, [filteredRoles]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">TA Allocation</h2>
        <p className="text-gray-600">
          Dynamically assign TA Responsible based on function, country, and level.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Function</label>
            <select
              value={filters.function}
              onChange={(e) => setFilters({ ...filters, function: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Functions</option>
              {uniqueFunctions.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Levels</option>
              {uniqueLevels.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search by Role Title</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles..."
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Grouped Roles */}
      <div className="space-y-6">
        {Array.from(groupedRoles.entries()).map(([key, rolesInGroup]) => {
          const [functionName, country, levels] = key.split('-');
          
          return (
            <div key={key} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {functionName} • {country} • {levels}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{rolesInGroup.length} role(s)</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {rolesInGroup.map(role => (
                  <div key={role.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{role.title}</h4>
                      <p className="text-sm text-gray-600">
                        {role.manager && `Manager: ${role.manager}`}
                        {role.ta_responsible && ` • TA: ${role.ta_responsible}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={role.ta_responsible || ''}
                        placeholder="Enter TA name"
                        className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent w-48"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAssignTA(role.id, (e.target as HTMLInputElement).value);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector(`input[data-role-id="${role.id}"]`) as HTMLInputElement;
                          if (input) {
                            handleAssignTA(role.id, input.value);
                          }
                        }}
                        className="px-4 py-2 bg-white text-gray-900 border-2 border-gray-900 rounded-xl font-semibold hover:bg-purple-100 hover:border-primary transition-colors flex items-center gap-2 shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredRoles.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">No roles found with current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
