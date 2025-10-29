import { useState } from 'react';
import * as React from 'react';
import { useStore } from '../state/store';
import { addToast } from '../components/Layout';
import { Save, Plus, X } from 'lucide-react';
import type { Role, Country, WorkModel, InternalStrategy, LanguageLevel } from '../types';

const LEVELING_SKILLS = [
  'impact_delivery',
  'stakeholder_mgmt',
  'sql',
  'python',
  'credit_domain',
  'experimentation',
  'statistical_modeling',
  'product_analytics',
  'mlops',
  'model_monitoring',
];

const PREFERRED_SKILLS = [
  'mlops',
  'feature_store',
  'dbt',
  'ab_testing',
  'statistical_modeling',
  'product_analytics',
  'ml_serving',
  'model_monitoring',
];

export function RoleIntake() {
  const addRole = useStore((state) => state.addRole);
  const pendingRoleIntake = useStore((state) => state.pendingRoleIntake);
  const clearPendingRoleIntake = useStore((state) => state.clearPendingRoleIntake);
  
  // Initialize form with pending data if available
  const getInitialFormData = (): Partial<Role> => {
    if (pendingRoleIntake) {
      return pendingRoleIntake;
    }
    return {
    title: '',
    function: '',
    subfunction: '',
    country: 'Brazil',
    work_model: 'Hybrid',
    start_preference: '',
    reporting_line: '',
    target_levels: [],
    level_flex_range: [],
    internal_first_strategy: 'open',
    internal_days: 0,
    confidential: false,
    languages_required: [],
    leveling_must_haves: [],
    preferred_skills: [],
    tools_top5: [],
    day_in_the_life: [],
    near_term_scope: {
      challenges: [],
      projects: [],
      kpis: [],
    },
    hard_constraints: {
      language_fluent: true,
    },
    weights: {
      leveling: 0.45,
      function_skills: 0.35,
      tools: 0.10,
      background_fit: 0.10,
    },
    created_at: new Date().toISOString().split('T')[0],
    age_days: 0,
    };
  };
  
  const [formData, setFormData] = useState<Partial<Role>>(getInitialFormData());

  // Clear pending intake after using it
  React.useEffect(() => {
    if (pendingRoleIntake) {
      clearPendingRoleIntake();
    }
  }, []);

  const handleSave = () => {
    if (!formData.title || !formData.function || !formData.subfunction) {
      addToast('Please fill in required fields', 'error');
      return;
    }

    const newRole: Role = {
      id: `role_${Date.now()}`,
      title: formData.title!,
      function: formData.function!,
      subfunction: formData.subfunction!,
      country: formData.country || 'Brazil',
      work_model: formData.work_model || 'Hybrid',
      start_preference: formData.start_preference || new Date().toISOString().split('T')[0],
      reporting_line: formData.reporting_line || '',
      target_levels: formData.target_levels || [],
      level_flex_range: formData.level_flex_range || [],
      internal_first_strategy: formData.internal_first_strategy || 'open',
      internal_days: formData.internal_days || 0,
      confidential: formData.confidential || false,
      languages_required: formData.languages_required || [],
      leveling_must_haves: formData.leveling_must_haves || [],
      preferred_skills: formData.preferred_skills || [],
      tools_top5: formData.tools_top5 || [],
      day_in_the_life: formData.day_in_the_life || [],
      near_term_scope: formData.near_term_scope || { challenges: [], projects: [], kpis: [] },
      hard_constraints: formData.hard_constraints || { language_fluent: true },
      weights: formData.weights || {
        leveling: 0.45,
        function_skills: 0.35,
        tools: 0.10,
        background_fit: 0.10,
      },
      created_at: formData.created_at || new Date().toISOString().split('T')[0],
      age_days: 0,
    };

    addRole(newRole);
    addToast('Role intake saved successfully', 'success');
    
    // Auto-save to localStorage via Zustand persist
    localStorage.setItem('ai-allocation-storage', JSON.stringify({
      ...JSON.parse(localStorage.getItem('ai-allocation-storage') || '{}'),
      roles: [...useStore.getState().roles, newRole],
    }));
  };

  const addArrayItem = (key: keyof typeof formData, value: string) => {
    const current = (formData[key] as string[]) || [];
    if (value && !current.includes(value)) {
      setFormData({ ...formData, [key]: [...current, value] });
    }
  };

  const removeArrayItem = (key: keyof typeof formData, index: number) => {
    const current = (formData[key] as string[]) || [];
    setFormData({ ...formData, [key]: current.filter((_, i) => i !== index) });
  };

  const addScopeItem = (type: 'challenges' | 'projects' | 'kpis', value: string) => {
    const current = formData.near_term_scope || { challenges: [], projects: [], kpis: [] };
    const list = current[type] || [];
    if (value && !list.includes(value)) {
      setFormData({
        ...formData,
        near_term_scope: { ...current, [type]: [...list, value] },
      });
    }
  };

  const removeScopeItem = (type: 'challenges' | 'projects' | 'kpis', index: number) => {
    const current = formData.near_term_scope || { challenges: [], projects: [], kpis: [] };
    const list = current[type] || [];
    setFormData({
      ...formData,
      near_term_scope: { ...current, [type]: list.filter((_, i) => i !== index) },
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Role Intake</h2>
        <p className="text-gray-600">
          Complete the lean hiring intake form to define role requirements.
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Role Snapshot</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Senior Data Scientist - Credit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Function *
              </label>
              <input
                type="text"
                value={formData.function || ''}
                onChange={(e) => setFormData({ ...formData, function: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., DS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subfunction *
              </label>
              <input
                type="text"
                value={formData.subfunction || ''}
                onChange={(e) => setFormData({ ...formData, subfunction: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Credit Modeling"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={formData.country || 'Brazil'}
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
                value={formData.work_model || 'Hybrid'}
                onChange={(e) => setFormData({ ...formData, work_model: e.target.value as WorkModel })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Start Date
              </label>
              <input
                type="date"
                value={formData.start_preference || ''}
                onChange={(e) => setFormData({ ...formData, start_preference: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reporting Line
              </label>
              <input
                type="text"
                value={formData.reporting_line || ''}
                onChange={(e) => setFormData({ ...formData, reporting_line: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., DS Manager, Credit"
              />
            </div>
          </div>
        </section>

        {/* Leveling */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Function & Leveling</h3>
          <div className="grid grid-cols-2 gap-4">
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
                    target_levels: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., IC6, IC7"
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
                    level_flex_range: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., IC5, IC6, IC7"
              />
            </div>
          </div>
        </section>

        {/* Internal Strategy */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Internal vs External Strategy</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="internal_strategy"
                value="internal_only"
                checked={formData.internal_first_strategy === 'internal_only'}
                onChange={(e) => setFormData({ ...formData, internal_first_strategy: e.target.value as InternalStrategy })}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-gray-700">Internal Only</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="internal_strategy"
                value="internal_first"
                checked={formData.internal_first_strategy === 'internal_first'}
                onChange={(e) => setFormData({ ...formData, internal_first_strategy: e.target.value as InternalStrategy })}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-gray-700">Internal First</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="internal_strategy"
                value="open"
                checked={formData.internal_first_strategy === 'open'}
                onChange={(e) => setFormData({ ...formData, internal_first_strategy: e.target.value as InternalStrategy })}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-gray-700">Open</span>
            </label>
            {(formData.internal_first_strategy === 'internal_only' || formData.internal_first_strategy === 'internal_first') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Days Window
                </label>
                <input
                  type="number"
                  value={formData.internal_days || 0}
                  onChange={(e) => setFormData({ ...formData, internal_days: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}
          </div>
        </section>

        {/* Language Requirements */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Language Requirements</h3>
          <div className="space-y-3">
            {formData.languages_required?.map((lang, idx) => (
              <div key={idx} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language Code</label>
                  <input
                    type="text"
                    value={lang.code}
                    onChange={(e) => {
                      const langs = [...(formData.languages_required || [])];
                      langs[idx] = { ...lang, code: e.target.value };
                      setFormData({ ...formData, languages_required: langs });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., en"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Level</label>
                  <select
                    value={lang.min}
                    onChange={(e) => {
                      const langs = [...(formData.languages_required || [])];
                      langs[idx] = { ...lang, min: e.target.value as LanguageLevel };
                      setFormData({ ...formData, languages_required: langs });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    const langs = formData.languages_required?.filter((_, i) => i !== idx) || [];
                    setFormData({ ...formData, languages_required: langs });
                  }}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  languages_required: [...(formData.languages_required || []), { code: 'en', min: 'C1' }],
                });
              }}
              className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Language
            </button>
          </div>
        </section>

        {/* Leveling Must-Haves */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Leveling Skills (Must-Haves) - Max 5</h3>
          <div className="space-y-2">
            {formData.leveling_must_haves?.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                <span className="flex-1 text-sm text-gray-700">{skill}</span>
                <button
                  onClick={() => removeArrayItem('leveling_must_haves', idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!formData.leveling_must_haves || formData.leveling_must_haves.length < 5) && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addArrayItem('leveling_must_haves', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a skill...</option>
                {LEVELING_SKILLS.filter((s) => !formData.leveling_must_haves?.includes(s)).map((skill) => (
                  <option key={skill} value={skill}>
                    {skill.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            )}
          </div>
        </section>

        {/* Preferred Skills */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Preferred Skills - Max 5</h3>
          <div className="space-y-2">
            {formData.preferred_skills?.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                <span className="flex-1 text-sm text-gray-700">{skill}</span>
                <button
                  onClick={() => removeArrayItem('preferred_skills', idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!formData.preferred_skills || formData.preferred_skills.length < 5) && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addArrayItem('preferred_skills', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a skill...</option>
                {PREFERRED_SKILLS.filter((s) => !formData.preferred_skills?.includes(s)).map((skill) => (
                  <option key={skill} value={skill}>
                    {skill.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            )}
          </div>
        </section>

        {/* Tools */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Tools & Platforms - Top 5</h3>
          <div className="space-y-2">
            {formData.tools_top5?.map((tool, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                <span className="flex-1 text-sm text-gray-700">{tool}</span>
                <button
                  onClick={() => removeArrayItem('tools_top5', idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!formData.tools_top5 || formData.tools_top5.length < 5) && (
              <input
                type="text"
                placeholder="Add a tool..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    addArrayItem('tools_top5', e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            )}
          </div>
        </section>

        {/* Day in the Life */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Day-in-the-Life - Max 3</h3>
          <div className="space-y-2">
            {formData.day_in_the_life?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                <span className="flex-1 text-sm text-gray-700">{item}</span>
                <button
                  onClick={() => removeArrayItem('day_in_the_life', idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!formData.day_in_the_life || formData.day_in_the_life.length < 3) && (
              <input
                type="text"
                placeholder="Add a day-in-the-life item..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    addArrayItem('day_in_the_life', e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            )}
          </div>
        </section>

        {/* Near-Term Scope */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Near-Term Scope (90 days)</h3>
          {(['challenges', 'projects', 'kpis'] as const).map((type) => (
            <div key={type} className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                {type} (Max 2)
              </h4>
              <div className="space-y-2">
                {formData.near_term_scope?.[type]?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                    <span className="flex-1 text-sm text-gray-700">{item}</span>
                    <button
                      onClick={() => removeScopeItem(type, idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!formData.near_term_scope?.[type] || formData.near_term_scope[type].length < 2) && (
                  <input
                    type="text"
                    placeholder={`Add a ${type.slice(0, -1)}...`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        addScopeItem(type, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Weights */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Matching Weights</h3>
          <div className="grid grid-cols-2 gap-4">
            {(['leveling', 'function_skills', 'tools', 'background_fit'] as const).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={formData.weights?.[key] || 0}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      weights: {
                        ...formData.weights!,
                        [key]: parseFloat(e.target.value) || 0,
                      },
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Weights should sum to 1.0
          </p>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-white text-primary border border-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors flex items-center gap-2 shadow-lg"
          >
            <Save className="w-5 h-5" />
            Save Role Intake
          </button>
        </div>
      </div>
    </div>
  );
}

