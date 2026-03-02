# Flowlane – HR Operations Backend

Flowlane is a backend system designed to power an HR Operations platform.
It provides authentication, role-based access control, and a scalable foundation for employee lifecycle management.

This backend is built using a production-oriented layered architecture and is designed to evolve into a multi-tenant SaaS system.

---

# Tech Stack

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT (Stateless Authentication)
- bcrypt (Password Hashing)
- Zod (Validation)
- Helmet (Security Headers)
- CORS

---

# Architecture

Layered architecture:

Routes → Controllers → Services → Prisma

Responsibilities:

- Routes → Define endpoints and attach middleware
- Controllers → Handle HTTP layer and validation
- Services → Contain business logic
- Prisma → Database access layer only

This structure ensures:
- Separation of concerns
- Scalability
- Maintainability
- Clean debugging boundaries

---

# Project Structure

Papervee_Bachelor/
  backend/
    prisma/
      schema.prisma
      migrations/
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
      validators/
      utils/
      app.js
      server.js
    .env
    package.json
  frontend/
  docs/

---

# Local Development – Full Setup

1. Clone Repository

git clone <your-repo-url>
cd Papervee_Bachelor/backend

2. Install Dependencies

npm install

3. Setup PostgreSQL

Ensure PostgreSQL is installed and running locally.

Run inside psql:

CREATE USER flowlane WITH PASSWORD 'flowlane_dev_password';
ALTER USER flowlane CREATEDB;
CREATE DATABASE flowlane_dev OWNER flowlane;

4. Configure Environment Variables

Create a .env file inside backend/:

DATABASE_URL="postgresql://flowlane:flowlane_dev_password@localhost:5432/flowlane_dev?schema=public"
JWT_SECRET="dev-secret-change-me"
JWT_EXPIRES_IN="7d"
PORT=3001

5. Run Prisma Migrations

npx prisma migrate dev

This will:
- Apply migrations
- Create tables
- Generate Prisma client

6. Start Development Server

npm run dev

Server runs at:

http://localhost:3001

---

# Health Endpoints

Liveness check:

curl http://localhost:3001/health/live

Database readiness check:

curl http://localhost:3001/health/ready

---

# Authentication Endpoints

Register:

curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"password123"}'

Login:

curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"password123"}'

Response example:

{
  "ok": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "email": "test@mail.com",
    "role": "employee"
  }
}

---

# Protected Routes

Get current user:

curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

Admin-only route (requires role=admin):

curl http://localhost:3001/admin/ping \
  -H "Authorization: Bearer YOUR_TOKEN"

---

# Prisma Studio (Database GUI)

npx prisma studio

Runs at:

http://localhost:5555

---

# Security Model

- Stateless JWT authentication
- Role-Based Access Control (RBAC)
- bcrypt password hashing (12 salt rounds)
- Centralized error handling
- Helmet security middleware
- CORS configuration
- Enum-based roles in database

---

# Current System Status

✔ PostgreSQL connected
✔ Prisma migrations working
✔ Layered architecture implemented
✔ JWT authentication working
✔ Role-based authorization working
✔ Admin-only route tested
✔ Health endpoints operational

---

# Planned Improvements

- Password strength enforcement
- Rate limiting
- Refresh token strategy
- Multi-tenant company model
- Dockerization
- Azure deployment
- CI/CD pipeline
- Audit logging

---

Author:
Illia Savytskyi
