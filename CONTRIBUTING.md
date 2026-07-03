# Contributing

## CS Hub — Contributing Guide

---

## Development Setup

CS Hub is a single Next.js 14 application — there is no separate backend service. `backend/` and `frontend/` top-level folders exist in the repo as empty placeholders from an earlier scaffold and are not used; the real app lives in `app/`, `components/`, and `lib/`.

1. Clone the repository
```
git clone https://github.com/Jonathanvb88/cs-hub.git
cd cs-hub
```

2. Install dependencies
```
npm install
```

3. Copy environment variables and fill in real values
```
cp .env.example .env.local
```
See `.env.example` for the full list of required variables and where to obtain each one.

4. Run the dev server
```
npm run dev
```

5. On a fresh database, run the one-off setup endpoints described in `README.md` → Developer Setup → Database Setup.

---

## Branch Strategy

All work currently happens directly on `main`, which auto-deploys to Vercel production on every push — there is no `develop` branch in this repository. If the team grows beyond one or two contributors, adopt feature branches (`feature/{short-description}`) with PRs into `main` before merging; until then, commit directly but keep commits small and descriptive, since each one ships straight to production.

---

## Commit Message Format

```
type(scope): short description

Types: feat, fix, docs, style, refactor, test, chore
Scope: module or feature area

Examples:
feat(dashboard): add Today's Focus smart digest
fix(health): correct score calculation
docs(readme): document required env vars
```

---

## Code Standards

- TypeScript strict mode is enabled — keep it that way, don't add `any` escapes without good reason.
- No ORM — all database access goes through `lib/db.ts` using parameterised queries (`sql(query, [params])`). Never interpolate user input directly into a query string.
- Styling uses CSS custom properties defined in `app/globals.css` (`--accent-green`, `--text-primary`, etc.) applied via inline `style={{}}` objects, not Tailwind utility classes, despite Tailwind being installed. This is the established convention for this project — follow it for consistency rather than introducing a second styling approach.
- **ESLint is not currently configured** — the `lint` script exists in `package.json` but `eslint-config-next` isn't installed. Don't rely on it catching issues until this is set up properly.

### Authentication — required on every API route

Every route under `app/api/` must call `requireAuth(req)` as the first line of every exported handler, regardless of whether the path is also covered by `middleware.ts`. This is a deliberate defense-in-depth decision, not a redundancy:

```ts
export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  // ... handler logic
}
```

This convention exists because relying on `middleware.ts`'s path matcher alone previously left two AI endpoints (`/api/ai-search`, `/api/assistant`) completely unauthenticated — the matcher simply didn't include their paths, and there was no in-route check as a backstop. Every route must guard itself; middleware is a second layer, not the only one.

The one documented exception is `/api/db/health-calculate`, which also accepts Vercel Cron's scheduled request (matched by User-Agent) alongside a real session — see the comment in that route and in `middleware.ts` for why.

---

## Pull Request Process

Once branch-based work starts (see Branch Strategy above): open a PR into `main`, fill in the PR template, and confirm `npm run build` and `npm test` both pass locally before requesting review.

---

## Testing

Tests use [Vitest](https://vitest.dev) (`npm test`). There is no UI/component testing or E2E suite yet — current coverage is deliberately scoped to the two areas with real business logic:

- `lib/healthScore.test.ts` — the client health scoring algorithm (score boundaries, caps, status thresholds)
- `lib/requireAuth.test.ts` — the authentication guard used by every API route (valid token, missing token, lookup failure)

When adding a new route with non-trivial logic, extract the pure logic into `lib/` (as done with `lib/healthScore.ts`) so it can be unit tested independently of the database and request/response objects, and add a corresponding `.test.ts` file alongside it.
