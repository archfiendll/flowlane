# Flowlane — Project Tracker
**Stack:** Node.js · Express · PostgreSQL · Prisma · JWT · React · Docker · Azure  
**Author:** Illia Savytskyi · Bachelor Project + CV + Maersk Prep

---

## 🎯 Current Focus
**→ Step 1: Run the new database migration**  
**→ Step 2: Build Company registration flow**  
**→ Step 3: Employee CRUD**

---

## ✅ Phase 0 — Backend Foundation
| Task | Status |
|------|--------|
| PostgreSQL + Prisma setup | ✅ |
| Express layered architecture (Routes → Controllers → Services) | ✅ |
| `POST /auth/register` | ✅ |
| `POST /auth/login` | ✅ |
| `GET /auth/me` | ✅ |
| `POST /auth/refresh` — refresh token rotation (15m / 30d) | ✅ |
| `POST /auth/logout` | ✅ |
| `requireAuth` middleware | ✅ |
| `requireRole` middleware (employee / manager / admin / super_admin) | ✅ |
| Password validation via Zod | ✅ |
| Helmet + CORS | ✅ |
| Health endpoints `/health/live` `/health/ready` | ✅ |

---

## ✅ Phase 1 — Dev Tooling
| Task | Status |
|------|--------|
| ESLint (airbnb-base) — zero errors | ✅ |
| Prettier | ✅ |
| `.env.example` committed | ✅ |
| `.nvmrc` set to 20.11.0 | ✅ |

---

## ✅ Phase 2 — API Hardening
| Task | Status |
|------|--------|
| Standardized response: `{ success, data }` / `{ success, error: { code, message } }` | ✅ |
| `utils/response.js` — `sendSuccess` / `sendError` | ✅ |
| `utils/errorCodes.js` — AUTH_001 through SERVER_001 | ✅ |
| Refresh token rotation with bcrypt hash stored in DB | ✅ |
| Rate limiting on auth endpoints | ⬜ |
| Env validation at startup (Zod) | ⬜ |
| Request logger (method, path, status, duration) | ⬜ |

---

## ✅ Phase F2 — Frontend
| Task | Status |
|------|--------|
| Vite + React + Tailwind CSS | ✅ |
| Axios client with request/response interceptors | ✅ |
| `ProtectedRoute` — redirects to login if no token | ✅ |
| `MainLayout` — collapsible sidebar, topbar, logout | ✅ |
| `Login` page — show/hide password, errors | ✅ |
| `Register` page — live password rules, auto-login | ✅ |
| `Dashboard` — stat cards, system info | ✅ |
| `Employees` — table, skeleton loading, role badges | ✅ |

---

## 🔴 Phase 4 — Multi-Tenant Core ← DO THIS NEXT

### Database changes
| Task | Status |
|------|--------|
| Add `Company` model to schema.prisma | ⬜ |
| Add `CompanyProfileRO` model (Romanian-specific fields) | ⬜ |
| Add `Employee` model (universal fields) | ⬜ |
| Add `EmployeeProfileRO` model (CNP, CI, COR code etc.) | ⬜ |
| Add `Department` model | ⬜ |
| Add `VacationRequest` model | ⬜ |
| Add `Invitation` model | ⬜ |
| Run migration `add_full_schema` | ⬜ |

### Registration & invite flow
| Task | Status |
|------|--------|
| Register → creates Company + user becomes Admin | ⬜ |
| Admin sends invite link to employee email | ⬜ |
| Employee accepts invite → sets password → joins company | ⬜ |

### Tenant isolation
| Task | Status |
|------|--------|
| `tenant.middleware.js` — attach `req.companyId` from token | ⬜ |
| `assertTenant.js` — block cross-company data access | ⬜ |
| All queries scoped to `companyId` | ⬜ |

### Audit log
| Task | Status |
|------|--------|
| `AuditLog` model — who did what, when, to what | ⬜ |
| `audit.service.js` — log every mutating action | ⬜ |

---

## 🔴 Phase 5 — Core HR Module

### Backend
| Task | Status |
|------|--------|
| `employee.service.js` — create, list, get, update, deactivate | ⬜ |
| `department.service.js` — CRUD + employee count | ⬜ |
| `vacation.service.js` — request, approve, reject, balance | ⬜ |
| `pagination.js` utility — `{ data, meta: { total, page, limit } }` | ⬜ |
| All routes with auth + role + tenant middleware | ⬜ |

### Frontend
| Task | Status |
|------|--------|
| Employees page — create modal | ⬜ |
| Employees page — edit modal | ⬜ |
| Employees page — deactivate + confirm dialog | ⬜ |
| Employees page — pagination + status filter | ⬜ |
| Departments page — full CRUD | ⬜ |
| Vacation page — submit request | ⬜ |
| Vacation page — approve / reject (admin) | ⬜ |
| Dashboard — live counts (employees, departments, pending vacations) | ⬜ |
| Company setup page — fill company profile after register | ⬜ |

---

## 🟢 Phase 5b — Document Generation (Wow Feature)

| Task | Status |
|------|--------|
| CIM contract PDF template (Romanian law fields) | ⬜ |
| `POST /employees/:id/generate-contract` — returns filled PDF | ⬜ |
| Store PDF reference in DB | ⬜ |
| Frontend — "Generate Contract" button on employee profile | ⬜ |
| Azure Blob Storage — store PDFs, presigned download URL | ⬜ |

---

## 🟡 Phase 3 — Infrastructure & CI/CD

| Task | Status |
|------|--------|
| Structured logging with `pino` | ⬜ |
| `Dockerfile` for backend | ⬜ |
| `docker-compose.yml` — api + db with healthcheck | ⬜ |
| GitHub Actions CI — lint gate on push to main | ⬜ |

---

## 🟡 Phase 6 — Tests

| Task | Status |
|------|--------|
| Jest + Supertest setup, separate test DB | ⬜ |
| Unit tests: `auth.service`, `auth.validators` | ⬜ |
| Integration tests: full auth flow | ⬜ |
| Integration tests: tenant isolation | ⬜ |
| CI update: test step on every push | ⬜ |

---

## 🟢 Phase 7 — Cloud Deployment

| Task | Status |
|------|--------|
| Azure App Service + Azure PostgreSQL | ⬜ |
| Docker image → Azure Container Registry | ⬜ |
| GitHub Actions deploy pipeline | ⬜ |
| Live URL with demo credentials | ⬜ |

---

## 📋 Database Schema Plan

```
Company (universal)
  └── CompanyProfileRO    → CUI, CAEN, trade register (Romania only)

Employee (universal)
  └── EmployeeProfileRO   → CNP, CI, COR code, REVISAL (Romania only)

Department
VacationRequest
Invitation
AuditLog
```

> Adding UK/DE support later = just add CompanyProfileUK / EmployeeProfileUK.
> Core models never change.

---

## 💼 CV Line (ready to use after Phase 5)

```
Flowlane – HR Operations SaaS                                    2026
Node.js · Express · PostgreSQL · Prisma · JWT · React · Docker · Azure

• Full-stack multi-tenant SaaS — layered backend + React frontend
• JWT auth with refresh token rotation (15m access / 30d refresh)
• Romanian labor law compliant — CIM contracts, CNP/CI validation, REVISAL
• PDF contract generation from employee + company data
• Multi-tenant isolation — all queries scoped to companyId
• Docker + GitHub Actions CI/CD + Azure deployment
```

---

## 🎯 Maersk Interview Cheat Sheet

**Say this:** "I built the full stack myself — Express backend with JWT refresh token rotation and RBAC, React frontend with protected routes and axios interceptors."

**Study these before the interview:**
- `map`, `filter`, `reduce` — write from memory
- `async/await` with try/catch
- `useState`, `useEffect`, props
- What is the virtual DOM
- What is a controlled component