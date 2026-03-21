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

What still needs tightening:
- vacation workflow and audit clarity
- tests
- deployment / CI
- AI feature if kept as portfolio differentiator

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

---

## Next Practical Order
| Priority | Task | Why next |
|------|--------|--------|
| 1 | Vacation workflow cleanup | It is functional now, but still needs audit clarity and a cleaner explicit workflow model. |
| 2 | Automated tests | Auth, invitation acceptance, employee linking, and vacation flows now justify integration coverage. |
| 3 | Deployment / CI | The app is becoming portfolio-ready and should be easier to run and verify consistently. |
| 4 | AI feature | Best added after the operational HR core is stable enough to serve as useful context. |

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
| Contract / PDF generation | ⬜ |
| Audit log model and UI | ⬜ |
| AI HR assistant | ⬜ |

---

## Notes
- The vacation workflow currently uses the existing DB enum (`PENDING / APPROVED / REJECTED`) and derives the two-step workflow in application logic.
- The invitation acceptance bug that created floating employee accounts has been fixed in code for new accepted invites.
- Existing broken employee accounts created before that fix may still need manual DB relinking.
