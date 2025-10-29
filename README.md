# AI Allocation - Lean Hiring Platform

A modern, production-quality static web application for lean hiring intake and candidate-role matching. Built with React, TypeScript, Vite, and Tailwind CSS, designed with Nubank's minimalist aesthetic.

![Deploy Status](https://github.com/ArielFontes98/ai-allocation/actions/workflows/deploy.yml/badge.svg)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ArielFontes98/ai-allocation.git
cd ai-allocation

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/ai-allocation/`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📋 Features

### Four Main Screens

1. **Confirm Roles** - Managers review and confirm upcoming role details
2. **Role Intake** - Comprehensive lean hiring intake form with all role requirements
3. **TA Review & Send** - Talent Acquisition reviews AI-generated matches and sends to managers
4. **Manager Approvals** - Managers select candidates with conflict resolution

### Key Capabilities

- ✅ AI-simulated matching engine with weighted scoring
- ✅ Hard constraint validation (language, location, etc.)
- ✅ Top 3 matches per role and candidate
- ✅ Staleness tracking and prioritization
- ✅ 30-day offer-to-start buffer validation
- ✅ Conflict detection and resolution
- ✅ Weekly batch workflow
- ✅ CSV export
- ✅ Persistent state with localStorage
- ✅ Modern, responsive UI with Nubank design language

## 🏗️ Architecture

### Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management with persistence
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Router** - Client-side routing
- **date-fns** - Date utilities

### Project Structure

```
ai-allocation/
├── data/                    # Seed JSON data
│   ├── candidates.json
│   ├── roles.json
│   ├── interviews.json
│   ├── pipeline.json
│   └── history.json
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Badge.tsx
│   │   ├── CandidateCard.tsx
│   │   ├── ConflictModal.tsx
│   │   ├── FiltersBar.tsx
│   │   ├── Layout.tsx
│   │   ├── MatchExplain.tsx
│   │   ├── Navigation.tsx
│   │   ├── RoleCard.tsx
│   │   └── Toaster.tsx
│   ├── lib/
│   │   └── matching.ts     # Matching algorithm
│   ├── pages/              # Main screens
│   │   ├── ConfirmRoles.tsx
│   │   ├── ManagerApprovals.tsx
│   │   ├── RoleIntake.tsx
│   │   └── TAReviewSend.tsx
│   ├── services/
│   │   └── api.ts           # Mocked API layer
│   ├── state/
│   │   └── store.ts         # Zustand store
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions workflow
└── public/
    └── 404.html             # SPA fallback for GitHub Pages
```

## 🤖 Matching Algorithm

The matching engine (`src/lib/matching.ts`) computes scores using:

1. **Hard Constraints** (gate):
   - Language requirements
   - Location/work model rules
   - Must pass to proceed

2. **Weighted Scoring** (0-100):
   - **Leveling** (45% default): Skills, interviews, internal history
   - **Function Skills** (35% default): Jaccard similarity of skills/domains
   - **Tools** (10% default): Overlap of required tools
   - **Background Fit** (10% default): Internal BU alignment, domain fit

3. **Staleness Prioritization**:
   - Badges for candidates in pipeline > X days
   - Badges for roles open > Y days
   - Used as tie-breaker in sorting

## 🔒 Security Notes

**IMPORTANT**: This is a static site deployed to GitHub Pages. There is NO secure server runtime.

- ❌ **Never** embed authentication keys or secrets in client code
- ✅ All API functions are currently mocked (`src/services/api.ts`)
- ✅ For production, use:
  - Serverless functions (Vercel, Netlify, AWS Lambda)
  - API Gateway with authentication
  - GitHub Secrets for CI/CD token injection
  - Environment variables in build process (never in client bundle)

See `docs/integration.md` for backend integration guidance.

## 📦 Deployment

### GitHub Pages (Automated)

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: GitHub Actions

2. **Push to main branch**:
   - The workflow (`.github/workflows/deploy.yml`) automatically builds and deploys
   - Your app will be at: `https://ArielFontes98.github.io/ai-allocation/`

### Manual Deployment

```bash
npm run build
# Upload dist/ contents to your hosting provider
```

## 🔧 Configuration

### Base Path

The app is configured for the `/ai-allocation/` path. To change it:

1. Update `vite.config.ts`:
   ```typescript
   base: '/your-path/'
   ```

2. Update `.github/workflows/deploy.yml` if using GitHub Pages

3. Update `public/404.html` for SPA routing

## 📚 API Integration (Future)

When integrating with a real backend:

1. Update `src/services/api.ts` with actual fetch calls
2. Set `VITE_MATCHING_API_BASE` environment variable (build-time only)
3. Use serverless functions or API gateway for authentication
4. Never expose tokens in client code

See `docs/integration.md` for detailed integration guide.

## 🧪 Development

### Available Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

### Type Checking

TypeScript is configured with strict mode. Ensure all types are properly defined.

## 📝 Data Models

See `src/types/index.ts` for complete type definitions:

- `Candidate` - Candidate profile with skills, languages, experience
- `Role` - Role requirements with intake data
- `Interview` - Interview scores and notes
- `PipelineEntry` - Pipeline stage and timestamps
- `MatchScore` - Computed match with breakdown and evidence

## 🎨 Design System

- **Primary Color**: `#820AD1` (Nubank purple)
- **Fonts**: System fonts (SF Pro, Segoe UI, Roboto)
- **Spacing**: Generous padding, rounded-2xl corners
- **Shadows**: Soft shadows (shadow-sm, shadow-md)
- **Icons**: Lucide React

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [GitHub Repository](https://github.com/ArielFontes98/ai-allocation)
- [Live Demo](https://ArielFontes98.github.io/ai-allocation/) (after deployment)

---

Built with ❤️ using React, TypeScript, and Vite
