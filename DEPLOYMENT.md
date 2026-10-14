# Safe deployment guide

## Environments
- Backend: Render (existing service)
- Frontend: Vercel (existing project)
- Database: MongoDB (existing deployment)

Do not merge until the backend security CI, isolated MongoDB concurrency tests, and frontend production build pass; review Vercel preview separately from production. No production database tests.

## Pre-deployment
1. Verify `MONGO_URI` points to an appropriate MongoDB replica set. Mongo transactions are mandatory for pickup completion and reward redemption. Standalone `mongod` is not supported for those operations.
2. Confirm application secrets are configured only in hosting environment variables, not committed. Existing tracked `.env` was removed from the current security branch, but remains in Git history; inventory and rotate exposed credentials under an approved rollout.
3. Confirm the backend `JWT_SECRET` remains stable across the deployment or plan a controlled session invalidation.
4. Reconcile any uncommitted local work and verify checkout does not overwrite it.
5. Confirm legacy company `/api/company-auth/setup` is no longer needed; it is disabled because email alone cannot prove ownership.
6. Confirm that verified and active flags are populated on historical company documents as appropriate; any absent flags are treated as not authorized. Do not bulk-approve users or companies automatically.
7. **Required:** Set Render environment variable `FRONTEND_ORIGIN` to the exact production Vercel origin (scheme + hostname, no trailing slash), or `FRONTEND_ORIGINS` to a comma-separated allowlist. In `NODE_ENV=production` the backend deliberately refuses startup without an allowed origin. Do not merge until this is configured or deliberately staged.
8. Set Vercel `REACT_APP_API_URL` to the target backend base URL for staging/production when desired. If unset, the legacy production Render URL is the default. Always set staging to an isolated backend; never submit test transactions against production.
9. The admin setup script now requires one-time `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` (16+ characters). Remove initial-password variables after admin creation; inspect and rotate previously exposed default credentials if used.

## Rollout
Merge only after security reviews; deploy backend with a staging smoke test before exposing it, then the frontend. Verify legitimate registration/login, admin approval, pickups, points, and redemption flows. Monitor transaction error rates and balances.

## Rollback
Keep previous deployment artifact ready. Rolling back code is not a substitute for financial/accounting reconciliation. Never run destructive production database migrations without explicit approval.
