# Flowlane – Architectural Decisions

This document tracks the main technical decisions that currently shape the codebase.

---

## 1. Database

### Decision
Use PostgreSQL with Prisma-managed schema.

### Why
- relational integrity matters for users, employees, companies, invitations, and vacations
- Prisma keeps the schema readable and easy to evolve during the project

### Tradeoff
- schema drift can happen if code and migrations move out of sync, so migrations need extra discipline

---

## 2. Architecture Pattern

### Decision
Use layered backend structure:

Routes → Controllers → Services → Prisma

### Why
- business logic stays out of routes
- controllers remain thin
- service layer is easier to debug and test

---

## 3. Auth Strategy

### Decision
JWT auth with refresh-token flow.

### Why
- fits the frontend + API split well
- avoids server sessions
- supports role-based routing and session restore in the frontend

### Current Reality
- access + refresh token handling exists in both backend and frontend
- frontend restores sessions and retries once on expired access tokens

---

## 4. Multi-Tenant Model

### Decision
Scope all HR data by `companyId`.

### Why
- this is the simplest and clearest model for the current SaaS-style HR use case
- keeps employee, invitation, department, and vacation data isolated per company

---

## 5. Invitation Flow

### Decision
Invitation acceptance must link the created user account to the existing employee record.

### Why
The project originally created invited user accounts without attaching them to the matching `Employee` row. That produced “floating” employee logins that could authenticate but could not use employee-specific flows like dashboard or vacations.

### Current Rule
On invitation acceptance:
- create the user
- find the active employee record in the same company using `personalEmail`
- set `employee.userId = user.id`
- only then mark the invitation as accepted

### Tradeoff
- this currently depends on `personalEmail` matching the invite email exactly enough to be found

### Future Improvement
- make the invite explicitly reference an `employeeId` so the link is not inferred only from email

---

## 6. Vacation Workflow

### Decision
Keep the existing DB enum (`PENDING / APPROVED / REJECTED`) and implement the two-step workflow in application logic for now.

### Why
A schema-level enum expansion was started, but the actual database in use still had the original enum. Instead of forcing the migration immediately and breaking runtime behavior, the current code derives workflow meaning from existing fields:

- employee-created pending request → interpreted as “waiting for admin”
- admin-created pending request with `approvedBy` already set → interpreted as “waiting for employee confirmation”

### Benefit
- works with the current database state
- avoids enum mismatch crashes during development

### Tradeoff
- the workflow is implicit rather than modeled cleanly in the database
- `approvedBy` is doing two jobs right now: workflow marker and final approver field

### Future Improvement
- add explicit workflow origin / createdBy fields
- add explicit employee confirmation / decline metadata
- clean up the model once the workflow is stable

---

## 7. Frontend App Structure

### Decision
Keep the frontend in page-level components for speed, but extract shared UI and state helpers where repetition becomes real.

### What exists now
- auth context
- protected/public route guards
- shared toast provider
- shared UI primitives for cards, panels, quick links, and pills

### Why
- fast iteration during product building
- enough reuse to reduce visual drift without overengineering a full design system too early

---

## 8. Product Direction

### Decision
Prioritize HR operations MVP first, AI second.

### Why
The strongest value of the project is currently:
- employee records
- invites
- departments
- vacations
- company setup

AI is still a valid differentiator, especially for portfolio/interview value, but it should build on top of a working HR product rather than replace it.

### Practical Implication
Current priority is:
1. stabilize workflow logic
2. add tests
3. add deployment / CI
4. add AI feature after the base product is trustworthy

---

## 9. Document Management Model

### Decision
Treat employee documents as first-class records in the database, not just files on disk.

### Why
- generated and uploaded documents both need employee/company ownership
- history, rename, delete, and future auditability all depend on metadata, not only file existence
- the employee drawer becomes a practical HR document center rather than a one-off export action

### Current Shape
- `EmployeeDocument` stores metadata such as title, file name, MIME type, template key, and timestamps
- documents are scoped by both `employeeId` and `companyId`
- files are currently stored locally, but the app reads them through a storage service

---

## 10. Storage Abstraction

### Decision
Use `storageProvider` + `storageKey` instead of storing absolute filesystem paths as the core document reference.

### Why
- absolute local paths are brittle
- cloud migration is much easier if storage is abstracted early
- the same metadata model can support local disk today and Azure Blob later

### Current Reality
- local storage is the only active provider today
- `document-storage.service.js` hides save/read/delete behavior

### Future Improvement
- add an Azure Blob implementation under the same interface
- switch provider based on environment configuration

---

## 11. AI Assistant Scope

### Decision
Start the AI feature as a protected backend endpoint with narrow HR support scope, not as a generic public chatbot.

### Why
- the app already has structured HR data, so the first value is context-aware assistance
- auth and tenant context should be part of the design from day one
- this is stronger for interview discussion than a generic chat box without business grounding

### Current Rule
- `/ai/chat` requires auth and tenant context
- employee-linked users get employee/self-service context
- admin users without an employee row get company-level admin context instead of a hard failure

### Current Limitation
- live provider responses depend on available Anthropic API credits

### Future Improvement
- add graceful fallback when the provider is unavailable
- add retrieval over internal documents and records
- add a UI entry point once the backend behavior is stable
