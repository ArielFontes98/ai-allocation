import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../state/store';
import { RoleCard } from '../components/RoleCard';
import { addToast } from '../components/Layout';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import type { Role, Country, WorkModel } from '../types';
import { addDays } from 'date-fns';

export function ConfirmRoles() {
  const roles = useStore((state) => state.roles);
  const navigate = useNavigate();
  const setPendingRoleIntake = useStore((state) => state.setPendingRoleIntake);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Role>>({});
  const [confirmedRoles, setConfirmedRoles] = useState<Set<string>>(new Set());

  const handleEdit = (role: Role) => {
    setEditingRole(role.id);
    setFormData({
      function: role.function,
      subfunction: role.subfunction,
      target_levels: role.target_levels,
      level_flex_range: role.level_flex_range,
      country: role.country,
      work_model: role.work_model,
      start_preference: role.start_preference,
    });
  };

  const handleSave = (roleId: string) => {
    useStore.getState().updateRole(roleId, formData);
    setEditingRole(null);
    addToast('Role updated successfully', 'success');
  };

  const checkBufferViolation = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const bufferDays = 30;
    const minStartDate = addDays(today, bufferDays);
    return start < minStartDate;
  };

  const handleConfirm = (role: Role) => {
    // Marcar como confirmado
    setConfirmedRoles(new Set([...confirmedRoles, role.id]));
    
    // Preparar dados para Role Intake
    setPendingRoleIntake({
      ...role,
      title: role.title || '',
      reporting_line: role.reporting_line || '',
      internal_first_strategy: role.internal_first_strategy || 'open',
      internal_days: role.internal_days || 0,
      confidential: role.confidential || false,
      languages_required: role.languages_required || [],
      leveling_must_haves: role.leveling_must_haves || [],
      preferred_skills: role.preferred_skills || [],
      tools_top5: role.tools_top5 || [],
      day_in_the_life: role.day_in_the_life || [],
      near_term_scope: role.near_term_scope || { challenges: [], projects: [], kpis: [] },
      hard_constraints: role.hard_constraints || { language_fluent: true },
      weights: role.weights || {
        leveling: 0.45,
        function_skills: 0.35,
        tools: 0.10,
        background_fit: 0.10,
      },
    });
    
    addToast('Role confirmed! Opening Role Intake...', 'success');
    navigate('/intake');
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Upcoming Roles</h2>
        <p className="text-gray-600">
          Review and confirm role details before proceeding to the intake process.
        </p>
      </div>

      <div className="grid gap-6">
        {roles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">No roles to confirm. Add roles in the Role Intake screen.</p>
          </div>
        ) : (
          roles.map((role) => {
            const bufferViolation = checkBufferViolation(role.start_preference);
            const isEditing = editingRole === role.id;

            return (
              <div key={role.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                {!isEditing ? (
                  <>
                    <RoleCard role={role} showAge />
                    {bufferViolation && (
                      <div className="mt-4 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          Warning: Start date is less than 30 days from today. Offer-to-start buffer may be violated.
                        </span>
                      </div>
                    )}
                    <div className="mt-4 flex gap-3">
                      {!confirmedRoles.has(role.id) ? (
                        <>
                          <button
                            onClick={() => handleEdit(role)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleConfirm(role)}
                            className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirm Position
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-200">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Confirmed</span>
                          <button
                            onClick={() => handleConfirm(role)}
                            className="ml-2 px-3 py-1 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                          >
                            Open Intake
                            <ArrowRight className="w-3 h-3 inline ml-1" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Edit Role Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Function
                        </label>
                        <input
                          type="text"
                          value={formData.function || ''}
                          onChange={(e) => setFormData({ ...formData, function: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subfunction
                        </label>
                        <input
                          type="text"
                          value={formData.subfunction || ''}
                          onChange={(e) => setFormData({ ...formData, subfunction: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Levels (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={formData.target_levels?.join(', ') || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              target_levels: e.target.value.split(',').map((s) => s.trim()),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Level Flex Range (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={formData.level_flex_range?.join(', ') || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              level_flex_range: e.target.value.split(',').map((s) => s.trim()),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          value={formData.country || ''}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value as Country })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="Brazil">Brazil</option>
                          <option value="Mexico">Mexico</option>
                          <option value="Colombia">Colombia</option>
                          <option value="United States">United States</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Work Model
                        </label>
                        <select
                          value={formData.work_model || ''}
                          onChange={(e) => setFormData({ ...formData, work_model: e.target.value as WorkModel })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="On-site">On-site</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.start_preference || ''}
                          onChange={(e) => setFormData({ ...formData, start_preference: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {formData.start_preference && checkBufferViolation(formData.start_preference) && (
                          <p className="mt-1 text-sm text-yellow-600">
                            ⚠️ Less than 30 days from today
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSave(role.id)}
                        className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingRole(null)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

