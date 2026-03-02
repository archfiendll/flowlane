# Flowlane – Unified Roadmap (Bachelor Project + CV + Commercial Base)

Goal:
Build a multi-tenant HR Operations SaaS foundation using production-grade backend practices, cloud deployment, and scalable architecture.

---

## Phase 0 – Foundation (Completed)

### Backend Infrastructure
- [x] PostgreSQL local setup
- [x] Prisma schema initialized
- [x] Prisma migrations working
- [x] Express layered architecture
- [x] Health endpoints (/health/live, /health/ready)
- [x] Centralized error handler
- [x] Auth structure (routes, controller, service, validators)
- [x] Register endpoint
- [x] Login endpoint
- [x] JWT generation
- [x] JWT authentication middleware
- [x] Role-based access control (RBAC)
- [x] Password strength validation

### Documentation
- [x] Roadmap
- [x] Changelog
- [x] Architectural Decisions

---

## Phase 1 – Security & API Hardening (Engineering Quality)

### Backend
- [ ] Standardized API response format
- [ ] Token expiration handling (clear 401 responses)
- [ ] Rate limiting (auth endpoints first)
- [ ] Request logging middleware (method, path, duration, status)
- [ ] Environment validation at startup
- [ ] Production-ready CORS configuration

### Deliverable
Secure, production-style REST API foundation.

---

## Phase 2 – Multi-Tenant SaaS Core (Commercial Base)

### Data Model
- [ ] Company model
- [ ] Link User → companyId
- [ ] Enforce tenant isolation in all queries
- [ ] Company-scoped roles (admin/employee)

### Backend Features
- [ ] Company CRUD (admin only)
- [ ] Basic audit log (actor, action, entity, timestamp)

### Deliverable
True SaaS-ready multi-tenant backend architecture.

---

## Phase 3 – Core HR Module (Bachelor MVP)

### Backend
- [ ] Employee CRUD (company-scoped)
- [ ] Department CRUD (company-scoped)
- [ ] Pagination & filtering
- [ ] Validation for all inputs
- [ ] RBAC enforcement at service layer

### Frontend (Minimal but functional)
- [ ] React + Vite setup
- [ ] Auth pages (login/register)
- [ ] Protected routes
- [ ] Dashboard layout
- [ ] Employees table + create/edit form
- [ ] Departments table + create/edit form

### Deliverable
Working full-stack HR management MVP.

---

## Phase 4 – Engineering Practices (Big Tech Standards)

### Backend
- [ ] ESLint + Prettier strict config
- [ ] Unit tests (auth + services)
- [ ] Integration tests (auth flow + tenant isolation)
- [ ] Structured logging (pino/winston)
- [ ] Consistent error codes

### DevOps
- [ ] Dockerfile (backend)
- [ ] docker-compose (API + PostgreSQL)
- [ ] GitHub Actions CI (lint + test + build)

### Deliverable
Production-style development workflow.

---

## Phase 5 – Cloud Deployment (CV Signal)

### Deployment
- [ ] Azure App Service deployment
- [ ] Azure PostgreSQL configuration
- [ ] Environment variables management
- [ ] Migration strategy in CI/CD
- [ ] Production logging verification

### Deliverable
Live deployed SaaS backend in cloud.

---

## Optional Extensions (If Time Allows)

- [ ] Leave request workflow
- [ ] Attendance tracking
- [ ] Template & document generation
- [ ] File storage abstraction
- [ ] Refresh token rotation
- [ ] Background jobs

---

## Long-Term Vision (Post-Bachelor)

- Multi-tenant scaling strategy
- Subscription & billing layer
- Advanced RBAC (permission-based)
- Event-driven architecture exploration
- Audit logging expansion
- Performance monitoring
- Horizontal scaling strategy
