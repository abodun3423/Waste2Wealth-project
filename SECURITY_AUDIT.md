# Waste2Wealth security audit and deployment precautions

Date: 2026-10-13. This is a **partial security patch**, not production certification.

## Business invariant
Only an authenticated, active, admin-verified recycling company should verify *actual* collected weight. Award 10 points per kilogram of verified weight; estimated weights and self-reported recyclable uploads cannot award points.

## Important findings not yet remediated
- GitHub tracked `waste2wealth-backend/.env` at audit time. Removing it from the newest tree does not remove historical exposure. Assess and rotate any exposed credentials in a controlled maintenance window; do not print them in CI logs.
- GitHub tracked `waste2wealth-backend/node_modules`. Ignore it going forward and untrack it separately after reconciling local changes.
- Company `POST /api/company-auth/setup` can assign a password based only on knowledge of an existing company email. Disable this legacy route until a verified administrator-managed invite/reset workflow exists.
- Company and admin pickup completion routes use a read-modify-write points award with no atomic claim or database transaction. Concurrent completions can duplicate rewards; **do not expose completion to live traffic until fixed and tested**.
- Redemption route has a read-modify-write balance debit and can overspend under simultaneous requests.
- Public company search and company creation routes require inspection/patching against unapproved listings and unauthorized creation.
- Backend test suite, frontend build, isolated MongoDB integration tests, and Render/Vercel configuration checks remain outstanding.

## Test commands
From `waste2wealth-backend` run `node --test tests/rewardPolicy.test.js`. Run database integration tests only with a disposable MongoDB database (proposed `waste2wealth_security_test`, port 5001); never point destructive tests at production MongoDB.

## Deployment precautions
1. Do not merge this branch or deploy until existing uncommitted local security changes have been compared and reconciled, all completion/redemption races are fixed, and tests pass.
2. Preserve the local modifications in company auth, verified-company middleware, admin, companies, company portal, pickups, CompanyDashboard, and server logging.
3. Require secrets in Render environment variables, not git. Review historical exposure separately.
4. Verify API connectivity and CORS against the actual Vercel host in staging before deploying.

## Required environment variables (names only)
`MONGO_URI`, `JWT_SECRET`, `PORT`, and a restricted frontend origin variable (proposed `FRONTEND_ORIGIN`).
