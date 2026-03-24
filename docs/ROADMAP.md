# Flowlane — Project Tracker
**Stack:** Node.js · Express · PostgreSQL · Prisma · JWT · React · Vite  
**Project:** Bachelor project + portfolio product focused on HR operations

---

## Current State
Flowlane is now past the “basic CRUD demo” stage.

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
- backend AI assistant endpoint with employee/admin context building

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
| PostgreSQL + Prisma setup | ✅ |
| Express layered architecture | ✅ |
| JWT auth + refresh token flow | ✅ |
| Role-based authorization | ✅ |
| Tenant-aware backend queries | ✅ |
| Shared API response helpers | ✅ |

### Frontend Foundation
| Task | Status |
|------|--------|
| React + Vite app shell | ✅ |
| Axios client with auth/refresh handling | ✅ |
| Auth context + session restore | ✅ |
| Public/private route guards | ✅ |
| Main layout with role-based sidebar | ✅ |
| Shared toast notifications | ✅ |
| Shared UI primitives for cards / pills / panels | ✅ |

### HR Core
| Task | Status |
|------|--------|
| Company setup page | ✅ |
| Employee create/list/get/update/archive/restore | ✅ |
| Employee details drawer | ✅ |
| Employee document generation from templates | ✅ |
| Employee document CRUD | ✅ |
| Employee document metadata (source/category/notes) | ✅ |
| Cloud-ready document storage abstraction | ✅ |
| Department CRUD | ✅ |
| Invitation send / accept / revoke | ✅ |
| Invitation management page | ✅ |
| Dashboard stats and role-based dashboard views | ✅ |
| Vacation request page | ✅ |

### Product Polish Already Landed
| Task | Status |
|------|--------|
| Employees search / filter / sort / pagination | ✅ |
| Stronger empty / loading / error states on major pages | ✅ |
| Invite state shown in employee rows | ✅ |
| Department-aware links into Employees | ✅ |
| Dashboard polish and setup/activity sections | ✅ |
| Login/register redirect protection for signed-in users | ✅ |

---

## In Progress

### Vacation Workflow Hardening
| Task | Status |
|------|--------|
| Employee can request own vacation | ✅ |
| Admin/manager can create request for employee | ✅ |
| Admin can approve employee-created requests | ✅ |
| Employee can confirm admin-created requests | ✅ |
| Legacy `PENDING` compatibility in code | ✅ |
| Workflow origin stored explicitly in DB | ⬜ |
| Employee decline path for admin-created requests | ⬜ |
| Clear audit display: who created / approved / confirmed | ⬜ |

### Invitation Acceptance Reliability
| Task | Status |
|------|--------|
| Accept invite creates user account | ✅ |
| Accept invite now links employee row by `personalEmail` | ✅ |
| Guard against accepting employee invite without matching employee record | ✅ |
| One-time repair for older unlinked employee accounts | ⬜ |

### Planned LLM Integration
| Task | Status |
|------|--------|
| Define narrow HR assistant scope | ✅ |
| Limit answers to signed-in user and company context | ✅ |
| Separate stored facts from generated explanation | ✅ |
| Position assistant as support, not legal authority | ✅ |
| Backend `/ai/chat` endpoint | ✅ |
| Anthropic API integration wired | ✅ |
| Admin fallback to company-level context if no employee profile exists | ✅ |
| Add retrieval over employee, vacation, and company data | ⬜ |
| Add permission-aware prompt and tool layer | ⬜ |
| Add UI entry point inside app | ⬜ |
| Add response logging and safety review | ⬜ |
| Add graceful local fallback when provider credits are unavailable | ⬜ |

The intended LLM direction is a focused assistant inside Flowlane for practical HR questions such as:

- how many vacation days do I have left
- what type of leave applies in my case
- what is the status of my request
- what company information or contract details are already on file

---

## Next Practical Order
| Priority | Task | Why next |
|------|--------|--------|
| 1 | AI fallback mode or funded provider access | The backend AI slice is implemented, but demo reliability still depends on Anthropic credits. |
| 2 | Vacation workflow cleanup | It is functional now, but still needs audit clarity and a cleaner explicit workflow model. |
| 3 | Automated tests | Auth, invitation acceptance, employee linking, document flows, and vacation flows now justify integration coverage. |
| 4 | Deployment / CI | The app is becoming portfolio-ready and should be easier to run and verify consistently. |

---

## Still Missing

### Quality / Reliability
| Task | Status |
|------|--------|
| Request logger / structured logging | ⬜ |
| Rate limiting on auth endpoints | ⬜ |
| Env validation at startup | ⬜ |
| Jest + Supertest setup | ⬜ |
| Integration tests for auth | ⬜ |
| Integration tests for tenant isolation | ⬜ |
| Integration tests for invite acceptance linking | ⬜ |
| Integration tests for vacation workflow | ⬜ |

### Infrastructure
| Task | Status |
|------|--------|
| Dockerfile | ⬜ |
| docker-compose for local stack | ⬜ |
| GitHub Actions CI | ⬜ |
| Deployment target and live URL | ⬜ |

### Product / Portfolio Expansion
| Task | Status |
|------|--------|
| Contract / document generation | ✅ |
| Document upload center | ✅ |
| Audit log model and UI | ⬜ |
| AI HR assistant | 🟨 |

---

## Notes
- The vacation workflow currently uses the existing DB enum (`PENDING / APPROVED / REJECTED`) and derives the two-step workflow in application logic.
- The invitation acceptance bug that created floating employee accounts has been fixed in code for new accepted invites.
- Existing broken employee accounts created before that fix may still need manual DB relinking.
- The document system now stores DB metadata separately from physical files and uses `storageProvider` + `storageKey` so it can later move from local disk to Azure Blob Storage more cleanly.
- The Anthropic-backed AI endpoint is implemented and tested through auth and context building; current live-answer blocking issue is provider credit availability, not route wiring.
