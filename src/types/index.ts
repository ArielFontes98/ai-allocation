export type CandidateType = 'internal' | 'external';
export type Country = 'Brazil' | 'Mexico' | 'Colombia' | 'United States' | 'Others';
export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type WorkModel = 'Remote' | 'Hybrid' | 'On-site';
export type PipelineStage = 'screening' | 'manager_review' | 'offer' | 'accepted';
export type InternalStrategy = 'internal_only' | 'internal_first' | 'open';

export interface Language {
  code: string;
  level: LanguageLevel;
}

export interface LanguageRequirement {
  code: string;
  min: LanguageLevel;
}

export interface Candidate {
  id: string;
  name: string;
  type: CandidateType;
  linkedin_url: string;
  country: Country;
  time_zone: string;
  languages: Language[];
  experience_years_total: number;
  experience_domains: string[];
  skills: string[];
  tools: string[];
  internal_history?: {
    function: string;
    tenure_months: number;
    last_bu: string;
  };
  availability_date: string;
  notes: string;
}

export interface Role {
  id: string;
  title: string;
  function: string;
  subfunction: string;
  country: Country;
  work_model: WorkModel;
  start_preference: string;
  reporting_line: string;
  target_levels: string[];
  level_flex_range: string[];
  internal_first_strategy: InternalStrategy;
  internal_days: number;
  confidential: boolean;
  languages_required: LanguageRequirement[];
  leveling_must_haves: string[];
  preferred_skills: string[];
  tools_top5: string[];
  day_in_the_life: string[];
  experience_domains?: string[];
  near_term_scope: {
    challenges: string[];
    projects: string[];
    kpis: string[];
  };
  hard_constraints: {
    language_fluent: boolean;
  };
  weights: {
    leveling: number;
    function_skills: number;
    tools: number;
    background_fit: number;
  };
  created_at: string;
  age_days: number;
  manager?: string;
  ta_responsible?: string;
}

export interface Interview {
  candidate_id: string;
  role_id: string;
  panel_scores: {
    technical: number;
    communication: number;
    business: number;
  };
  notes: string;
}

export interface PipelineEntry {
  candidate_id: string;
  role_id?: string;
  stage: PipelineStage;
  entered_stage_at: string;
  time_in_pipe_days: number;
}

export interface MatchScore {
  candidate_id: string;
  role_id: string;
  total_score: number;
  breakdown: {
    leveling: number;
    function_skills: number;
    tools: number;
    background_fit: number;
  };
  evidence: string[];
  passed_constraints: boolean;
  constraint_violations?: string[];
}

export interface Batch {
  id: string;
  created_at: string;
  sent_at?: string;
  matches: MatchScore[];
}

export interface Reservation {
  candidate_id: string;
  role_id: string;
  reserved_at: string;
  reserved_by: string;
}

export interface Rejection {
  candidate_id: string;
  role_id: string;
  reason: string;
  rejected_at: string;
  rejected_by: string;
}

