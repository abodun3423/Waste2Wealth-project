# Waste2Wealth

Waste2Wealth is a recycling pickup and rewards application with a Node.js / Express / MongoDB API and a React frontend.

## Repository layout
- `waste2wealth-backend`: API, user/company/admin authorization, pickup tracking, rewards and redemptions
- `waste2wealth-frontend`: React web app

## Local setup
Use Node.js 20. Run `npm ci` in each project directory. Copy `waste2wealth-backend/.env.example` to a local, untracked `.env` and provide your own isolated development database URI and JWT secret. Never commit real values.

From `waste2wealth-backend`: `npm start`. From `waste2wealth-frontend`: `npm start`.

## Security and reward rules
Only verified, active recycling companies can accept or complete pickup requests. Completing a collected pickup with actual verified weight awards **10 points per kilogram**, once. An ordinary user uploading recyclable information earns no points until the company verification flow is complete.

## Tests
Run `npm test` in `waste2wealth-backend`. For isolated transactional integration coverage, supply `TEST_MONGO_URI` pointing exclusively to `waste2wealth_security_test` on a local replica set. CI provisions a disposable MongoDB replica set and performs the tests automatically. Frontend: `npm ci && npm run build`.

See [Security Audit](SECURITY_AUDIT.md), [Deployment Guide](DEPLOYMENT.md), and [Test Results](TEST_RESULTS.md). The security branch remains a **draft PR**, not a production release.
