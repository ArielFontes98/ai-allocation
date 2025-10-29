# Backend Integration Guide

This document outlines how to integrate the AI Allocation frontend with a real backend API for production use.

## 🔐 Security Principles

**Critical**: GitHub Pages is a static hosting service. There is no secure server runtime in the browser.

### ❌ What NOT to Do

- Never embed API keys, tokens, or secrets in client-side code
- Never commit `.env` files with secrets to the repository
- Never hardcode authentication credentials in JavaScript/TypeScript files
- The provided SSH key or any authentication strings should NOT appear in client code

### ✅ What TO Do

1. **Use serverless functions** (Vercel, Netlify, AWS Lambda)
2. **Use API Gateway** with authentication
3. **Inject secrets at build time** via CI/CD (GitHub Secrets)
4. **Never expose tokens** to the browser

## 🏗️ Architecture Options

### Option 1: Serverless Functions (Recommended)

Use Vercel, Netlify, or AWS Lambda functions as a proxy between your frontend and backend API.

```
Browser → Serverless Function → Backend API
         (has auth token)      (validates token)
```

**Example (Vercel):**

```typescript
// api/match.ts (Vercel serverless function)
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Token is injected via VERCEL environment variable (server-side only)
  const API_TOKEN = process.env.MATCHING_API_TOKEN;
  
  const response = await fetch(`${process.env.MATCHING_API_BASE}/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`, // Never exposed to client
    },
    body: JSON.stringify(req.body),
  });
  
  const data = await response.json();
  res.json(data);
}
```

Set environment variables in Vercel dashboard (never commit them).

### Option 2: API Gateway (AWS/GCP)

Use an API Gateway with authentication middleware:

1. Configure API Gateway to require API keys or OAuth
2. Generate API keys per client/environment
3. Store keys in CI/CD secrets (GitHub Secrets)
4. Inject at build time if needed (but prefer serverless proxy)

### Option 3: Backend-for-Frontend (BFF)

Run a lightweight Node.js backend that:
- Handles authentication
- Proxies requests to the matching API
- Injects tokens server-side

Deploy BFF separately (Railway, Render, Heroku, etc.).

## 🔄 Integration Steps

### Step 1: Update API Service Layer

Replace mocked functions in `src/services/api.ts` with real HTTP calls:

```typescript
// src/services/api.ts

// This constant should be injected at BUILD time, not runtime
// For local dev: VITE_MATCHING_API_BASE=http://localhost:3000/api
// For production: Set via GitHub Actions secrets → inject in build
const MATCHING_API_BASE = import.meta.env.VITE_MATCHING_API_BASE || '';

export async function computeMatch(request: MatchingRequest): Promise<MatchingResponse> {
  const response = await fetch(`${MATCHING_API_BASE}/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Do NOT add Authorization here - use serverless function proxy
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}
```

**Note**: The `MATCHING_API_BASE` should point to your serverless function, not directly to the backend API.

### Step 2: Environment Variables

Create `.env.local` for local development (gitignored):

```bash
# .env.local (DO NOT COMMIT)
VITE_MATCHING_API_BASE=http://localhost:3000/api
```

For production, set in CI/CD:

**GitHub Actions:**

```yaml
# .github/workflows/deploy.yml
- name: Build
  run: npm run build
  env:
    VITE_MATCHING_API_BASE: ${{ secrets.MATCHING_API_BASE }}
```

Set `MATCHING_API_BASE` in GitHub Secrets (Settings → Secrets → Actions).

### Step 3: Update Matching Engine

Currently, `src/lib/matching.ts` runs client-side. You have two options:

**Option A: Keep client-side (faster, but less accurate)**
- Keep current implementation for quick iterations
- Use API for final/accurate matches

**Option B: Always use API (recommended for production)**
- Replace `getTopMatchesForRole` and `getTopMatchesForCandidate` to call `api.ts` functions
- Backend runs the real ML model/algorithm

### Step 4: Authentication Flow

#### If using OAuth (e.g., GitHub OAuth):

1. Redirect to OAuth provider
2. Receive callback with code
3. Exchange code for token (serverless function)
4. Store token in httpOnly cookie or session
5. Serverless function validates token on each request

#### If using API Keys:

1. Generate keys per environment
2. Store in CI/CD secrets
3. Inject at build time (if needed for serverless)
4. Serverless function uses key to authenticate with backend

### Step 5: Real-Time Updates

For real-time conflict resolution and reservations:

1. Use WebSockets or Server-Sent Events
2. Connect via serverless function (no direct backend connection)
3. Implement optimistic UI updates with rollback on conflict

## 📡 API Endpoints (Expected)

Your backend should implement these endpoints:

```
POST /api/match
  Body: { candidate_id, role_id, candidate_data, role_data, ... }
  Returns: MatchScore

GET /api/roles/{role_id}/matches?limit=3
  Returns: MatchScore[]

GET /api/candidates/{candidate_id}/matches?limit=3
  Returns: MatchScore[]

POST /api/reserve
  Body: { candidate_id, role_id }
  Returns: { success: boolean, conflict?: {...} }

POST /api/ingest/linkedin
  Body: { linkedin_url }
  Returns: { candidate_id }

POST /api/ingest/interview
  Body: { candidate_id, role_id, panel_scores, notes }
  Returns: { success: boolean }
```

## 🔒 Token Management

### Where to Store Tokens

- ✅ **Serverless function environment variables** (Vercel, Netlify)
- ✅ **GitHub Secrets** (for CI/CD)
- ✅ **AWS Secrets Manager / Parameter Store** (for AWS)
- ❌ **Browser localStorage/sessionStorage** (if token is sensitive)
- ❌ **Client-side code** (never)

### Token Refresh

If using OAuth with refresh tokens:

1. Handle refresh in serverless function
2. Never expose refresh token to browser
3. Use httpOnly cookies for session management

## 🧪 Testing

### Local Development

1. Set up a local backend or mock server
2. Use `.env.local` for API base URL
3. Test with real data

### Production Testing

1. Deploy serverless functions
2. Set environment variables in hosting platform
3. Test API calls from deployed frontend
4. Verify no tokens appear in network tab (should go to serverless, not direct backend)

## 📋 Checklist

Before deploying to production:

- [ ] All API keys/secrets removed from client code
- [ ] Serverless functions configured and deployed
- [ ] Environment variables set in hosting platform
- [ ] API base URL points to serverless, not direct backend
- [ ] Authentication flow tested
- [ ] Error handling implemented
- [ ] Rate limiting considered
- [ ] CORS configured correctly
- [ ] No sensitive data in client bundle (check with `npm run build && cat dist/assets/*.js | grep -i 'token\|secret\|key'`)

## 🔗 Resources

- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

---

**Remember**: Security is not optional. Always assume client-side code is public and never trust it for authentication or authorization.

