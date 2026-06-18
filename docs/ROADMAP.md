# Flowlane — Project Tracker
**Stack:** Node.js · Express · PostgreSQL · Prisma · JWT · React · Vite  
**Project:** Bachelor project + portfolio product focused on HR operations

---

## Current State
Flowlane is now past the "basic CRUD demo" stage.

What is working today:
- auth with register, login, refresh, logout
- company setup flow
- employee management with create, edit, archive, restore, search, filters, pagination
- invitation flow with send, accept, revoke, and invitation tracking
- departments management
- vacation request flow with employee/admin split
- role-aware routing and session restoration on the frontend
- dashboard with role-specific views
- document generation from HR DOCX templates
- employee document history with upload / download / rename / delete
- cloud-ready document storage model using storage provider + key
- admin document templates library with full backend support
- backend AI assistant endpoint with employee/admin context building (in progress)
- admin reporting page for vacations and payroll with role/department filters

What still needs tightening:
- vacation workflow and audit clarity
- tests
- deployment / CI
- AI fallback mode or funded provider access

---

## Done

### Core Platform
| Task | Status |
|------|--------|
| PostgreSQL + Prisma setup | done |
| Express layered architecture | done |
| JWT auth + refresh token flow | done |
| Role-based authorization | done |
| Tenant-aware backend queries | done |
| Shared API response helpers | done |

### Frontend Foundation
| Task | Status |
|------|--------|
| React + Vite app shell | done |
| Axios client with auth/refresh handling | done |
| Auth context + session restore | done |
| Public/private route guards | done |
| Main layout with role-based sidebar | done |
| Shared toast notifications | done |
| Shared UI primitives for cards / pills / panels | done |

### HR Core
| Task | Status |
|------|--------|
| Company setup page | done |
| Employee create/list/get/update/archive/restore | done |
| Employee details drawer | done |
| Employee document generation from templates | done |
| Employee document CRUD | done |
| Employee document metadata (source/category/notes) | done |
| Cloud-ready document storage abstraction | done |
| Admin document templates library (frontend) | done |
| Document template backend (controller, routes, service) | done |
| Admin reports for vacations and payroll | done |
| Department CRUD | done |
| Invitation send / accept / revoke | done |
| Invitation management page | done |
| Dashboard stats and role-based dashboard views | done |
| Vacation request page | done |

### Product Polish Already Landed
| Task | Status |
|------|--------|
| Employees search / filter / sort / pagination | done |
| Stronger empty / loading / error states on major pages | done |
| Invite state shown in employee rows | done |
| Department-aware links into Employees | done |
| Dashboard polish and setup/activity sections | done |
| Login/register redirect protection for signed-in users | done |

---

## In Progress

### Vacation Workflow Hardening
| Task | Status |
|------|--------|
| Employee can request own vacation | done |
| Admin/manager can create request for employee | done |
| Admin can approve employee-created requests | done |
| Employee can confirm admin-created requests | done |
| Legacy `PENDING` compatibility in code | done |
| Workflow origin stored explicitly in DB | not started |
| Employee decline path for admin-created requests | not started |
| Clear audit display: who created / approved / confirmed | not started |

### Invitation Acceptance Reliability
| Task | Status |
|------|--------|
| Accept invite creates user account | done |
| Accept invite now links employee row by `personalEmail` | done |
| Guard against accepting employee invite without matching employee record | done |
| One-time repair for older unlinked employee accounts | not started |

### LLM Integration
| Task | Status |
|------|--------|
| Define narrow HR assistant scope | done |
| Limit answers to signed-in user and company context | done |
| Separate stored facts from generated explanation | done |
| Position assistant as support, not legal authority | done |
| Backend `/ai/chat` endpoint | done |
| Anthropic API integration wired | done |
| Admin fallback to company-level context if no employee profile exists | done |
| Add retrieval over employee, vacation, and company data | not started |
| Add permission-aware prompt and tool layer | not started |
| Add UI entry point inside app | not started |
| Add response logging and safety review | not started |
| Add graceful local fallback when provider credits are unavailable | not started |

The intended LLM direction is a focused assistant inside Flowlane for practical HR questions such as:

- how many vacation days do I have left
- what type of leave applies in my case
- what is the status of my request
- what company information or contract details are already on file

### Reporting
| Task | Status |
|------|--------|
| Define reporting scope and data model | done |
| Backend reporting endpoints | done |
| Frontend reporting views | done |
| Charts / export / historical trends | not started |

---

## Next Practical Order
| Priority | Task | Why next |
|------|--------|--------|
| 1 | AI assistant UI and retrieval layer | The backend AI slice is implemented; next step is connecting it to real employee and company data and exposing it in the frontend. |
| 2 | Reporting | Current admin report page covers vacations and payroll; charts and exports can follow later. |
| 3 | Vacation workflow cleanup | Functional now, but still needs audit clarity and a cleaner explicit workflow model. |
| 4 | Automated tests | Auth, invitation acceptance, employee linking, document flows, and vacation flows now justify integration coverage. |
| 5 | Deployment / CI | The app is becoming portfolio-ready and should be easier to run and verify consistently. |

---

## Still Missing

### Quality / Reliability
| Task | Status |
|------|--------|
| Request logger / structured logging | not started |
| Rate limiting on auth endpoints | not started |
| Env validation at startup | not started |
| Jest + Supertest setup | not started |
| Integration tests for auth | not started |
| Integration tests for tenant isolation | not started |
| Integration tests for invite acceptance linking | not started |
| Integration tests for vacation workflow | not started |

### Infrastructure
| Task | Status |
|------|--------|
| Dockerfile | not started |
| docker-compose for local stack | not started |
| GitHub Actions CI | not started |
| Deployment target and live URL | not started |

### Product / Portfolio Expansion
| Task | Status |
|------|--------|
| Contract / document generation | done |
| Document upload center | done |
| Admin document templates library | done |
| Audit log model and UI | not started |
| AI HR assistant | in progress |
| Reporting | done |

---

## Notes
- The vacation workflow currently uses the existing DB enum (`PENDING / APPROVED / REJECTED`) and derives the two-step workflow in application logic.
- The invitation acceptance bug that created floating employee accounts has been fixed in code for new accepted invites.
- Existing broken employee accounts created before that fix may still need manual DB relinking.
- The document system now stores DB metadata separately from physical files and uses `storageProvider` + `storageKey` so it can later move from local disk to Azure Blob Storage more cleanly.
- The Anthropic-backed AI endpoint is implemented and tested through auth and context building; current live-answer blocking issue is provider credit availability, not route wiring.
- The admin document templates library was added in May 2026, covering both the frontend templates page and the full backend controller, routes, and service layer.
