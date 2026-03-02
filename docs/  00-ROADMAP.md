# Flowlane – Unified Roadmap
### Bachelor Project · CV Piece · Commercial SaaS Base

**Goal:** Build a multi-tenant HR Operations SaaS backend using production-grade engineering
practices, cloud deployment, and scalable architecture.

**Author:** Illia Savytskyi  
**Stack:** Node.js · Express · PostgreSQL · Prisma · JWT · Zod · bcrypt · Helmet · React · Docker · Azure

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

## Phase 1 – Dev Tooling & Code Quality
> **Why now:** Every line written without a linter is future debt. Tooling must exist before features.

### ESLint
- [ ] `npm install --save-dev eslint eslint-config-airbnb-base eslint-plugin-import`
- [ ] Create `.eslintrc.json`:
  ```json
  {
    "extends": ["airbnb-base", "prettier"],
    "env": { "node": true, "es2022": true },
    "rules": {
      "no-console": "warn",
      "import/extensions": "off"
    }
  }
  ```
- [ ] Add script to `package.json`: `"lint": "eslint src/"`
- [ ] Run `npm run lint` — fix all existing warnings and errors

### Prettier
- [ ] `npm install --save-dev prettier eslint-config-prettier`
- [ ] Create `.prettierrc`:
  ```json
  {
    "singleQuote": true,
    "semi": true,
    "tabWidth": 2,
    "printWidth": 100,
    "trailingComma": "all"
  }
  ```
- [ ] Add script: `"format": "prettier --write src/"`
- [ ] Run `npm run format` on entire codebase

### Node Version Pinning
- [ ] Create `.nvmrc` in project root: `20.11.0`
- [ ] Add to `package.json`: `"engines": { "node": ">=20.0.0" }`

### Git Hygiene
- [ ] Establish and document branch strategy: `main` → `dev` → `feature/name`
- [ ] Confirm `.gitignore` covers: `node_modules/`, `.env`, `*.log`, `dist/`
- [ ] Run `git log --all -- .env` — confirm `.env` was never committed
- [ ] Create `.env.example` (commit this — documents required vars with placeholder values)

### Deliverable
Zero lint errors on `main`. Consistent formatting enforced. Branch strategy active.

---

## Phase 2 – Security & API Hardening
> **Why now:** Response contracts and auth security must be locked in before building features on top.

### Standardized API Response Format
- [ ] Define and document the response envelope:
  - Success: `{ success: true, data: { ... } }`
  - Error: `{ success: false, error: { code: "AUTH_001", message: "..." } }`
- [ ] Create `src/utils/response.js`:
  ```js
  const sendSuccess = (res, data, statusCode = 200) =>
    res.status(statusCode).json({ success: true, data });

  const sendError = (res, message, code, statusCode = 400) =>
    res.status(statusCode).json({ success: false, error: { code, message } });
  ```
- [ ] Refactor `auth.controller.js` (register, login, me) to use helpers
- [ ] Refactor `admin.controller.js` (ping) to use helpers
- [ ] Update `errorHandler.js` to return same envelope format

### Error Codes
- [ ] Create `src/utils/errorCodes.js`:
  ```js
  module.exports = {
    AUTH_001: 'AUTH_001',       // Invalid credentials
    AUTH_002: 'AUTH_002',       // Token expired
    AUTH_003: 'AUTH_003',       // Token invalid or missing
    AUTH_004: 'AUTH_004',       // Insufficient role
    AUTH_005: 'AUTH_005',       // Refresh token invalid
    VALIDATION_001: 'VALIDATION_001', // Input validation failed
    NOT_FOUND_001: 'NOT_FOUND_001',   // Resource not found
    SERVER_001: 'SERVER_001',         // Internal server error
  };
  ```
- [ ] Update `auth.middleware.js` — use `AUTH_002` for expired, `AUTH_003` for invalid/missing
- [ ] Update `errorHandler.js` — use `SERVER_001` for unhandled errors
- [ ] Update all auth service throws to include the relevant error code

### Environment Validation at Startup
- [ ] Create `src/config/validateEnv.js`:
  - Validate with Zod: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `NODE_ENV`, `CORS_ORIGIN`
  - On failure: log the missing vars and `process.exit(1)`
- [ ] Call `validateEnv()` as the first line of `server.js` before anything else
- [ ] Add `JWT_REFRESH_SECRET` and `CORS_ORIGIN` to `.env` and `.env.example`

### Refresh Token Implementation
- [ ] Add `refreshToken String? @unique` to `User` model in `schema.prisma`
- [ ] Run `npx prisma migrate dev --name add_refresh_token`
- [ ] In `auth.service.js` — update `loginUser()`:
  - Generate refresh token: `crypto.randomBytes(64).toString('hex')`
  - Hash it with bcrypt (10 rounds) before storing in DB
  - Return both `accessToken` (15m TTL) and raw `refreshToken` (30d TTL) in response
- [ ] Create `POST /auth/refresh`:
  - Accept `{ refreshToken }` in request body
  - Find candidate users, bcrypt-compare hashed token to find match
  - Issue new access token
  - Rotate: generate new refresh token, hash and store, return new raw token
- [ ] Create `POST /auth/logout`:
  - Require `requireAuth` middleware
  - Set `refreshToken = null` in DB for authenticated user
  - Return `{ success: true, data: { message: "Logged out" } }`
- [ ] Shorten access token TTL to `15m` in `JWT_EXPIRES_IN`
- [ ] Update `02-DECISIONS.md` with refresh token decision entry

### Rate Limiting
- [ ] `npm install express-rate-limit`
- [ ] Create `src/middleware/rateLimiter.js`:
  ```js
  const { rateLimit } = require('express-rate-limit');
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_001', message: 'Too many requests, try again later.' } },
  });
  module.exports = { authLimiter };
  ```
- [ ] Apply `authLimiter` to: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- [ ] Do NOT apply to `/health/*` or read-only routes

### Request Logger Middleware
- [ ] Create `src/middleware/requestLogger.js`:
  - Use `res.on('finish', ...)` to capture status code after response is sent
  - Log: `[TIMESTAMP] METHOD /path STATUS_CODE Xms`
- [ ] Mount in `app.js` before all route definitions

### CORS Hardening
- [ ] Move allowed origin to `CORS_ORIGIN` env var
- [ ] Update CORS config: restrict methods, allow credentials, set `allowedHeaders`

### Deliverable
No known auth security gaps. Consistent response format. Rate limiting active.
Refresh token rotation working. Server fails fast on missing config.

---

## Phase 3 – Infrastructure & CI/CD
> **Why now:** Docker and CI must wrap the project before feature complexity grows.
> Retrofitting containerization after 3 more phases of code is painful.

### Structured Logging (replaces console.log)
- [ ] `npm install pino pino-pretty`
- [ ] Create `src/utils/logger.js`:
  ```js
  const pino = require('pino');
  module.exports = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  });
  ```
- [ ] Replace every `console.log` in `src/` with `logger.info()`
- [ ] Replace every `console.error` with `logger.error()`
- [ ] Update `requestLogger.js` to use pino logger
- [ ] Add `logger.error({ err }, 'Unhandled error')` in `errorHandler.js`

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
- [ ] Create `backend/.dockerignore`:
  ```
  node_modules
  .env
  *.log
  .git
  coverage
  ```
- [ ] Create `docker-compose.yml` in project root:
  ```yaml
  services:
    api:
      build: ./backend
      ports: ["3001:3001"]
      env_file: ./backend/.env
      environment:
        DATABASE_URL: postgresql://flowlane:flowlane_dev_password@db:5432/flowlane_dev
      depends_on:
        db:
          condition: service_healthy
    db:
      image: postgres:16-alpine
      environment:
        POSTGRES_USER: flowlane
        POSTGRES_PASSWORD: flowlane_dev_password
        POSTGRES_DB: flowlane_dev
      volumes:
        - postgres_data:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U flowlane"]
        interval: 5s
        timeout: 5s
        retries: 5
  volumes:
    postgres_data:
  ```
- [ ] Test: `docker-compose up --build`
- [ ] Verify: `GET /health/live` → 200 inside Docker
- [ ] Verify: `GET /health/ready` → 200 (DB connected through Docker network)
- [ ] Verify: register + login flow works end-to-end inside Docker

### GitHub Actions CI
- [ ] Create `.github/workflows/ci.yml`:
  ```yaml
  name: CI
  on:
    push:
      branches: [main, dev]
    pull_request:
      branches: [main, dev]
  jobs:
    lint-and-build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version-file: .nvmrc
            cache: npm
            cache-dependency-path: backend/package-lock.json
        - run: npm ci
          working-directory: backend
        - run: npm run lint
          working-directory: backend
        - name: Verify app loads without error
          working-directory: backend
          run: node -e "require('./src/app')"
          env:
            DATABASE_URL: postgresql://dummy:dummy@localhost:5432/dummy
            JWT_SECRET: ci-secret
            JWT_REFRESH_SECRET: ci-refresh-secret
            JWT_EXPIRES_IN: 15m
            PORT: 3001
            NODE_ENV: test
            CORS_ORIGIN: http://localhost:3000
  ```
- [ ] Push to `dev` — verify CI passes in GitHub Actions tab
- [ ] Introduce a lint error intentionally — verify CI fails

### Deliverable
Fully containerized. Every push to `main`/`dev` linted and validated by CI.
Structured JSON logs in production. Human-readable pretty logs in development.

---

## Phase 4 – Multi-Tenant SaaS Core
> **Why now:** Tenant isolation must be designed before HR data is modeled.
> Retrofitting multi-tenancy after building Employee/Department is one of the hardest refactors in SaaS.

### Data Model — Company
- [ ] Add `Company` model to `schema.prisma`:
  ```prisma
  model Company {
    id          Int        @id @default(autoincrement())
    name        String
    slug        String     @unique
    deletedAt   DateTime?
    createdAt   DateTime   @default(now())
    updatedAt   DateTime   @updatedAt
    users       User[]
  }
  ```
- [ ] Update `User` model: add `companyId Int?` (nullable for migration safety)
- [ ] Add `super_admin` to `Role` enum
- [ ] Run `npx prisma migrate dev --name add_company_and_super_admin`
- [ ] Update `02-DECISIONS.md` with multi-tenancy decision entry

### Tenant Middleware
- [ ] Create `src/middleware/tenant.middleware.js`:
  - After `requireAuth`, attach `req.companyId` from `req.user.companyId`
  - If no `companyId` and role is not `super_admin`, return 403 with `AUTH_004`
- [ ] Create `src/utils/assertTenant.js`:
  ```js
  const assertSameTenant = (req, resourceCompanyId) => {
    if (req.companyId !== resourceCompanyId) {
      const err = new Error('Access denied');
      err.statusCode = 403;
      err.code = 'AUTH_004';
      throw err;
    }
  };
  ```
- [ ] Document rule in `02-DECISIONS.md`: "All service functions receive companyId as the first argument. Queries without companyId are forbidden."

### Company Endpoints (super_admin only)
- [ ] Create `src/validators/company.validators.js` — Zod schemas for create + update
- [ ] Create `src/services/company.service.js`:
  - `createCompany(data)` — validate slug is URL-safe (`/^[a-z0-9-]+$/`)
  - `listCompanies({ page, limit })` — paginated, exclude soft-deleted
  - `getCompany(id)` — throw `NOT_FOUND_001` if not found
  - `updateCompany(id, data)`
  - `deleteCompany(id)` — soft delete only (set `deletedAt`, never hard delete)
- [ ] Create `src/controllers/company.controller.js`
- [ ] Create `src/routes/company.routes.js`:
  - `POST /companies` — `requireAuth`, `requireRole('super_admin')`
  - `GET /companies` — `requireAuth`, `requireRole('super_admin')`
  - `GET /companies/:id` — `requireAuth`, `requireRole('super_admin')`
  - `PATCH /companies/:id` — `requireAuth`, `requireRole('super_admin')`
  - `DELETE /companies/:id` — `requireAuth`, `requireRole('super_admin')`
- [ ] Register routes in `app.js`

### Audit Log
- [ ] Add `AuditLog` model to `schema.prisma`:
  ```prisma
  model AuditLog {
    id        Int      @id @default(autoincrement())
    companyId Int
    actorId   Int
    action    String
    entity    String
    entityId  Int?
    metadata  Json?
    createdAt DateTime @default(now())
    company   Company  @relation(fields: [companyId], references: [id])
  }
  ```
- [ ] Run `npx prisma migrate dev --name add_audit_log`
- [ ] Create `src/services/audit.service.js`:
  ```js
  const logAction = ({ companyId, actorId, action, entity, entityId, metadata }) =>
    prisma.auditLog.create({ data: { companyId, actorId, action, entity, entityId, metadata } });
  ```
- [ ] Add audit calls in:
  - `auth.service.js` → `registerUser()`: action `USER_REGISTERED`, entity `User`
  - `auth.service.js` → `loginUser()`: action `USER_LOGIN`, entity `User`
  - `company.service.js` → create/update/delete: `COMPANY_CREATED`, `COMPANY_UPDATED`, `COMPANY_DELETED`
- [ ] `GET /companies/:id/audit` — paginated audit log (admin + super_admin only)

### Deliverable
True SaaS-ready multi-tenant architecture. Every query is company-scoped.
Cross-tenant data access blocked at middleware level.

---

## Phase 5 – Core HR Module (Bachelor MVP)
> Foundation is solid. Multi-tenancy is in. Now build the actual features.

### Backend — Employee Module
- [ ] Add `Employee` and `EmployeeStatus` to `schema.prisma`:
  ```prisma
  model Employee {
    id           Int            @id @default(autoincrement())
    companyId    Int
    firstName    String
    lastName     String
    email        String
    phone        String?
    position     String?
    departmentId Int?
    startDate    DateTime?
    status       EmployeeStatus @default(ACTIVE)
    deletedAt    DateTime?
    createdAt    DateTime       @default(now())
    updatedAt    DateTime       @updatedAt
    company      Company        @relation(fields: [companyId], references: [id])
    department   Department?    @relation(fields: [departmentId], references: [id])

    @@unique([companyId, email])
  }

  enum EmployeeStatus { ACTIVE INACTIVE }
  ```
- [ ] Run `npx prisma migrate dev --name add_employee`
- [ ] Create `src/validators/employee.validators.js` — Zod schemas for create + update
- [ ] Create `src/services/employee.service.js`:
  - `createEmployee(companyId, data)` — validate unique email per company
  - `listEmployees(companyId, { page, limit, status, departmentId })` — paginated
  - `getEmployee(companyId, employeeId)` — throw `NOT_FOUND_001` if not found or wrong tenant
  - `updateEmployee(companyId, employeeId, data)` — validate tenant, update fields
  - `deactivateEmployee(companyId, employeeId)` — set `status = INACTIVE`, set `deletedAt`
- [ ] Create `src/controllers/employee.controller.js`
- [ ] Create `src/routes/employee.routes.js`:
  - `POST /employees` — `requireAuth`, `requireRole('admin')`, `tenantMiddleware`
  - `GET /employees` — `requireAuth`, `requireRole('admin', 'employee')`, `tenantMiddleware`
  - `GET /employees/:id` — `requireAuth`, `requireRole('admin', 'employee')`, `tenantMiddleware`
  - `PATCH /employees/:id` — `requireAuth`, `requireRole('admin')`, `tenantMiddleware`
  - `DELETE /employees/:id` — `requireAuth`, `requireRole('admin')`, `tenantMiddleware`
- [ ] Register routes in `app.js`
- [ ] Add audit log calls: `EMPLOYEE_CREATED`, `EMPLOYEE_UPDATED`, `EMPLOYEE_DEACTIVATED`

### Backend — Department Module
- [ ] Add `Department` to `schema.prisma`:
  ```prisma
  model Department {
    id        Int        @id @default(autoincrement())
    companyId Int
    name      String
    managerId Int?
    createdAt DateTime   @default(now())
    updatedAt DateTime   @updatedAt
    company   Company    @relation(fields: [companyId], references: [id])
    employees Employee[]

    @@unique([companyId, name])
  }
  ```
- [ ] Run `npx prisma migrate dev --name add_department`
- [ ] Create `src/validators/department.validators.js`
- [ ] Create `src/services/department.service.js`:
  - `createDepartment(companyId, data)`
  - `listDepartments(companyId)` — include `_count: { employees: true }` in query
  - `getDepartment(companyId, departmentId)` — with employees list
  - `updateDepartment(companyId, departmentId, data)`
  - `deleteDepartment(companyId, departmentId)` — throw error if active employees assigned
- [ ] Create `src/controllers/department.controller.js`
- [ ] Create `src/routes/department.routes.js`:
  - `POST /departments` — `requireAuth`, `requireRole('admin')`, `tenantMiddleware`
  - `GET /departments` — `requireAuth`, `requireRole('admin', 'employee')`, `tenantMiddleware`
  - `GET /departments/:id` — `requireAuth`, `requireRole('admin', 'employee')`, `tenantMiddleware`
  - `PATCH /departments/:id` — `requireAuth`, `requireRole('admin')`, `tenantMiddleware`
  - `DELETE /departments/:id` — `requireAuth`, `requireRole('admin')`, `tenantMiddleware`
- [ ] Register routes in `app.js`

### Pagination Utility
- [ ] Create `src/utils/pagination.js`:
  ```js
  const parsePagination = (query) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    return { page, limit, skip: (page - 1) * limit };
  };

  const paginatedResponse = (data, total, page, limit) => ({
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });

  module.exports = { parsePagination, paginatedResponse };
  ```
- [ ] Use in `employee.service.js` and any future list endpoints

### README Update
- [ ] Add ASCII architecture diagram showing frontend → API → DB
- [ ] Add complete API endpoint reference table (method, path, auth, role, description)
- [ ] Add Docker setup section: `docker-compose up --build`
- [ ] Add "About this project" paragraph (3–4 sentences for a recruiter who skims)
- [ ] Update "Current System Status" to reflect Phase 5 completion
- [ ] Replace "Planned Improvements" with link to `docs/00-ROADMAP.md`

### Frontend — React + Vite
- [ ] `npm create vite@latest frontend -- --template react`
- [ ] `cd frontend && npm install react-router-dom axios @tanstack/react-query`
- [ ] Create `frontend/.env`: `VITE_API_URL=http://localhost:3001`
- [ ] Create `src/api/client.js` — axios instance:
  - Base URL from `VITE_API_URL`
  - Request interceptor: attach `Authorization: Bearer <token>` from storage
  - Response interceptor: on 401 → clear token and redirect to `/login`
- [ ] Auth pages:
  - [ ] `/login` — email + password form, POST to `/auth/login`, store token + refresh token
  - [ ] `/register` — form with password rules displayed, POST to `/auth/register`
  - [ ] Redirect to `/dashboard` on successful auth
- [ ] `ProtectedRoute` wrapper component — redirect to `/login` if no valid token
- [ ] Dashboard layout:
  - [ ] Sidebar with nav links: Dashboard, Employees, Departments
  - [ ] Header with current user name + role badge + logout button
  - [ ] Logout calls `POST /auth/logout`, clears tokens, redirects to `/login`
- [ ] Employees page:
  - [ ] Table: name, email, position, department, status, actions column
  - [ ] Pagination controls (previous/next, page indicator, items per page)
  - [ ] Status filter dropdown (All / Active / Inactive)
  - [ ] Create employee modal with validated form
  - [ ] Edit employee modal (pre-populated fields)
  - [ ] Deactivate button with confirmation dialog ("Are you sure?")
- [ ] Departments page:
  - [ ] Table: name, manager, employee count, actions
  - [ ] Create department modal
  - [ ] Edit department modal
  - [ ] Delete button — disabled with tooltip if department has active employees

### Deliverable
Working full-stack HR management MVP. Demonstrable end-to-end:
register → login → create company → add employees → assign departments → view audit log.

---

## ⭐ CV MILESTONE — Reached After Phase 5

**You can now credibly write this on your CV:**

```
Flowlane – HR Operations SaaS                                       2026
Node.js · Express · PostgreSQL · Prisma · JWT · React · Docker · Azure

• Built a multi-tenant SaaS HR backend from scratch using layered
  architecture (Routes → Controllers → Services → ORM)
• Stateless JWT authentication with refresh token rotation (15m access /
  30d refresh), RBAC with company-scoped role enforcement
• Multi-tenant data isolation — all queries scoped to companyId,
  cross-tenant access blocked at middleware level
• Employee and Department CRUD with pagination, filtering, soft deletes,
  and Zod input validation on all inputs
• Audit logging for all mutating actions (actor, action, entity, timestamp)
• Containerized with Docker + docker-compose; CI pipeline with GitHub
  Actions (lint + build gate on every push to main/dev)
• Deployed to Azure App Service with Azure PostgreSQL
```

**What makes this stand out vs typical junior projects:**
- Multi-tenancy — most juniors never build this
- Refresh token rotation — most skip this and leave a real security gap
- Audit logging — shows enterprise-level thinking
- Documented architectural decisions with explicit tradeoffs
- CI pipeline active from day one, not retrofitted at the end
- Deployed and live with a URL you can share

---

## Phase 6 – Tests
> **Why after MVP:** Write tests after the data model stabilizes.
> Testing a moving schema wastes time. Testing stable contracts protects them.

### Setup
- [ ] `npm install --save-dev jest supertest`
- [ ] Add to `package.json`:
  ```json
  "jest": {
    "testEnvironment": "node",
    "coverageThreshold": { "global": { "lines": 60 } }
  }
  ```
- [ ] Add scripts: `"test": "jest --coverage"` and `"test:watch": "jest --watch"`
- [ ] Create `backend/.env.test` with test database credentials (separate DB: `flowlane_test`)
- [ ] Create `flowlane_test` PostgreSQL database
- [ ] Add `"pretest": "cross-env NODE_ENV=test npx prisma migrate deploy"` script
- [ ] `npm install --save-dev cross-env`

### Unit Tests — `src/services/auth.service.test.js`
- [ ] `registerUser` — creates user with hashed password (hash !== plaintext)
- [ ] `registerUser` — throws on duplicate email within same company
- [ ] `loginUser` — returns `{ accessToken, refreshToken, user }` on valid credentials
- [ ] `loginUser` — throws `AUTH_001` on wrong password
- [ ] `loginUser` — throws `AUTH_001` on non-existent email (same error — no user enumeration)

### Unit Tests — `src/validators/auth.validators.test.js`
- [ ] Valid password (10+ chars, all rules met) passes
- [ ] Password under 10 chars fails
- [ ] Password without uppercase fails
- [ ] Password without number fails
- [ ] Password without special character fails
- [ ] Email is trimmed and lowercased before validation

### Integration Tests — `tests/auth.integration.test.js`
- [ ] `POST /auth/register` valid data → 201, returns token and user object
- [ ] `POST /auth/register` weak password → 400, `VALIDATION_001`
- [ ] `POST /auth/register` duplicate email → 409
- [ ] `POST /auth/login` valid credentials → 200, returns `accessToken` + `refreshToken`
- [ ] `POST /auth/login` wrong password → 401, `AUTH_001`
- [ ] `GET /auth/me` with valid token → 200, returns user
- [ ] `GET /auth/me` without token → 401, `AUTH_003`
- [ ] `GET /auth/me` with expired token → 401, `AUTH_002`
- [ ] `GET /admin/ping` as employee → 403, `AUTH_004`
- [ ] `GET /admin/ping` as admin → 200
- [ ] `POST /auth/refresh` valid refresh token → 200, new access token returned
- [ ] `POST /auth/refresh` invalid token → 401, `AUTH_005`
- [ ] `POST /auth/logout` → 200, refresh token is nulled in DB

### Integration Tests — `tests/tenant.integration.test.js`
- [ ] User from Company A `GET /employees` → only Company A employees returned
- [ ] User from Company A `GET /employees/:id` for Company B employee → 404 (not 403 — don't leak existence)
- [ ] Admin from Company A `POST /employees` → creates employee in Company A
- [ ] Admin from Company A `POST /employees` with `companyId` overridden → still scoped to own company
- [ ] Admin from Company A `DELETE /employees/:id` for Company B employee → 404

### CI Update
- [ ] Add test step to `.github/workflows/ci.yml`:
  ```yaml
  - name: Run tests
    run: npm test -- --ci --coverage
    working-directory: backend
    env:
      DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      JWT_SECRET: ci-test-secret
      JWT_REFRESH_SECRET: ci-test-refresh-secret
      JWT_EXPIRES_IN: 15m
      PORT: 3002
      NODE_ENV: test
      CORS_ORIGIN: http://localhost:3000
  ```
- [ ] Add `TEST_DATABASE_URL` to GitHub Actions secrets (use a PostgreSQL service container in CI)
- [ ] Verify: CI fails if any test fails
- [ ] Verify: CI fails if line coverage drops below 60%

### Deliverable
Critical auth paths and tenant isolation covered. CI fails on regressions.

---

## Phase 7 – Cloud Deployment
> **Why last:** Everything is hardened, tested, and containerized. Now ship it.
> A live URL closes the deal in interviews.

### Azure Setup
- [ ] Create Azure account (student credits: azure.microsoft.com/free/students)
- [ ] Create Resource Group: `flowlane-rg`
- [ ] Create **Azure Database for PostgreSQL – Flexible Server**:
  - Server name: `flowlane-db`
  - Version: PostgreSQL 16
  - Admin username: `flowlane_admin`
  - Note connection string
  - Firewall: allow Azure services access
- [ ] Create **Azure Container Registry**: `flowlaneregistry`
- [ ] Create **Azure App Service**:
  - Runtime: Docker Container
  - OS: Linux
  - Plan: B1 Basic (cheapest always-on tier)
  - Region: West Europe

### Environment Configuration
- [ ] In App Service → Configuration → Application Settings, add all env vars:
  - `DATABASE_URL` — Azure PostgreSQL connection string
  - `JWT_SECRET` — strong random value (NOT the dev secret — generate fresh)
  - `JWT_REFRESH_SECRET` — separate strong random value
  - `JWT_EXPIRES_IN` = `15m`
  - `NODE_ENV` = `production`
  - `CORS_ORIGIN` = frontend URL (or `*` for MVP)
  - `PORT` = `3001`
- [ ] Never store secrets in code or Docker image
- [ ] Confirm no `.env` file exists on the server

### Migration Strategy
- [ ] Do NOT use `prisma migrate dev` in production (creates new migrations)
- [ ] Use `npx prisma migrate deploy` — applies pending migrations only
- [ ] Add as startup command before server starts:
  `npx prisma migrate deploy && node src/server.js`

### Deployment Pipeline
- [ ] Add deploy job to `.github/workflows/ci.yml` (triggers on push to `main` only, after CI passes):
  ```yaml
  deploy:
    needs: lint-and-build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Login to Azure Container Registry
        uses: azure/docker-login@v1
        with:
          login-server: flowlaneregistry.azurecr.io
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}
      - name: Build and push Docker image
        run: |
          docker build -t flowlaneregistry.azurecr.io/flowlane-api:${{ github.sha }} ./backend
          docker push flowlaneregistry.azurecr.io/flowlane-api:${{ github.sha }}
      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v3
        with:
          app-name: flowlane-api
          images: flowlaneregistry.azurecr.io/flowlane-api:${{ github.sha }}
  ```
- [ ] Add GitHub Actions secrets: `ACR_USERNAME`, `ACR_PASSWORD`, `AZURE_CREDENTIALS`

### Verification Checklist
- [ ] `GET https://flowlane-api.azurewebsites.net/health/live` → 200
- [ ] `GET https://flowlane-api.azurewebsites.net/health/ready` → 200 (DB connected)
- [ ] Register + login + `/auth/me` flow works on production URL
- [ ] No stack traces in error responses (`NODE_ENV=production` confirmed)
- [ ] Logs appear in Azure App Service → Log Stream
- [ ] Response times acceptable (< 500ms on auth endpoints)

### README Final Update
- [ ] Add production URL to top of README as a badge or link
- [ ] Add "Live Demo" section with a pre-seeded read-only test account
- [ ] Update setup section to show both local and Docker paths clearly
- [ ] Add deployment architecture diagram (App Service → Azure PostgreSQL)

### Deliverable
Live SaaS backend on a public URL. Full pipeline:
push to `main` → lint → test → build Docker image → deploy to Azure → health check.

---

## Optional Extensions (If Time Allows)

- [ ] **Password Reset Flow** — `POST /auth/forgot-password`, `POST /auth/reset-password` with time-limited token (store hash in DB)
- [ ] **Leave Request Workflow** — `LeaveRequest` model, submit/approve/reject, manager role
- [ ] **Attendance Tracking** — clock-in/out records, daily summaries, overtime calculation
- [ ] **File Storage** — employee documents via Azure Blob Storage, presigned upload URLs
- [ ] **Email Notifications** — SendGrid or Azure Communication Services (welcome, password reset)
- [ ] **`manager` Role** — department-scoped access, approve leaves for own team only
- [ ] **API Versioning** — prefix all routes with `/api/v1/`
- [ ] **OpenAPI / Swagger Docs** — auto-generated from route definitions, hosted at `/api/docs`
- [ ] **Background Jobs** — BullMQ + Redis for async tasks (email sending, scheduled reports)
- [ ] **Frontend Deployment** — Vercel (free) or Azure Static Web Apps

---

## Long-Term Vision (Post-Bachelor)

- Subscription & billing layer (Stripe integration, per-seat pricing)
- Event-driven architecture (audit events via message queues)
- Read replicas for scaling read-heavy endpoints
- SOC2 / GDPR compliance preparation (data retention, PII handling, right to erasure)
- Performance monitoring and alerting (Azure Monitor or Datadog)
- Field-level diff tracking in audit logs
- Multi-region deployment strategy

---

## Phase Completion Tracker

| Phase | Name | Status | CV Impact |
|-------|------|--------|-----------|
| 0 | Foundation | ✅ Done | Baseline — shows you can set up a project properly |
| 1 | Dev Tooling | ⬜ | Low alone, but required before writing more code |
| 2 | Security & API Hardening | ⬜ | Medium — refresh tokens and rate limiting are notable |
| 3 | Infrastructure & CI/CD | ⬜ | High — Docker + CI is a green flag for any reviewer |
| 4 | Multi-Tenant Core | ⬜ | Very High — most juniors never build multi-tenancy |
| 5 | Core HR Module + Frontend | ⬜ | Very High — full-stack and demonstrable end-to-end |
| ⭐ | **CV MILESTONE** | — | **Claim it on your CV from here** |
| 6 | Tests | ⬜ | High — separates serious projects from side projects |
| 7 | Cloud Deployment | ⬜ | Very High — live URL closes the deal in interviews |