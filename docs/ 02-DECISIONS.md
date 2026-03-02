# Flowlane Backend – Architectural Decisions

This document tracks explicit technical decisions made during backend development, including reasoning, tradeoffs, and future considerations.

---

## 1. Database

### Decision
**PostgreSQL**

### Context
The system requires:
- Strong relational integrity
- Structured user-role relationships
- Long-term SaaS scalability

### Rationale
- ACID-compliant
- Production-proven
- Native Azure support
- Strong Prisma integration
- Excellent support for relational modeling

### Current Usage
- `User` model
- Role-based authorization field
- Migration-managed schema

### Tradeoffs
- Requires schema migrations
- More setup complexity compared to NoSQL

### Future Evolution
- Multi-tenant modeling
- Indexed performance tuning
- Row-level security (if required)
- Read replicas for scaling

---

## 2. ORM Layer

### Decision
**Prisma ORM**

### Context
We need:
- Safe database interaction
- Migration tracking
- Clear schema structure

### Rationale
- Generated type-safe client
- Declarative schema file
- Structured migration system
- Clean abstraction over SQL
- Strong developer experience

### Architectural Role
Prisma is used only inside the service layer, never directly in routes.

### Tradeoffs
- Abstraction overhead
- Less flexibility than raw SQL for highly complex queries

### Future Improvements
- Add transaction management
- Enable query logging in production
- Optimize select fields for performance

---

## 3. Authentication Strategy

### Decision
**JWT – Stateless Authentication**

### Context
The system must:
- Scale horizontally
- Avoid server session storage
- Integrate easily with frontend clients

### Rationale
- No session database required
- Suitable for Azure App Service
- Industry-standard REST authentication pattern
- Clean separation between authentication and authorization

### Implementation Details
- JWT payload contains:
  - `sub` → user ID
  - `role` → authorization context
- Token expiration configurable via `JWT_EXPIRES_IN`
- Token verified on every protected request
- User re-fetched from DB for additional safety

### Security Measures
- Password hashing with bcrypt (12 salt rounds)
- No password returned in API responses
- Centralized error handling
- Helmet security headers
- Controlled CORS configuration

### Known Limitations
- No refresh token rotation yet
- No token revocation strategy
- No device/session tracking

### Planned Improvements
- Refresh token implementation
- Short-lived access tokens in production
- Logout invalidation strategy

---

## 4. Authorization Strategy

### Decision
**Role-Based Access Control (RBAC)**

### Current Roles
- `employee` (default)
- `admin`

### Implementation
- `requireAuth` middleware
- `requireRole(...roles)` middleware
- Admin-protected test route: `/admin/ping`

### Rationale
- Simple and predictable
- Easy to extend
- Suitable for HR SaaS structure

### Future Evolution
- Add `manager`, `super_admin`
- Introduce permission-based model
- Company-scoped role isolation

---

## 5. Architecture Pattern

### Decision
**Layered Architecture**

Routes → Controllers → Services → Prisma

### Responsibilities

#### Routes
- Define endpoints
- Attach middleware

#### Controllers
- Handle HTTP layer
- Validate input
- Call services

#### Services
- Contain business logic
- Interact with database

#### Prisma
- Pure data access layer

### Rationale
- Separation of concerns
- Easier testing
- Easier scaling
- Clear debugging boundaries

### Anti-Patterns Avoided
- Business logic inside routes
- Direct DB calls in controllers
- Monolithic file structure

---

## 6. Validation Strategy

### Decision
**Zod**

### Rationale
- Runtime validation
- Declarative schemas
- Prevents invalid data from reaching business logic

### Current Coverage
- Register endpoint
- Login endpoint

### Planned Improvements
- Password strength enforcement
- Centralized validation formatting
- Reusable validation modules

### Password Policy (Register)
- Enforced at API boundary (Zod)
- Rules: min 10, max 72, uppercase, lowercase, number, special char
- Login validation remains minimal to avoid blocking existing users

---

## 7. Error Handling Strategy

### Decision
Centralized error middleware

### Rationale
- Consistent error responses
- Prevent stack trace leakage in production
- Clean HTTP status management

### Future Improvements
- Structured error codes
- Logging integration
- Request ID tracing

---

## 8. Infrastructure Structure

### Monorepo Layout
