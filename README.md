# Flowlane

Flowlane is an HR operations platform focused on the workflows between company setup, employee records, invitations, departments, and vacation management.

This repository is structured as a portfolio-quality full-stack project rather than a simple CRUD demo. The strongest implemented product slice today is operational HR: authentication, tenant-aware access, employee management, invitation acceptance, dashboard views, and a two-step vacation workflow.

## Quick Start

If you want the fastest path to understanding the project:

1. Read this README for scope, architecture, and local setup.
2. Open the roadmap at [docs/ROADMAP.md](/Users/a1234/DEV/Projects/Papervee_Bachelor/docs/ROADMAP.md) for completed work, current priorities, and the LLM plan.
3. Run the backend from `backend/` and the frontend from `frontend/`.

## Current Product Scope

Flowlane already supports a connected first product slice:

- authentication with login, register, refresh, and logout flows
- company-scoped role-based access control
- company setup and Romanian company profile fields
- employee CRUD with archive and restore flows
- department management
- invitation send, accept, resend, and management flows
- dashboard views for both admins/managers and employees
- vacation request workflows for employees and admins
- employee document generation from DOCX templates
- employee document storage with history, upload, rename, delete, and metadata
- backend AI assistant endpoint with role-aware HR context

The frontend is no longer just a thin demo client. It includes:

- protected and role-aware routes
- employee details and edit flows
- invitation and vacation management screens
- employee document center inside the employee drawer
- dashboard quick actions and setup visibility
- shared toast notifications and reusable UI primitives

## Tech Stack

### Backend

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- Zod
- Helmet
- CORS
- DOCX templating via Docxtemplater

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS

## Architecture

The backend follows a layered structure:

`Routes -> Controllers -> Services -> Prisma`

Responsibilities:

- Routes: define endpoints and attach middleware
- Controllers: handle request parsing and HTTP responses
- Services: contain business rules and workflow logic
- Prisma: access the database

This keeps the backend readable and makes business workflows easier to evolve and test.

The frontend is moving toward a feature-based structure for larger areas such as employees, vacations, and dashboard UI so that page files do not become overloaded.

Document storage now also follows a small abstraction layer:

`Document Generation -> Document Storage Service -> Local Storage`

The current implementation stores files locally, but the document model now uses `storageProvider` and `storageKey` so the same flow can later move to Azure Blob Storage without rewriting the whole feature.

## Project Structure

```text
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
      utils/
      validators/
    .env.example
    package.json
  frontend/
    src/
      api/
      auth/
      components/
      features/
      layouts/
      pages/
    .env.example
    package.json
  docs/
    ROADMAP.md
    internal/
```

## Local Development

### 1. Install Dependencies

From the backend folder:

```bash
cd backend
npm install
```

From the frontend folder:

```bash
cd frontend
npm install
```

### 2. Configure PostgreSQL

Create a local database and user:

```sql
CREATE USER flowlane WITH PASSWORD 'flowlane_dev_password';
ALTER USER flowlane CREATEDB;
CREATE DATABASE flowlane_dev OWNER flowlane;
```

### 3. Configure Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
DATABASE_URL="postgresql://flowlane:flowlane_dev_password@localhost:5432/flowlane_dev?schema=public"
JWT_SECRET="dev-secret-change-me"
JWT_REFRESH_SECRET="dev-refresh-secret-change-me"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL="http://localhost:3001"
```

If invitation emails are enabled in your local environment, you may also need additional mail-related environment variables on the backend.

### 4. Run Prisma

From the backend folder:

```bash
npx prisma migrate dev
```

This will:

- apply migrations
- create database tables
- generate the Prisma client

### 5. Start the Backend

From the backend folder:

```bash
npm run dev
```

The backend runs on:

[`http://localhost:3001`](http://localhost:3001)

### 6. Start the Frontend

From the frontend folder:

```bash
npm run dev
```

The frontend runs on:

[`http://localhost:5173`](http://localhost:5173)

### 7. Optional Utilities

Prisma Studio:

```bash
cd backend
npx prisma studio
```

## Health Endpoints

Liveness:

```bash
curl http://localhost:3001/health/live
```

Database readiness:

```bash
curl http://localhost:3001/health/ready
```

## Example Auth Requests

Register:

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"Password123!","companyName":"Demo Company"}'
```

Login:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"Password123!"}'
```

Get current user:

```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Public Docs

- Product roadmap: [docs/ROADMAP.md](/Users/a1234/DEV/Projects/Papervee_Bachelor/docs/ROADMAP.md)

## Notes for Recruiters and Interviews

The most useful public documents in this repository are:

- this README for scope, architecture, and local setup
- the public roadmap for current status and next priorities

Detailed change history and decision notes are kept under `docs/internal/` for project maintenance, but they are not required to understand or run the project.

Current note:
- the Anthropic-backed AI endpoint is implemented at the backend integration level, but live responses currently depend on available Anthropic API credits in the local environment
