import { useState, useMemo } from 'react';
import { useStore } from '../state/store';
import { addToast } from '../components/Layout';
import { Users, Save } from 'lucide-react';
import type { Role } from '../types';

interface AllocationGroup {
  function: string;
  country: string;
  level: string;
  roleCount: number;
  taResponsible: string;
}

export function TAAllocation() {
  const roles = useStore((state) => state.roles);
  const updateRole = useStore((state) => state.updateRole);

  const [allocations, setAllocations] = useState<Map<string, string>>(new Map());

  // Group roles by function, country, and level
  const allocationGroups = useMemo(() => {
    const groupsMap = new Map<string, { roles: Role[], taResponsible: string }>();
    
    roles.forEach(role => {
      // For each level in target_levels, create a group
      role.target_levels.forEach(level => {
        const key = `${role.function}-${role.country}-${level}`;
        
        if (!groupsMap.has(key)) {
          const existingTa = role.ta_responsible || '';
          groupsMap.set(key, { roles: [], taResponsible: existingTa });
        }
        
        groupsMap.get(key)!.roles.push(role);
        // If role has TA assigned, use it for the group
        if (role.ta_responsible && !groupsMap.get(key)!.taResponsible) {
          groupsMap.get(key)!.taResponsible = role.ta_responsible;
        }
      });
    });
    
    // Convert to array of AllocationGroup
    const groups: AllocationGroup[] = [];
    groupsMap.forEach((data, key) => {
      const [func, country, level] = key.split('-');
      groups.push({
        function: func,
        country,
        level,
        roleCount: data.roles.length,
        taResponsible: data.taResponsible,
      });
    });
    
    // Sort by function, country, level
    return groups.sort((a, b) => {
      if (a.function !== b.function) return a.function.localeCompare(b.function);
      if (a.country !== b.country) return a.country.localeCompare(b.country);
      return a.level.localeCompare(b.level);
    });
  }, [roles, allocations]);

  const handleAssignTA = (functionName: string, country: string, level: string, taName: string) => {
    if (!taName.trim()) {
      addToast('Please enter a TA name', 'error');
      return;
    }

    // Update all roles in this group
    const rolesToUpdate = roles.filter(role => 
      role.function === functionName && 
      role.country === country &&
      role.target_levels.includes(level)
    );

    rolesToUpdate.forEach(role => {
      updateRole(role.id, { ta_responsible: taName.trim() });
    });

    // Update local state
    const key = `${functionName}-${country}-${level}`;
    setAllocations(new Map(allocations.set(key, taName.trim())));

    addToast(`TA assigned to ${rolesToUpdate.length} role(s)`, 'success');
  };

  const [inputValues, setInputValues] = useState<Map<string, string>>(new Map());

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">TA Allocation</h2>
        <p className="text-gray-600">
          Assign TA Responsible by function, country, and level combination.
        </p>
      </div>

      {/* Allocation Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Function</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Country</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Level</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <Users className="w-4 h-4 inline mr-2" />
                  Roles
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">TA Responsible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allocationGroups.map((group) => {
                const key = `${group.function}-${group.country}-${group.level}`;
                const currentValue = inputValues.get(key) || group.taResponsible || '';
                
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{group.function}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{group.country}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{group.level}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{group.roleCount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => {
                            const newMap = new Map(inputValues);
                            newMap.set(key, e.target.value);
                            setInputValues(newMap);
                          }}
                          placeholder="Enter TA name"
                          className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAssignTA(group.function, group.country, group.level, (e.target as HTMLInputElement).value);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAssignTA(group.function, group.country, group.level, currentValue)}
                          className="px-4 py-2 bg-white text-gray-900 border-2 border-gray-900 rounded-xl font-semibold hover:bg-purple-100 hover:border-primary transition-colors flex items-center gap-2 shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          Assign
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {allocationGroups.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No roles found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
