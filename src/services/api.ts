/**
 * API Service Layer
 * 
 * This file contains mocked API functions for the static GitHub Pages deployment.
 * In production, these functions would make actual HTTP requests to a backend API.
 * 
 * SECURITY NOTE:
 * - Do NOT embed authentication keys or secrets in client-side code
 * - Use environment variables for API base URLs in local development
 * - For production, use serverless functions (e.g., Vercel, Netlify, AWS Lambda)
 * - Authenticate requests via server-side API gateway using GitHub Secrets
 * 
 * The matching API base URL placeholder:
 * - Local: MATCHING_API_BASE=http://localhost:3000/api (via .env.local)
 * - Production: Set via CI/CD secrets (e.g., GITHUB_SECRETS.MATCHING_API_BASE)
 */

// Placeholder for API base URL
// In production, this would be injected via environment variables or build-time constants
// const MATCHING_API_BASE = import.meta.env.VITE_MATCHING_API_BASE || '';

export interface MatchingRequest {
  candidate_id: string;
  role_id: string;
  candidate_data: unknown;
  role_data: unknown;
  interview_data?: unknown;
  pipeline_data?: unknown;
}

export interface MatchingResponse {
  match_score: number;
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

/**
 * Mocked: Compute match score for a candidate-role pair
 * 
 * In production, this would call:
 * POST ${MATCHING_API_BASE}/match
 * 
 * Headers:
 * - Authorization: Bearer ${API_TOKEN} (from serverless function, not client)
 * 
 * Body: MatchingRequest
 */
export async function computeMatch(_request: MatchingRequest): Promise<MatchingResponse> {
  // Mock implementation - in real app, replace with:
  // const response = await fetch(`${MATCHING_API_BASE}/match`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     // Authorization header added by serverless function
  //   },
  //   body: JSON.stringify(request),
  // });
  // return response.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        match_score: 85,
        breakdown: {
          leveling: 38,
          function_skills: 28,
          tools: 8,
          background_fit: 11,
        },
        evidence: ['Mocked response'],
        passed_constraints: true,
      });
    }, 100);
  });
}

/**
 * Mocked: Get top matches for a role
 * 
 * In production, this would call:
 * GET ${MATCHING_API_BASE}/roles/{role_id}/matches?limit=3
 */
export async function getTopMatchesForRole(
  _roleId: string,
  _limit: number = 3
): Promise<MatchingResponse[]> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          match_score: 90,
          breakdown: { leveling: 40, function_skills: 30, tools: 10, background_fit: 10 },
          evidence: ['Mocked match 1'],
          passed_constraints: true,
        },
        {
          match_score: 85,
          breakdown: { leveling: 35, function_skills: 30, tools: 10, background_fit: 10 },
          evidence: ['Mocked match 2'],
          passed_constraints: true,
        },
      ]);
    }, 100);
  });
}

/**
 * Mocked: Get top matches for a candidate
 * 
 * In production, this would call:
 * GET ${MATCHING_API_BASE}/candidates/{candidate_id}/matches?limit=3
 */
export async function getTopMatchesForCandidate(
  _candidateId: string,
  _limit: number = 3
): Promise<MatchingResponse[]> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          match_score: 88,
          breakdown: { leveling: 38, function_skills: 30, tools: 10, background_fit: 10 },
          evidence: ['Mocked match 1'],
          passed_constraints: true,
        },
      ]);
    }, 100);
  });
}

/**
 * Mocked: Ingest LinkedIn profile data
 * 
 * In production, this would call:
 * POST ${MATCHING_API_BASE}/ingest/linkedin
 * 
 * This endpoint would:
 * - Parse LinkedIn profile URL
 * - Extract structured candidate data
 * - Store in backend database
 * - Return candidate_id
 */
export async function ingestLinkedInProfile(_linkedinUrl: string): Promise<{ candidate_id: string }> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ candidate_id: `cand_${Date.now()}` });
    }, 500);
  });
}

/**
 * Mocked: Ingest interview scores and notes
 * 
 * In production, this would call:
 * POST ${MATCHING_API_BASE}/ingest/interview
 */
export async function ingestInterview(_data: {
  candidate_id: string;
  role_id: string;
  panel_scores: { technical: number; communication: number; business: number };
  notes: string;
}): Promise<{ success: boolean }> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 100);
  });
}

/**
 * Mocked: Reserve candidate for role (with locking)
 * 
 * In production, this would call:
 * POST ${MATCHING_API_BASE}/reserve
 * 
 * Backend would:
 * - Check for existing reservations (with DB transaction lock)
 * - Create reservation with TTL
 * - Return success or conflict error
 */
export async function reserveCandidate(
  _candidateId: string,
  _roleId: string
): Promise<{ success: boolean; conflict?: { role_id: string; reserved_by: string } }> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 100);
  });
}

/**
 * Mocked: Send notifications (e.g., Slack)
 * 
 * In production, this would call:
 * POST ${MATCHING_API_BASE}/notify
 * 
 * Backend would send to Slack/email/etc.
 */
export async function sendNotification(
  _type: 'batch_sent' | 'candidate_selected' | 'role_closed',
  _data: unknown
): Promise<{ success: boolean }> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 100);
  });
}

