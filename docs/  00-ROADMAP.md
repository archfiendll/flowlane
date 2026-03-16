# Flowlane — Project Tracker
**Stack:** Node.js · Express · PostgreSQL · Prisma · JWT · React · Docker · Azure · Claude AI  
**Author:** Illia Savytskyi · Bachelor Project + CV + Maersk Prep

---

## 🎯 Current Focus
**→ Next 1: Departments**
**→ Next 2: Vacation requests**
**→ Next 3: Invitation management page**

---

## ✅ Done Now

### Core product slice
| Task | Status |
|------|--------|
| Auth flow — register, login, me, refresh, logout | ✅ |
| Company setup page | ✅ |
| Dashboard live counts | ✅ |
| Employee create/list/get/update/archive/restore | ✅ |
| Employee details drawer | ✅ |
| Invite send + accept flow | ✅ |
| Invite badges and expiry/accept state in Employees page | ✅ |

### Frontend polish already completed
| Task | Status |
|------|--------|
| Refresh-token handling in frontend client | ✅ |
| Auth context + centralized session state | ✅ |
| Role-aware protected frontend routes | ✅ |
| Employees page — search / filter / sort | ✅ |
| Employees page — pagination controls | ✅ |
| Employees page — archive / restore UX | ✅ |
| Employees page — stronger empty / error / loading states | ✅ |
| Dashboard + Company Setup — better loading / retry states | ✅ |

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

## ✅ Phase F2 — Frontend Foundation
| Task | Status |
|------|--------|
| Vite + React + Tailwind CSS | ✅ |
| Axios client with request/response interceptors | ✅ |
| `ProtectedRoute` — redirects to login if no token | ✅ |
| `MainLayout` — collapsible sidebar, topbar, logout | ✅ |
| Role-based sidebar — employees see only their pages | ✅ |
| `Login` page — show/hide password, errors | ✅ |
| `Register` page — company name + live password rules + auto-login | ✅ |
| `AcceptInvite` page — token validation + password setup + auto-login | ✅ |
| `Dashboard` — stat cards, system info | ✅ |
| `Employees` — table, skeleton loading, status badges | ✅ |

---

## ✅ Phase 4 — Multi-Tenant Core

### Database
| Task | Status |
|------|--------|
| `Company` model | ✅ |
| `CompanyProfileRO` model | ✅ |
| `Employee` model (universal fields, optional non-essentials) | ✅ |
| `EmployeeProfileRO` model | ✅ |
| `Department` model | ✅ |
| `VacationRequest` model | ✅ |
| `Invitation` model | ✅ |
| Migration `add_full_schema` | ✅ |
| Migration `make_employee_fields_optional` | ✅ |

### Registration & invite flow
| Task | Status |
|------|--------|
| Register → creates Company + user becomes Admin | ✅ |
| `companyId` included in JWT + login response | ✅ |
| Admin sends invite email via Resend | ✅ |
| Employee accepts invite → sets password → joins company | ✅ |
| Send Invite button on employee row | ✅ |
| Invite state shown in employee list | ✅ |
| Invite resend from employee row | ✅ |

### Tenant isolation
| Task | Status |
|------|--------|
| `tenant.middleware.js` — attach `req.companyId` from token | ✅ |
| All queries scoped to `companyId` | ✅ |

### Audit log
| Task | Status |
|------|--------|
| `AuditLog` model — who did what, when, to what | ⬜ |
| `audit.service.js` — log every mutating action | ⬜ |

---

## 🔴 Phase 5 — Core HR Module ← IN PROGRESS

### Backend
| Task | Status |
|------|--------|
| `employee.service.js` — create, list, get, update, deactivate | ✅ |
| `employee.controller.js` + `employee.routes.js` | ✅ |
| `invitation.service.js` — create, accept, getByToken | ✅ |
| `email.service.js` — Resend integration | ✅ |
| Employee restore endpoint | ✅ |
| Employee list — search / archive filter / sorting / pagination metadata | ✅ |
| `department.service.js` — CRUD + employee count | ⬜ |
| `vacation.service.js` — request, approve, reject, balance | ⬜ |
| `pagination.js` utility — `{ data, meta: { total, page, limit } }` | ✅ |
| All routes with auth + role + tenant middleware | ✅ |

### Frontend
| Task | Status |
|------|--------|
| Employees page — 4-step create modal | ✅ |
| Employees page — Send Invite button per row | ✅ |
| Employees page — edit modal | ✅ |
| Employees page — archive + restore flow | ✅ |
| Employees page — pagination + search + filter + sort | ✅ |
| Employee details drawer | ✅ |
| Departments page — full CRUD | ⬜ |
| Vacation page — submit request | ⬜ |
| Vacation page — approve / reject (admin) | ⬜ |
| Invitation management page | ⬜ |
| Dashboard — live counts (employees, departments, pending vacations) | ✅ |
| Company setup page — fill legal details, CUI, address after register | ✅ |

---

## 🟠 Next Practical Order

| Priority | Task | Why next |
|------|--------|--------|
| 1 | Departments | The schema already supports it and the Employees flow is ready to connect to real department management. |
| 2 | Vacation requests | The domain model and dashboard already point to it, so this unlocks the next real HR workflow. |
| 3 | Invitation management page | Invite state exists, but a dedicated page for pending / accepted / expired invites will complete that flow. |

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

## 🟢 Phase 5c — AI HR Assistant (Wow Feature)

> Employees and managers can chat with an AI assistant powered by Claude API.
> The assistant has context about the company's HR policies, vacation balance,
> and can answer questions like "How many vacation days do I have left?" or
> "What is the notice period in my contract?"

| Task | Status |
|------|--------|
| `POST /ai/chat` backend endpoint | ⬜ |
| Claude API integration with company + employee context injection | ⬜ |
| Conversation history — store per employee in DB | ⬜ |
| Role-aware responses — employee sees own data, manager sees team | ⬜ |
| Frontend — chat widget in sidebar (all roles) | ⬜ |
| Frontend — chat page `/chat` with message history | ⬜ |
| Suggested questions based on role | ⬜ |

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

## 📋 Database Schema
```
Company (universal)
  └── CompanyProfileRO    → CUI, CAEN, trade register (Romania only)

Employee (universal)
  └── EmployeeProfileRO   → CNP, CI, COR code, REVISAL (Romania only)

Department
VacationRequest
Invitation
AuditLog
ChatMessage             ← new (AI assistant history)
```

---

## 💼 CV Line (ready to use after Phase 5)
```
Flowlane – HR Operations SaaS                                    2026
Node.js · Express · PostgreSQL · Prisma · JWT · React · Docker · Azure

- Full-stack multi-tenant SaaS — layered backend + React frontend
- JWT auth with refresh token rotation (15m access / 30d refresh)
- Romanian labor law compliant — CIM contracts, CNP/CI validation, REVISAL
- PDF contract generation from employee + company data
- AI-powered HR assistant — Claude API with employee context injection
- Multi-tenant isolation — all queries scoped to companyId
- Docker + GitHub Actions CI/CD + Azure deployment
```

---

## 🎯 Maersk Interview Cheat Sheet

**Say this:** "I built the full stack myself — Express backend with JWT refresh
token rotation and RBAC, React frontend with protected routes and axios
interceptors. I also integrated the Claude API to build an AI HR assistant
that's context-aware per employee and company."

**Study these before the interview:**
- `map`, `filter`, `reduce` — write from memory
- `async/await` with try/catch
- `useState`, `useEffect`, props
- What is the virtual DOM
- What is a controlled component
- What is multi-tenancy and how do you implement it
- What is a JWT and what goes inside it
- What is bcrypt and why do we hash passwords
