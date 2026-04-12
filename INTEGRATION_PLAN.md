# Frontend ↔ Backend Integration Plan

Goal: Connect the frontend (Vite + React) to the backend (.NET API) for local development and prepare a small, repeatable workflow for CI.

Phases
1. Local dev setup
   - Enable CORS in the backend to allow the frontend dev server origins.
   - Add a Vite dev server proxy so frontend code can call `/api/*` without changing existing code.
   - Confirm API base path and endpoints used by the frontend.

2. Frontend changes
   - Update the API client to use a single environment-based base URL (e.g., `/api` in dev via proxy, full URL in production).
   - Add simple error handling and a health-check request used by the app shell to verify connectivity.

3. Backend changes
   - Review existing controllers and ensure routes are consistent with frontend expectations.
   - Add permissive CORS policy for local dev and document tightening options for staging/production.

4. Testing & verification
   - Start backend, start frontend dev server, and verify calls succeed from the browser.
   - Add a minimal integration smoke test (optional): script that calls health endpoint.

5. CI / Future work
   - Document how to set environment variables and proxy in CI.
   - Add automated integration tests if needed.

Files to change (initial)
- `backend/EssLearn.Api/Program.cs` — add CORS configuration and policy name.
- `frontend/vite.config.ts` — add proxy to backend API.
- `frontend/src/app/*` — update API base URL usage (later step).

Dev assumptions
- Frontend dev server runs on `http://localhost:5173` (Vite default).
- Backend runs on `http://localhost:5000` or `https://localhost:5001` via `dotnet run`.

Next immediate actions
1. Enable CORS in `backend/EssLearn.Api/Program.cs`.
2. Add dev proxy to `frontend/vite.config.ts`.
