# Flowlane

Flowlane is an HR operations platform focused on the workflows that sit between employee records, company setup, invitations, and leave management.

The project currently includes a React frontend and a Node.js/Express backend backed by PostgreSQL and Prisma. It is structured to support multi-tenant company data, role-based access control, and further product growth into a SaaS-style HR platform.

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

The frontend is no longer just a thin demo client. It includes:

- protected and role-aware routes
- employee details and edit flows
- invitation and vacation management screens
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

### Frontend

- React
- Vite
- React Router
- Axios

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

## Project Structure

```text
flowlane/
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
      app.js
      server.js
    package.json
  frontend/
    src/
      api/
      auth/
      components/
      features/
      layouts/
      pages/
    package.json
  docs/
```

## Implemented Backend Areas

### Authentication and Access

- register and login
- access token refresh
- logout
- current-user lookup
- role-aware route protection
- company/tenant scoping in protected flows

### People Operations

- employee creation, editing, archive, and restore
- employee details lookup
- department CRUD
- company profile setup and updates

### Invitations

- create invitation
- resend invitation
- revoke invitation
- accept invitation
- link accepted employee accounts to existing employee records

### Vacation Workflow

Current vacation flow supports both directions:

- employee requests vacation -> admin or manager reviews
- admin or manager records a vacation for an employee -> employee confirms it

Annual leave reduces yearly vacation balance only when the request is fully approved.

## Local Development

### 1. Install Dependencies

From the backend folder:

```bash
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

Create `backend/.env`:

```env
DATABASE_URL="postgresql://flowlane:flowlane_dev_password@localhost:5432/flowlane_dev?schema=public"
JWT_SECRET="dev-secret-change-me"
JWT_EXPIRES_IN="7d"
PORT=3001
```

Depending on your mail setup and local configuration, you may also need additional values for invitation delivery.

### 4. Run Prisma

```bash
npx prisma migrate dev
```

This will:

- apply migrations
- create database tables
- generate the Prisma client

### 5. Start the Backend

```bash
npm run dev
```

The backend runs on:

[`http://localhost:3001`](http://localhost:3001)

### 6. Run Prisma Studio

```bash
npx prisma studio
```

Prisma Studio runs on:

[`http://localhost:5555`](http://localhost:5555)

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
  -d '{"email":"test@mail.com","password":"password123"}'
```

Login:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"password123"}'
```

Get current user:

```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Model

- JWT-based authentication
- role-based access control
- bcrypt password hashing
- centralized error handling
- Helmet security middleware
- CORS configuration
- company-scoped protected workflows

## Current Status

Implemented and working:

- layered backend architecture
- PostgreSQL + Prisma integration
- auth and role handling
- company setup
- employee management
- department management
- invitation flows
- dashboard statistics
- vacation request workflows

Areas still worth strengthening:

- automated tests
- rate limiting
- audit logging
- deployment and CI/CD
- stronger API hardening and validation coverage

## Planned LLM Integration

One of the next product directions is a focused LLM assistant inside Flowlane, aimed at helping employees ask practical HR questions inside the app.

The goal is not a generic chatbot. The goal is a narrow, useful assistant that can answer questions such as:

- how many vacation days do I have left
- what type of leave applies in my case
- what is the status of my request
- what company information or contract details are already on file

The intended approach is:

- use real employee and company context from the database
- keep answers role-aware and scoped to the signed-in user
- separate factual stored data from generated explanation
- position the assistant as a support layer, not as a legal authority

This LLM direction is meant to improve the product and also demonstrate practical experience with retrieval, prompt design, permissions, and safe business-context AI integration.

## Author

Illia Savytskyi
