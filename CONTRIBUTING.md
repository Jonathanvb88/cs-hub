# Contributing

## CS Hub — Contributing Guide

---

## Development Setup

1. Clone the repository
```
git clone https://github.com/Jonathanvb88/cs-hub.git
cd cs-hub
```

2. Install frontend dependencies
```
cd frontend
npm install
```

3. Install backend dependencies
```
cd backend
pip install -r requirements.txt
```

4. Copy environment variables
```
cp .env.example .env.local
```

5. Run development servers
```
# Frontend
npm run dev

# Backend
uvicorn main:app --reload
```

---

## Branch Strategy

- main — production, auto-deploys to Vercel
- develop — integration branch
- feature/epic-{number}-{short-description} — feature branches
- fix/{short-description} — bug fix branches

All work must be done on a feature or fix branch. Never commit directly to main.

---

## Commit Message Format

```
type(scope): short description

Types: feat, fix, docs, style, refactor, test, chore
Scope: epic number or module name

Examples:
feat(epic-2): add client profile page
fix(health): correct score calculation
docs(api): update authentication section
```

---

## Pull Request Process

1. Create a PR from your feature branch to develop
2. Fill in the PR template
3. Request review from at least one team member
4. All checks must pass before merge
5. Squash and merge into develop
6. develop is merged to main for releases

---

## Code Standards

### Frontend
- TypeScript strict mode enabled
- ESLint and Prettier configured
- Components in PascalCase
- Files in kebab-case
- All API calls through the lib/api layer

### Backend
- Black formatter
- Flake8 linting
- Type hints on all functions
- Docstrings on all public functions
- No business logic in route handlers — services only

---

## Testing

- Frontend: Jest and React Testing Library
- Backend: Pytest
- Minimum 80% coverage on service layer
- All new features require tests before merge
