import type { Candidate, Role, Interview, PipelineEntry, MatchScore, LanguageLevel } from '../types';

// Language level hierarchy (higher number = better)
const LANGUAGE_LEVELS: Record<LanguageLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

/**
 * Check if candidate meets language requirements
 */
function checkLanguageConstraints(candidate: Candidate, role: Role): { passed: boolean; violations: string[] } {
  const violations: string[] = [];

  for (const req of role.languages_required) {
    const candidateLang = candidate.languages.find(l => l.code === req.code);
    
    if (!candidateLang) {
      violations.push(`Missing required language: ${req.code}`);
      continue;
    }

    const candidateLevel = LANGUAGE_LEVELS[candidateLang.level];
    const requiredLevel = LANGUAGE_LEVELS[req.min];

    if (candidateLevel < requiredLevel) {
      violations.push(
        `Language ${req.code}: candidate has ${candidateLang.level}, required ${req.min}`
      );
    }
  }

  if (role.hard_constraints.language_fluent && violations.length > 0) {
    return { passed: false, violations };
  }

  return { passed: violations.length === 0, violations };
}

/**
 * Check work location/model constraints
 */
function checkLocationConstraints(candidate: Candidate, role: Role): { passed: boolean; violations: string[] } {
  const violations: string[] = [];

  // Basic country/work model checks (can be extended)
  if (role.work_model === 'On-site' && candidate.country !== role.country) {
    violations.push(`On-site role requires candidate in ${role.country}, candidate is in ${candidate.country}`);
  }

  return { passed: violations.length === 0, violations };
}

/**
 * Calculate leveling score (0-1)
 */
function calculateLevelingScore(
  candidate: Candidate,
  role: Role,
  interview?: Interview
): { score: number; evidence: string[] } {
  const evidence: string[] = [];
  let score = 0.5; // Base score

  // Check leveling must-haves
  const mustHaves = role.leveling_must_haves;
  const candidateSkills = candidate.skills.map(s => s.toLowerCase());
  const candidateDomains = candidate.experience_domains.map(d => d.toLowerCase());
  
  let matches = 0;
  for (const mustHave of mustHaves) {
    const normalized = mustHave.toLowerCase().replace(/_/g, ' ');
    
    // Check in skills
    if (candidateSkills.some(s => s.includes(normalized))) {
      matches++;
      evidence.push(`Has skill: ${mustHave}`);
      continue;
    }
    
    // Check in domains
    if (candidateDomains.some(d => d.includes(normalized))) {
      matches++;
      evidence.push(`Has domain: ${mustHave}`);
      continue;
    }
    
    // Check interview scores (if available)
    if (interview && normalized.includes('stakeholder') && interview.panel_scores.communication >= 4.0) {
      matches++;
      evidence.push(`Interview communication: ${interview.panel_scores.communication}/5`);
    }
  }

  score = matches / mustHaves.length;

  // Boost for internal history
  if (candidate.internal_history) {
    const history = candidate.internal_history;
    if (history.tenure_months >= 12) {
      score += 0.1;
      evidence.push(`Internal tenure: ${history.tenure_months} months`);
    }
  }

  // Boost for interview scores
  if (interview) {
    const avgScore = (
      interview.panel_scores.technical +
      interview.panel_scores.communication +
      interview.panel_scores.business
    ) / 3;
    score += (avgScore - 3.5) / 10; // Scale from 3.5-5.0 to 0-0.15 boost
    evidence.push(`Interview avg: ${avgScore.toFixed(1)}/5`);
  }

  return { score: Math.min(1, Math.max(0, score)), evidence };
}

/**
 * Calculate function skills score using Jaccard similarity
 */
function calculateFunctionSkillsScore(
  candidate: Candidate,
  role: Role
): { score: number; evidence: string[] } {
  const evidence: string[] = [];
  
  // Combine role requirements (must-haves + preferred)
  const roleSkills = [
    ...role.leveling_must_haves,
    ...role.preferred_skills,
    ...(role.experience_domains || []).map((d: string) => d.toLowerCase()),
  ].map(s => s.toLowerCase());

  // Combine candidate skills + domains
  const candidateSkills = [
    ...candidate.skills.map(s => s.toLowerCase()),
    ...candidate.experience_domains.map(d => d.toLowerCase()),
  ];

  // Calculate Jaccard similarity
  const set1 = new Set(roleSkills);
  const set2 = new Set(candidateSkills);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  const jaccard = intersection.size / union.size;

  // Add evidence
  intersection.forEach(skill => {
    if (candidate.skills.some(s => s.toLowerCase().includes(skill))) {
      evidence.push(`Skill match: ${skill}`);
    }
    if (candidate.experience_domains.some(d => d.toLowerCase().includes(skill))) {
      evidence.push(`Domain match: ${skill}`);
    }
  });

  return { score: jaccard, evidence };
}

/**
 * Calculate tools overlap score
 */
function calculateToolsScore(
  candidate: Candidate,
  role: Role
): { score: number; evidence: string[] } {
  const evidence: string[] = [];
  
  const roleTools = role.tools_top5.map(t => t.toLowerCase());
  const candidateTools = candidate.tools.map(t => t.toLowerCase());

  const intersection = roleTools.filter(t => candidateTools.includes(t));
  const score = intersection.length / roleTools.length;

  intersection.forEach(tool => {
    evidence.push(`Tool match: ${tool}`);
  });

  return { score, evidence };
}

/**
 * Calculate background fit score
 */
function calculateBackgroundFitScore(
  candidate: Candidate,
  role: Role
): { score: number; evidence: string[] } {
  const evidence: string[] = [];
  let score = 0.5;

  // Internal candidate bonus
  if (candidate.type === 'internal' && candidate.internal_history) {
    const history = candidate.internal_history;
    
    // Same function bonus
    if (history.function === role.function) {
      score += 0.2;
      evidence.push(`Internal: same function (${history.function})`);
    }
    
    // Same subfunction or related BU
    if (history.last_bu.toLowerCase().includes(role.subfunction.toLowerCase()) ||
        role.subfunction.toLowerCase().includes(history.last_bu.toLowerCase())) {
      score += 0.2;
      evidence.push(`Internal: related BU (${history.last_bu})`);
    }
    
    // Tenure bonus
    if (history.tenure_months >= 18) {
      score += 0.1;
      evidence.push(`Internal: strong tenure (${history.tenure_months} months)`);
    }
  }

  // Domain overlap
  const roleDomain = role.subfunction.toLowerCase();
  if (candidate.experience_domains.some(d => 
    d.toLowerCase().includes(roleDomain) || roleDomain.includes(d.toLowerCase())
  )) {
    score += 0.1;
    evidence.push(`Domain fit: ${candidate.experience_domains.join(', ')}`);
  }

  return { score: Math.min(1, Math.max(0, score)), evidence };
}

/**
 * Compute match score for a candidate-role pair
 */
export function computeMatchScore(
  candidate: Candidate,
  role: Role,
  interview?: Interview,
  _pipeline?: PipelineEntry
): MatchScore {
  const violations: string[] = [];

  // Hard constraints check
  const langCheck = checkLanguageConstraints(candidate, role);
  const locCheck = checkLocationConstraints(candidate, role);

  violations.push(...langCheck.violations);
  violations.push(...locCheck.violations);

  const passedConstraints = violations.length === 0;

  if (!passedConstraints) {
    return {
      candidate_id: candidate.id,
      role_id: role.id,
      total_score: 0,
      breakdown: {
        leveling: 0,
        function_skills: 0,
        tools: 0,
        background_fit: 0,
      },
      evidence: [],
      passed_constraints: false,
      constraint_violations: violations,
    };
  }

  // Calculate component scores
  const leveling = calculateLevelingScore(candidate, role, interview);
  const functionSkills = calculateFunctionSkillsScore(candidate, role);
  const tools = calculateToolsScore(candidate, role);
  const backgroundFit = calculateBackgroundFitScore(candidate, role);

  // Apply weights
  const weightedScore =
    leveling.score * role.weights.leveling * 100 +
    functionSkills.score * role.weights.function_skills * 100 +
    tools.score * role.weights.tools * 100 +
    backgroundFit.score * role.weights.background_fit * 100;

  // Combine evidence (top 5)
  const allEvidence = [
    ...leveling.evidence,
    ...functionSkills.evidence,
    ...tools.evidence,
    ...backgroundFit.evidence,
  ].slice(0, 5);

  // Add summary evidence
  if (candidate.experience_years_total > 0) {
    allEvidence.unshift(
      `${candidate.name}: ${candidate.experience_years_total} yrs exp, ${candidate.experience_domains[0] || 'General'} domain`
    );
  }

  return {
    candidate_id: candidate.id,
    role_id: role.id,
    total_score: Math.round(weightedScore),
    breakdown: {
      leveling: Math.round(leveling.score * role.weights.leveling * 100),
      function_skills: Math.round(functionSkills.score * role.weights.function_skills * 100),
      tools: Math.round(tools.score * role.weights.tools * 100),
      background_fit: Math.round(backgroundFit.score * role.weights.background_fit * 100),
    },
    evidence: allEvidence,
    passed_constraints: true,
  };
}

/**
 * Get top N matches for a role
 */
export function getTopMatchesForRole(
  role: Role,
  candidates: Candidate[],
  interviews: Interview[],
  _pipeline: PipelineEntry[],
  limit: number = 3
): MatchScore[] {
  const matches: MatchScore[] = [];

  for (const candidate of candidates) {
    const interview = interviews.find(i => i.candidate_id === candidate.id && i.role_id === role.id);
    const pipe = _pipeline.find((p: PipelineEntry) => p.candidate_id === candidate.id && (p.role_id === role.id || !p.role_id));
    
    const match = computeMatchScore(candidate, role, interview, pipe);
    if (match.passed_constraints) {
      matches.push(match);
    }
  }

    // Sort by score descending, then by staleness (if pipeline data available)
    matches.sort((a, b) => {
      if (b.total_score !== a.total_score) {
        return b.total_score - a.total_score;
      }
      
      // Note: Pipeline entries don't always have role_id, so we match by candidate_id only
      return 0; // Simplified for now
    });

  return matches.slice(0, limit);
}

/**
 * Get top N matches for a candidate
 */
export function getTopMatchesForCandidate(
  candidate: Candidate,
  roles: Role[],
  interviews: Interview[],
  _pipeline: PipelineEntry[],
  limit: number = 3
): MatchScore[] {
  const matches: MatchScore[] = [];

  for (const role of roles) {
    const interview = interviews.find(i => i.candidate_id === candidate.id && i.role_id === role.id);
    const pipe = _pipeline.find((p: PipelineEntry) => p.candidate_id === candidate.id && (p.role_id === role.id || !p.role_id));
    
    const match = computeMatchScore(candidate, role, interview, pipe);
    if (match.passed_constraints) {
      matches.push(match);
    }
  }

  // Sort by score descending, then by role age
  matches.sort((a, b) => {
    if (b.total_score !== a.total_score) {
      return b.total_score - a.total_score;
    }
    
    const aRole = roles.find(r => r.id === a.role_id);
    const bRole = roles.find(r => r.id === b.role_id);
    
    const aAge = aRole?.age_days || 0;
    const bAge = bRole?.age_days || 0;
    
    return bAge - aAge; // Older role = higher priority
  });

  return matches.slice(0, limit);
}

