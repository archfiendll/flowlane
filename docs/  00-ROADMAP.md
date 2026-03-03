# Flowlane – Unified Roadmap
### Bachelor Project · CV Piece · Commercial SaaS Base · Maersk Interview Prep

**Goal:** Build a multi-tenant HR Operations SaaS (backend + frontend) using production-grade
engineering practices, cloud deployment, and scalable architecture.

**Author:** Illia Savytskyi
**Stack:** Node.js · Express · PostgreSQL · Prisma · JWT · Zod · bcrypt · Helmet · React · Docker · Azure

---

## ⚡ MAERSK INTERVIEW FAST TRACK
> **Read this first.** If the interview is in less than 2 weeks, do Phase 0 → Phase F1 → Phase F2
> before anything else. The backend phases can wait. The frontend cannot.

### What Maersk will actually test
- JavaScript fundamentals (written or verbal)
- React component thinking — state, props, effects
- How you consume a REST API from the frontend
- CSS layout — flexbox, responsive design
- How you communicate and handle problems you haven't seen before
- NOT: LeetCode hard, system design, or deep backend knowledge

### Your angle in the interview
You built a production-grade backend (layered architecture, JWT, RBAC, multi-tenancy).
Now you're building the frontend on top of it. That story — "I built the whole thing" — is
memorable and rare for a junior candidate. Use it.

---

## Phase 0 – Foundation ✅ COMPLETED

### Backend Infrastructure
- [x] PostgreSQL local database created (`flowlane_dev`)
- [x] Prisma schema initialized with `User` model
- [x] Prisma migrations working (`prisma migrate dev`)
- [x] Express layered architecture (Routes → Controllers → Services → Prisma)
- [x] `app.js` / `server.js` separation
- [x] Health endpoints (`/health/live`, `/health/ready`)
- [x] Centralized error handler middleware
- [x] `asyncHandler` utility (eliminates try/catch repetition in controllers)
- [x] Auth module: routes, controller, service, validators
- [x] `POST /auth/register` — creates user, hashes password with bcrypt (12 rounds)
- [x] `POST /auth/login` — validates credentials, returns JWT
- [x] `GET /auth/me` — returns authenticated user from token
- [x] JWT generation (`jsonwebtoken`)
- [x] `requireAuth` middleware — validates Bearer token on protected routes
- [x] `requireRole(...roles)` middleware — RBAC enforcement
- [x] Role enum in Prisma schema (`employee`, `admin`)
- [x] Password strength validation via Zod (min 10, uppercase, lowercase, number, special char)
- [x] Email normalization (trim + lowercase) in validators
- [x] Helmet security headers
- [x] CORS configuration
- [x] Admin-only test route (`GET /admin/ping`)
- [x] Config modules: `env.js`, `prisma.js`, `jwt.js`

### Documentation
- [x] `00-ROADMAP.md`
- [x] `01-CHANGELOG.md`
- [x] `02-DECISIONS.md` (architecture decisions with rationale and tradeoffs)
- [x] `README.md` with full setup instructions and curl examples

---

## Phase F1 – JavaScript Fundamentals (Interview Survival Kit)
> **Why now:** You cannot write React confidently without owning these.
> Do this phase in 2–3 days by writing every example by hand, not just reading.

### Core JS — write each of these from scratch in a `.js` file and run with `node`

#### Variables & Scope
- [ ] Explain and demonstrate: `var` (function-scoped, hoisted) vs `let`/`const` (block-scoped)
- [ ] Write an example where `var` causes a bug that `let` fixes
- [ ] Write a closure — a function that remembers a variable from its outer scope:
  ```js
  function makeCounter() {
    let count = 0;
    return () => ++count;
  }
  const counter = makeCounter();
  counter(); // 1
  counter(); // 2
  ```

#### Functions
- [ ] Write a regular function and an arrow function that do the same thing
- [ ] Explain the `this` difference: arrow functions inherit `this`, regular functions have their own
- [ ] Write a function with default parameters: `function greet(name = 'World') {}`
- [ ] Write a higher-order function (a function that takes a function as argument)

#### Arrays — must know cold
- [ ] `map` — transform every item, returns new array:
  ```js
  const names = users.map(u => u.name);
  ```
- [ ] `filter` — keep items that pass a test, returns new array:
  ```js
  const active = employees.filter(e => e.status === 'ACTIVE');
  ```
- [ ] `reduce` — collapse array to single value:
  ```js
  const total = [1,2,3].reduce((acc, n) => acc + n, 0); // 6
  ```
- [ ] `find` — returns first match or undefined
- [ ] `some` / `every` — returns boolean
- [ ] `forEach` — iterate, returns nothing (don't use when you need a return value)
- [ ] Chain them: filter active employees, map to names, sort alphabetically

#### Objects
- [ ] Destructuring: `const { name, email } = user;`
- [ ] Spread: `const updated = { ...user, name: 'New Name' };`
- [ ] Optional chaining: `user?.address?.city`
- [ ] Nullish coalescing: `const port = process.env.PORT ?? 3001`
- [ ] Shorthand properties: `const obj = { name, email }` (when var name matches key)

#### Async JS — critical for frontend API calls
- [ ] Write a Promise from scratch: `new Promise((resolve, reject) => {})`
- [ ] Write `async/await` fetching from an API:
  ```js
  async function getUser(id) {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error('Failed');
    return res.json();
  }
  ```
- [ ] Write try/catch around async function
- [ ] Explain: what happens if you forget `await`? (you get a Promise object, not the value)
- [ ] `Promise.all` — run multiple async calls in parallel:
  ```js
  const [employees, departments] = await Promise.all([
    fetchEmployees(),
    fetchDepartments(),w
  ]);
  ```
- [ ] Explain the event loop in one sentence: "JS is single-threaded; async operations are
  offloaded and their callbacks are queued to run after the current code finishes."

#### Other Must-Knows
- [ ] `===` vs `==` — always use `===` (strict equality, no type coercion)
- [ ] Truthy/falsy values: `0`, `""`, `null`, `undefined`, `NaN`, `false` are falsy
- [ ] Template literals: `` `Hello ${name}` ``
- [ ] `typeof`, `instanceof`
- [ ] Array/object immutability — why you don't mutate state directly in React

### Deliverable
You can write any of these from memory. You can explain them without hesitating.

---

## Phase F2 – React Core (Build Flowlane Frontend)
> **Why now:** Building something real teaches more than any tutorial.
> Your backend API is already running. Wire the frontend to it.
> Every component you build here is a talking point in the interview.

### Setup
- [x] `npm create vite@latest frontend -- --template react`
- [x] `cd frontend && npm install react-router-dom axios`
- [x] Create `frontend/.env`: `VITE_API_URL=http://localhost:3001`
- [x] Create `frontend/.gitignore`: add `node_modules`, `.env`, `dist`
- [x] Run `npm run dev` — confirm Vite dev server starts at `http://localhost:5173`

### Concept: What is a React component
- [ ] Understand: a component is a function that returns JSX
- [ ] Understand: JSX is not HTML — it compiles to `React.createElement()` calls
- [ ] Understand: components re-render when state or props change
- [ ] Write a `Button` component that accepts `label` and `onClick` as props:
  ```jsx
  function Button({ label, onClick }) {
    return <button onClick={onClick}>{label}</button>;
  }
  ```

### useState — local component state
- [ ] Understand: `useState` returns `[value, setter]` — calling setter triggers re-render
- [ ] Build a login form using controlled inputs:
  ```jsx
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // <input value={email} onChange={e => setEmail(e.target.value)} />
  ```
- [ ] Understand: why you never mutate state directly (`state.name = 'x'` is wrong)
- [ ] Build a loading state: `const [loading, setLoading] = useState(false)`
- [ ] Build an error state: `const [error, setError] = useState(null)`

### useEffect — side effects and API calls
- [ ] Understand: runs after render, used for data fetching, subscriptions, timers
- [ ] Understand the dependency array:
  - `[]` — runs once on mount
  - `[id]` — runs when `id` changes
  - no array — runs on every render (rarely what you want)
- [ ] Understand cleanup: return a function from useEffect to cancel subscriptions/timers
- [ ] Write: fetch employees on component mount:
  ```jsx
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/employees');
        if (!cancelled) setEmployees(res.data.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);
  ```

### Axios API Client
- [x] Create `src/api/client.js`:
  ```js
  import axios from 'axios';

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  // Attach token to every request
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Handle 401 globally — clear token and redirect
  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );

  export default api;
  ```
- [ ] Understand: interceptors run on every request/response — good for auth headers and errors
- [ ] Understand: why this is better than writing `Authorization` header in every component

### React Router
- [ ] Install already done — set up routes in `src/main.jsx` or `src/App.jsx`:
  ```jsx
  import { BrowserRouter, Routes, Route } from 'react-router-dom';
  // <BrowserRouter><Routes><Route path="/login" element={<Login />} /></Routes></BrowserRouter>
  ```
- [ ] Understand: `<Link>` vs `<a>` — Link does client-side navigation, `<a>` reloads the page
- [ ] Understand: `useNavigate()` — programmatic navigation after login/logout
- [ ] Understand: `useParams()` — read URL params like `/employees/:id`

### ProtectedRoute Component
- [ ] Create `src/components/ProtectedRoute.jsx`:
  ```jsx
  import { Navigate } from 'react-router-dom';

  function ProtectedRoute({ children }) {
    const token = localStorage.getItem('accessToken');
    if (!token) return <Navigate to="/login" replace />;
    return children;
  }

  export default ProtectedRoute;
  ```
- [ ] Understand: this is a wrapper component — it checks auth before rendering children
- [ ] Wrap dashboard routes: `<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />`

### Login Page
- [ ] Create `src/pages/Login.jsx`:
  - Controlled form: email + password inputs
  - Submit calls `POST /auth/login` via axios
  - On success: store token in localStorage, navigate to `/dashboard`
  - On error: show error message below the form
  - Loading state: disable button while request is pending
  - Show password strength rules hint (you built this in the backend — mention it)

### Dashboard Layout
- [x] Create `src/components/Layout.jsx`:
  - Sidebar: nav links to Employees, Departments
  - Header: show current user email + Logout button
  - Logout: clear localStorage, navigate to `/login`
  - `<Outlet />` from react-router for nested routes

### Employees Page
- [x] Create `src/pages/Employees.jsx`:
  - `useEffect` to fetch `GET /employees` on mount
  - Render employees in an HTML table
  - Loading state: show "Loading..." text while fetching
  - Empty state: show "No employees found" if array is empty
  - Error state: show error message if fetch fails
  - Map over employees array to render rows:
    ```jsx
    {employees.map(emp => (
      <tr key={emp.id}>
        <td>{emp.firstName} {emp.lastName}</td>
        <td>{emp.email}</td>
        <td>{emp.status}</td>
      </tr>
    ))}
    ```

### CSS — enough to not embarrass yourself
- [ ] Understand the box model: content → padding → border → margin
- [ ] Write flexbox layout (sidebar + main):
  ```css
  .layout { display: flex; min-height: 100vh; }
  .sidebar { width: 240px; background: #1e293b; }
  .main { flex: 1; padding: 24px; }
  ```
- [ ] Write a responsive rule with media query:
  ```css
  @media (max-width: 768px) {
    .sidebar { display: none; }
  }
  ```
- [ ] Understand: `position: relative` vs `absolute` vs `fixed`
- [ ] Understand: `z-index` only works on positioned elements

### What you can explain after this phase
- [ ] "What is state in React?" — data that lives in a component and triggers re-renders when changed
- [ ] "What is a prop?" — data passed from parent to child, read-only in the child
- [ ] "What is useEffect?" — runs side effects after render; fetching data, subscriptions
- [ ] "What is the virtual DOM?" — React's in-memory representation of the UI; it diffs against the real DOM and only updates what changed (efficient)
- [ ] "How do you consume a REST API in React?" — axios instance with interceptors, useEffect to fetch on mount, useState to store results
- [ ] "What is a controlled component?" — input whose value is driven by React state, not the DOM
- [ ] "How does routing work in React?" — React Router intercepts navigation, renders matching components without full page reload

### Deliverable
Working frontend: login → protected dashboard → employees table.
You have built and can explain every piece of it.

---

## Phase 1 – Dev Tooling & Code Quality
> **Why now:** Before adding more backend features, lock in code standards.

### ESLint
- [ ] `npm install --save-dev eslint eslint-config-airbnb-base eslint-plugin-import`
- [ ] Create `.eslintrc.json`:
  ```json
  {
    "extends": ["airbnb-base", "prettier"],
    "env": { "node": true, "es2022": true },
    "rules": { "no-console": "warn", "import/extensions": "off" }
  }
  ```
- [ ] Add script: `"lint": "eslint src/"`
- [ ] Run lint — fix all existing warnings and errors

### Prettier
- [ ] `npm install --save-dev prettier eslint-config-prettier`
- [ ] Create `.prettierrc`:
  ```json
  { "singleQuote": true, "semi": true, "tabWidth": 2, "printWidth": 100, "trailingComma": "all" }
  ```
- [ ] Add script: `"format": "prettier --write src/"`
- [ ] Run format on entire codebase

### Git & Node Hygiene
- [ ] Create `.nvmrc`: `20.11.0`
- [ ] Add `"engines": { "node": ">=20.0.0" }` to `package.json`
- [ ] Confirm branch strategy: `main` → `dev` → `feature/name`
- [ ] Confirm `.gitignore` covers `node_modules/`, `.env`, `*.log`, `dist/`
- [ ] Create `.env.example` — document all required vars with placeholder values (commit this)
- [ ] Run `git log --all -- .env` — confirm `.env` was never committed

### Deliverable
Zero lint errors on `main`. Formatting enforced. `.env.example` committed.

---

## Phase 2 – Security & API Hardening
> Lock in security contracts before building more features on top.

### Standardized API Response Format
- [ ] Create `src/utils/response.js`:
  ```js
  const sendSuccess = (res, data, statusCode = 200) =>
    res.status(statusCode).json({ success: true, data });
  const sendError = (res, message, code, statusCode = 400) =>
    res.status(statusCode).json({ success: false, error: { code, message } });
  ```
- [ ] Refactor all controllers to use `sendSuccess` / `sendError`
- [ ] Update `errorHandler.js` to return same envelope

### Error Codes
- [ ] Create `src/utils/errorCodes.js`:
  ```js
  module.exports = {
    AUTH_001: 'AUTH_001',           // Invalid credentials
    AUTH_002: 'AUTH_002',           // Token expired
    AUTH_003: 'AUTH_003',           // Token invalid or missing
    AUTH_004: 'AUTH_004',           // Insufficient role
    AUTH_005: 'AUTH_005',           // Refresh token invalid
    VALIDATION_001: 'VALIDATION_001', // Input validation failed
    NOT_FOUND_001: 'NOT_FOUND_001', // Resource not found
    SERVER_001: 'SERVER_001',       // Internal server error
  };
  ```
- [ ] Update `auth.middleware.js` — `AUTH_002` for expired, `AUTH_003` for missing/invalid
- [ ] Update `errorHandler.js` — `SERVER_001` for unhandled errors

### Environment Validation at Startup
- [ ] Create `src/config/validateEnv.js` — validate all required vars with Zod at startup
- [ ] Required: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `NODE_ENV`, `CORS_ORIGIN`
- [ ] On failure: log missing vars and `process.exit(1)` — server refuses to start
- [ ] Call `validateEnv()` as first line of `server.js`

### Refresh Token Implementation
- [ ] Add `refreshToken String? @unique` to `User` in `schema.prisma`
- [ ] Run `npx prisma migrate dev --name add_refresh_token`
- [ ] Update `loginUser()`:
  - Generate: `crypto.randomBytes(64).toString('hex')`
  - Hash with bcrypt (10 rounds) before storing
  - Return raw `accessToken` (15m) + raw `refreshToken` (30d)
- [ ] `POST /auth/refresh` — validate, issue new access token, rotate refresh token
- [ ] `POST /auth/logout` — set `refreshToken = null` in DB
- [ ] Update `02-DECISIONS.md` with refresh token entry

### Rate Limiting
- [ ] `npm install express-rate-limit`
- [ ] Create `src/middleware/rateLimiter.js` — max 10 req / 15min per IP
- [ ] Apply to: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`

### Request Logger + CORS Hardening
- [ ] Create `src/middleware/requestLogger.js` — log method, path, status, duration
- [ ] Move CORS origin to `CORS_ORIGIN` env var, restrict methods, add `credentials: true`

### Deliverable
No known auth security gaps. Consistent response format. Server fails fast on bad config.

---

## Phase 3 – Infrastructure & CI/CD
> Docker and CI before feature complexity grows.

### Structured Logging
- [ ] `npm install pino pino-pretty`
- [ ] Create `src/utils/logger.js` — JSON in production, pretty in development
- [ ] Replace all `console.log` / `console.error` in `src/` with logger calls

### Docker
- [ ] Create `backend/Dockerfile`:
  ```dockerfile
  FROM node:20-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY . .
  EXPOSE 3001
  CMD ["node", "src/server.js"]
  ```
- [ ] Create `backend/.dockerignore`: `node_modules`, `.env`, `*.log`, `.git`, `coverage`
- [ ] Create `docker-compose.yml` in project root — `api` + `db` services with healthcheck
- [ ] Test: `docker-compose up --build` → `/health/live` and `/health/ready` both return 200

### GitHub Actions CI
- [ ] Create `.github/workflows/ci.yml` — triggers on push/PR to `main` and `dev`:
  - Checkout → setup Node (from `.nvmrc`) → `npm ci` → `npm run lint` → verify app loads
- [ ] Push to `dev` — confirm green in Actions tab
- [ ] Introduce lint error — confirm CI fails

### Deliverable
Every push to `main`/`dev` linted and validated. Containerized and working in Docker.

---

## Phase 4 – Multi-Tenant SaaS Core
> Design tenant isolation before modeling HR data — retrofitting is very hard.

### Data Model — Company
- [ ] Add `Company` model to `schema.prisma` (id, name, slug unique, deletedAt, timestamps)
- [ ] Add `companyId Int?` to `User` model (nullable for migration safety)
- [ ] Add `super_admin` to `Role` enum
- [ ] Run `npx prisma migrate dev --name add_company_and_super_admin`

### Tenant Middleware & Guard
- [ ] Create `src/middleware/tenant.middleware.js` — attach `req.companyId` from `req.user`
- [ ] Create `src/utils/assertTenant.js` — throw 403 if resource companyId !== req.companyId
- [ ] Document in `02-DECISIONS.md`: all service functions receive `companyId` as first argument

### Company Endpoints (super_admin only)
- [ ] `POST /companies`, `GET /companies`, `GET /companies/:id`, `PATCH /companies/:id`, `DELETE /companies/:id`
- [ ] Soft delete only — set `deletedAt`, never hard delete

### Audit Log
- [ ] Add `AuditLog` model (companyId, actorId, action, entity, entityId, metadata, createdAt)
- [ ] Run `npx prisma migrate dev --name add_audit_log`
- [ ] Create `src/services/audit.service.js` — `logAction({ companyId, actorId, action, entity, entityId, metadata })`
- [ ] Add audit calls in: register, login, company CRUD
- [ ] `GET /companies/:id/audit` — paginated (admin + super_admin only)

### Deliverable
True multi-tenant architecture. Every query company-scoped. Cross-tenant access blocked.

---

## Phase 5 – Core HR Module (Bachelor MVP)
> Build on the solid foundation. Backend + complete frontend.

### Backend — Employee Module
- [ ] Add `Employee` model (companyId, firstName, lastName, email, phone, position, departmentId, startDate, status, deletedAt, timestamps)
- [ ] `@@unique([companyId, email])`
- [ ] Run `npx prisma migrate dev --name add_employee`
- [ ] `employee.service.js`: createEmployee, listEmployees (paginated), getEmployee, updateEmployee, deactivateEmployee
- [ ] Routes: POST, GET, GET/:id, PATCH/:id, DELETE/:id — all with `requireAuth`, `requireRole`, `tenantMiddleware`
- [ ] Audit calls: `EMPLOYEE_CREATED`, `EMPLOYEE_UPDATED`, `EMPLOYEE_DEACTIVATED`

### Backend — Department Module
- [ ] Add `Department` model (companyId, name, managerId, timestamps) — `@@unique([companyId, name])`
- [ ] Run `npx prisma migrate dev --name add_department`
- [ ] `department.service.js`: CRUD + include employee count + guard delete if active employees
- [ ] Routes: POST, GET, GET/:id, PATCH/:id, DELETE/:id

### Pagination Utility
- [ ] Create `src/utils/pagination.js` — `parsePagination(query)` and `paginatedResponse(data, total, page, limit)`
- [ ] Response shape: `{ data: [], meta: { total, page, limit, totalPages } }`

### Frontend — Complete the UI
> By this point you already have login + protected routes + employees table from Phase F2.
> Now complete the full CRUD interface.

- [ ] Add `@tanstack/react-query` for server state management:
  - `useQuery` to fetch and cache data
  - `useMutation` to create/update/delete with automatic refetch
- [ ] Employees page — add:
  - [ ] Pagination controls (previous/next, page X of Y)
  - [ ] Status filter dropdown (All / Active / Inactive)
  - [ ] Create employee modal — form + validation + POST `/employees`
  - [ ] Edit employee modal — pre-populated + PATCH `/employees/:id`
  - [ ] Deactivate button + confirmation dialog
- [ ] Departments page — full CRUD:
  - [ ] Table with employee count per department
  - [ ] Create department modal
  - [ ] Edit department modal
  - [ ] Delete — disabled with tooltip if active employees assigned
- [ ] Dashboard home — summary cards:
  - [ ] Total employees count
  - [ ] Active employees count
  - [ ] Departments count
- [ ] Register page — form + password rules displayed + POST `/auth/register`

### README Update
- [ ] Add ASCII architecture diagram: `Browser → React → Express API → PostgreSQL`
- [ ] Add complete API endpoint table (method, path, auth required, role, description)
- [ ] Add Docker setup section: `docker-compose up --build`
- [ ] Add "About this project" paragraph (3–4 sentences for a recruiter skimming GitHub)
- [ ] Add screenshot of the dashboard (even a basic one)
- [ ] Replace "Planned Improvements" section with link to `docs/00-ROADMAP.md`

### Deliverable
Full-stack working HR MVP. Demonstrable end-to-end in a browser.
Register → login → employees table → create employee → create department.

---

## ⭐ CV MILESTONE — Reached After Phase 5

**Write this on your CV / LinkedIn / tell this in interviews:**

```
Flowlane – HR Operations SaaS                                       2026
Node.js · Express · PostgreSQL · Prisma · JWT · React · Docker · Azure

• Built a full-stack multi-tenant SaaS HR system from scratch —
  layered backend architecture (Routes → Controllers → Services → ORM)
  with a React frontend consuming the REST API
• Stateless JWT authentication with refresh token rotation
  (15m access / 30d refresh), RBAC with company-scoped role enforcement
• Multi-tenant data isolation — all queries scoped to companyId,
  cross-tenant access blocked at middleware level
• Employee and Department CRUD with pagination, filtering, soft deletes,
  and input validation on all endpoints
• Audit logging for all mutating actions (actor, action, entity, timestamp)
• Containerized with Docker + docker-compose; CI pipeline with GitHub
  Actions (lint + build gate on every push)
• Deployed to Azure App Service with Azure PostgreSQL
```

**For the Maersk interview specifically, lead with:**
"I built the entire stack myself — Express backend with JWT auth and multi-tenant
data isolation, and a React frontend that consumes it. I can walk you through
any layer of the architecture."

---

## Phase 6 – Tests
> Write tests after the data model stabilizes. Testing a moving schema wastes time.

### Setup
- [ ] `npm install --save-dev jest supertest cross-env`
- [ ] Configure Jest in `package.json` with `testEnvironment: node` and coverage threshold 60%
- [ ] Create `backend/.env.test` — separate `flowlane_test` database
- [ ] Add `"pretest": "cross-env NODE_ENV=test npx prisma migrate deploy"`

### Unit Tests — `auth.service.test.js`
- [ ] `registerUser` — creates user, hashes password (hash !== plaintext)
- [ ] `registerUser` — throws on duplicate email
- [ ] `loginUser` — returns `{ accessToken, refreshToken, user }` on valid credentials
- [ ] `loginUser` — throws `AUTH_001` on wrong password
- [ ] `loginUser` — throws `AUTH_001` on non-existent email (no user enumeration)

### Unit Tests — `auth.validators.test.js`
- [ ] Valid password passes all rules
- [ ] Password under 10 chars fails
- [ ] Password without uppercase / number / special char fails
- [ ] Email is trimmed and lowercased

### Integration Tests — `auth.integration.test.js`
- [ ] Register valid → 201
- [ ] Register weak password → 400 `VALIDATION_001`
- [ ] Register duplicate email → 409
- [ ] Login valid → 200 with `accessToken` + `refreshToken`
- [ ] Login wrong password → 401 `AUTH_001`
- [ ] `GET /auth/me` valid token → 200
- [ ] `GET /auth/me` no token → 401 `AUTH_003`
- [ ] `GET /auth/me` expired token → 401 `AUTH_002`
- [ ] `GET /admin/ping` as employee → 403 `AUTH_004`
- [ ] `POST /auth/refresh` valid → 200 new access token
- [ ] `POST /auth/logout` → 200, refresh token nulled in DB

### Integration Tests — `tenant.integration.test.js`
- [ ] Company A user `GET /employees` → only Company A results
- [ ] Company A user `GET /employees/:id` for Company B employee → 404 (not 403)
- [ ] Admin `POST /employees` → creates in own company only
- [ ] Admin `DELETE /employees/:id` for other company → 404

### CI Update
- [ ] Add test step to GitHub Actions with PostgreSQL service container
- [ ] CI fails on test failure or coverage below 60%

### Deliverable
Critical auth and tenant isolation covered. CI fails on regressions.

---

## Phase 7 – Cloud Deployment
> A live URL closes the deal in interviews. Everything is ready — ship it.

### Azure Setup
- [ ] Create Azure account (student credits: azure.microsoft.com/free/students)
- [ ] Create Resource Group: `flowlane-rg`
- [ ] Create Azure Database for PostgreSQL Flexible Server (`flowlane-db`, PostgreSQL 16)
- [ ] Create Azure Container Registry: `flowlaneregistry`
- [ ] Create Azure App Service — Docker Container, Linux, B1 Basic, West Europe

### Environment & Migration
- [ ] Set all env vars in App Service → Configuration (never in code or Docker image)
- [ ] Use `npx prisma migrate deploy` in production (never `migrate dev`)
- [ ] Startup command: `npx prisma migrate deploy && node src/server.js`

### Deployment Pipeline — add to `.github/workflows/ci.yml`
- [ ] Deploy job triggers on push to `main` only, after CI passes
- [ ] Steps: login to ACR → build + push Docker image → deploy to App Service
- [ ] Add secrets: `ACR_USERNAME`, `ACR_PASSWORD`, `AZURE_CREDENTIALS`

### Verification
- [ ] `/health/live` → 200 on production URL
- [ ] `/health/ready` → 200 (DB connected)
- [ ] Register + login + `/auth/me` works end-to-end on production
- [ ] No stack traces in responses (`NODE_ENV=production`)
- [ ] Logs visible in App Service → Log Stream

### README Final
- [ ] Add production URL as badge at top
- [ ] Add "Live Demo" section with pre-seeded test credentials
- [ ] Add deployment architecture diagram

### Deliverable
Live URL. Full pipeline: push to `main` → lint → test → Docker → Azure → health check.

---

## Optional Extensions (If Time Allows)

- [ ] **Password Reset** — forgot-password + reset with time-limited hashed token
- [ ] **Leave Request Workflow** — submit/approve/reject, manager role
- [ ] **Attendance Tracking** — clock-in/out, daily records
- [ ] **File Storage** — employee docs via Azure Blob, presigned upload URLs
- [ ] **Email Notifications** — SendGrid (welcome email, password reset)
- [ ] **API Versioning** — `/api/v1/` prefix
- [ ] **Swagger Docs** — OpenAPI spec at `/api/docs`
- [ ] **Frontend Deployment** — Vercel (free tier, zero config for React)
- [ ] **Vue port** — if Maersk moves forward, rewrite the frontend in Vue 3 (same concepts, different syntax)

---

## Long-Term Vision (Post-Bachelor)

- Subscription & billing (Stripe, per-seat pricing)
- Event-driven architecture (audit events via message queues)
- Read replicas for scaling
- SOC2 / GDPR preparation (data retention, right to erasure)
- Performance monitoring (Azure Monitor or Datadog)
- Field-level diff tracking in audit logs
- Multi-region deployment

---

## Phase Completion Tracker

| Phase | Name | Status | Priority For Maersk |
|-------|------|--------|---------------------|
| 0 | Foundation | ✅ Done | — |
| F1 | JS Fundamentals | ⬜ | 🔴 Do first — interview survival |
| F2 | React Core + Frontend | ⬜ | 🔴 Do second — your demo |
| 1 | Dev Tooling | ⬜ | 🟡 Before more backend code |
| 2 | Security & API Hardening | ⬜ | 🟡 Notable for CV |
| 3 | Infrastructure & CI/CD | ⬜ | 🟡 Green flag for reviewers |
| 4 | Multi-Tenant Core | ⬜ | 🟢 Very high CV value |
| 5 | Core HR Module + Full Frontend | ⬜ | 🟢 Full-stack demonstrable |
| ⭐ | CV MILESTONE | — | Claim it here |
| 6 | Tests | ⬜ | 🟢 Separates serious projects |
| 7 | Cloud Deployment | ⬜ | 🟢 Live URL closes the deal |