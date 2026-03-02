# Flowlane Backend – Roadmap

## Phase 0 – Foundation (Current)
- [x] PostgreSQL local setup
- [x] Prisma schema initialized
- [x] Prisma migrate init
- [x] Express server structure
- [x] Health endpoints (/health/live, /health/ready)
- [x] Centralized error handler
- [x] Auth structure (routes, controller, service, validators)
- [x] Register endpoint
- [x] Login endpoint
- [x] JWT generation

---

## Phase 1 – Security & Protection
- [x] JWT authentication middleware
- [x] Protected test route
- [x] Role-based access control (admin / employee)
- [x] Password strength validation improvement
- [ ] Token expiration handling
- [ ] Logout strategy (token invalidation discussion)

---

## Phase 2 – Core HR Domain
- [ ] Company CRUD
- [ ] Department CRUD
- [ ] Employee CRUD
- [ ] Contract management
- [ ] Attendance system
- [ ] Leave requests system

---

## Phase 3 – Document System
- [ ] Template CRUD
- [ ] Document generation logic
- [ ] Document history tracking
- [ ] File storage strategy

---

## Phase 4 – Production Readiness
- [ ] Request logging middleware
- [ ] Rate limiting
- [ ] Input sanitization improvements
- [ ] Environment split (dev / prod)
- [ ] Docker setup
- [ ] Azure App Service deployment
- [ ] Azure PostgreSQL migration
- [ ] CI/CD pipeline

---

## Long-Term Goals
- Multi-tenant architecture
- Audit logging
- Event-driven architecture exploration
- Scaling strategy for Azure