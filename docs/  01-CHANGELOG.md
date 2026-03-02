# Flowlane Backend – Changelog

## 2026-03-02

### Infrastructure
- Created PostgreSQL local database `flowlane_dev`
- Configured Prisma with PostgreSQL
- Applied initial Prisma migration
- Configured environment variables (.env)

### Server Setup
- Created Express server structure (server.js, app.js)
- Implemented health endpoints:
  - /health/live (liveness check)
  - /health/ready (database readiness check)

### Authentication
- Implemented auth module structure
- Added register endpoint
- Added login endpoint
- Implemented bcrypt password hashing
- Implemented JWT token generation
- Added Zod validation layer
- Added centralized error handler