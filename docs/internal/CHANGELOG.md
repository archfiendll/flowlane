# Flowlane – Changelog

## 2026-03-24

### Documents
- Added HR document generation from DOCX templates
- Added employee-scoped document persistence with database metadata
- Added document list, download, rename, and delete flows in the employee drawer
- Added manual document upload for employee records
- Added document metadata fields and timeline polish (`source`, `category`, `notes`)
- Refactored document storage to use `storageProvider` + `storageKey` for future cloud migration

### Company / Demo Data
- Added company email support to the company schema and setup flow
- Added richer company profile data for document generation
- Added demo users and employee-linked HR seed data for testing
- Added Romanian employee profile seed data for document template coverage

### AI
- Added backend AI route/controller/service structure
- Added protected `/ai/chat` endpoint with tenant-aware context loading
- Added separate employee-self-service and admin/company-level AI context paths
- Wired Anthropic API integration for the first assistant slice

### Docs
- Updated README and roadmap to reflect document workflows and AI progress

## 2026-03-21

### Product
- Added and polished department management page
- Added and polished vacation request page
- Added and polished invitation management page
- Improved dashboard UX for admin/manager and employee views
- Added shared toast notifications and shared UI primitives

### Employees
- Added employee details drawer
- Added archive / restore flow
- Added search, filter, sort, pagination
- Added department assignment and department-based filtering

### Auth / Routing
- Added frontend refresh-token handling
- Added session restore and auth context
- Added role-aware route protection
- Added public-route redirect protection for login/register

### Invitations
- Extended invitation management with resend / revoke
- Fixed invite acceptance so new accepted employee invites link the created user account to the matching employee row
- Added guard so employee invites fail clearly if there is no matching employee record

### Vacations
- Added employee self-request flow
- Added admin/manager-created request flow for selected employees
- Added employee confirmation flow for admin-created requests
- Fixed several workflow inconsistencies between vacation list rendering and backend status handling
- Kept the existing DB enum and implemented the two-step workflow in application logic

### Cleanup
- Updated roadmap and docs to reflect actual project state
- Corrected stale vacation-status migration so it no longer conflicts with current code assumptions

## 2026-03-02

### Infrastructure
- Created PostgreSQL local database `flowlane_dev`
- Configured Prisma with PostgreSQL
- Applied initial Prisma migration
- Configured environment variables

### Server Setup
- Created Express server structure
- Implemented health endpoints:
  - `/health/live`
  - `/health/ready`

### Authentication
- Implemented auth module structure
- Added register endpoint
- Added login endpoint
- Implemented bcrypt password hashing
- Implemented JWT token generation
- Added Zod validation layer
- Added centralized error handling

### Authorization & Security
- Implemented JWT authentication middleware (`requireAuth`)
- Implemented role-based access control middleware (`requireRole`)
- Added protected route: `GET /auth/me`
- Converted role field to Prisma enum

### Security
- Strengthened password policy for registration using Zod
- Normalized auth emails in validators
