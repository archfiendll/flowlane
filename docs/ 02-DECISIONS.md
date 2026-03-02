# Flowlane Backend – Architectural Decisions

## Database
**PostgreSQL**
Reason:
- Strong relational consistency
- Production-ready
- Native support in Azure
- Good Prisma integration

---

## ORM
**Prisma**
Reason:
- Type-safe client
- Structured migrations
- Clean schema management
- Good for scalable architecture

---

## Authentication Strategy
**JWT (stateless authentication)**
Reason:
- Scalable (no session store required)
- Suitable for Azure App Service
- Simple integration with frontend

---

## Architecture Pattern
**Layered architecture (Routes → Controllers → Services → Prisma)**
Reason:
- Separation of concerns
- Easier testing
- Easier scaling
- Cleaner debugging
- Production-standard structure

---

## Validation
**Zod**
Reason:
- Strong runtime validation
- Clean schema definitions
- Prevents invalid input reaching services