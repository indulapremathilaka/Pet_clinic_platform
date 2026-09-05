# PetConnect Lanka — Pet Clinic Platform

A full-stack web application connecting pet owners and veterinary clinics in Sri Lanka, built for **SE204.3 — Development of Enterprise Applications I** (National School of Business Management).

Pet owners post questions about their pets' symptoms, vaccines, and diet; verified veterinary clinics answer by commenting. Clinics must first submit a registration request, which an Administrator reviews and approves before the clinic can log in and participate.

## Features

- **Clinic registration workflow** — clinics self-register but stay in a `PENDING` state; an Admin approves, rejects (with a reason), or suspends them. Only `APPROVED` clinics can log in and answer questions.
- **Admin dashboard** — live stats, a queue of pending clinic requests, a directory of all clinics with status management, and full pet-owner account management (activate/deactivate, delete).
- **Pet owner accounts** — instant self-signup, pet profile management (name, species, breed, age, gender), and a personal question history.
- **Community Q&A** — pet owners post categorized questions (vaccination, disease, nutrition, behavior, grooming, general); approved clinics answer via comments; owners can mark their question resolved.
- **Public browsing** — anyone can browse the Q&A feed and the approved-clinic directory without an account.
- **Role-based auth** — JWT-based authentication with three roles: `ADMIN`, `CLINIC`, `PET_OWNER`, enforced on both API routes and the frontend.

## Tech stack

| Layer     | Technology                                                            |
|-----------|------------------------------------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, React Router, Tailwind CSS, Axios          |
| Backend   | Node.js, Express, TypeScript, Zod validation, JWT auth, bcrypt         |
| Database  | PostgreSQL, accessed via **Drizzle ORM** (type-safe SQL, migrations)   |
| Tooling   | Docker Compose for one-command local dev                              |

> Drizzle ORM was chosen over alternatives that require downloading pre-built native binaries at install time (which can be blocked by restrictive network/firewall policies) — it's pure TypeScript/JS on top of `pg`, and just as type-safe.

## Project structure

```
pet-clinic-platform/
├── backend/                 Express + TypeScript API
│   ├── src/
│   │   ├── controllers/     Route handlers (auth, admin, clinic, pet, question)
│   │   ├── routes/          Express routers, one per resource
│   │   ├── middleware/      JWT auth, role authorization, error handling
│   │   ├── db/              Drizzle schema, client, migration runner, seed script
│   │   ├── config/          Environment loading
│   │   └── utils/           JWT helpers, ApiError
│   ├── drizzle/              Generated SQL migrations
│   └── drizzle.config.ts
├── frontend/                 React + TypeScript SPA
│   └── src/
│       ├── pages/            One component per route (Landing, Login, dashboards, Q&A, etc.)
│       ├── components/       Navbar, ProtectedRoute, badges, Spinner
│       ├── context/          AuthContext (JWT session state)
│       ├── api/              Axios client
│       └── types/            Shared TypeScript types mirroring the API
└── docker-compose.yml         Postgres + backend + frontend, one command
```

## Data model

- **User** — email, password hash, role (`ADMIN` / `CLINIC` / `PET_OWNER`), active flag.
- **Clinic** — 1:1 with a `CLINIC` user; registration details plus `status` (`PENDING` / `APPROVED` / `REJECTED` / `SUSPENDED`) and review metadata.
- **PetOwner** — 1:1 with a `PET_OWNER` user; profile details.
- **Pet** — belongs to a PetOwner; name, species, breed, age, gender, notes.
- **Question** — belongs to a PetOwner (optionally linked to one of their Pets); title, body, category, resolved flag.
- **Comment** — a Clinic's answer to a Question.

## Getting started

### Option A — Docker Compose (recommended)

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

This starts Postgres, runs migrations, seeds demo data, and starts both the API (`:4000`) and the frontend (`:5173`).

Open http://localhost:5173.

### Option B — Run locally without Docker

Requires Node.js 20+ and a local PostgreSQL instance.

**1. Backend**

```bash
cd backend
cp .env.example .env      # edit DATABASE_URL if needed
npm install
npm run db:generate       # (re-)generate SQL from the Drizzle schema, if you change it
npm run db:migrate        # apply migrations
npm run db:seed           # create demo admin/clinic/owner accounts
npm run dev                # starts on http://localhost:4000
```

**2. Frontend** (in a second terminal)

```bash
cd frontend
cp .env.example .env      # points to http://localhost:4000/api by default
npm install
npm run dev                # starts on http://localhost:5173
```

## Demo accounts (created by the seed script)

| Role               | Email                    | Password       | Notes                          |
|--------------------|--------------------------|----------------|---------------------------------|
| Admin              | admin@petclinic.lk       | Admin@12345    | Full platform administration    |
| Clinic (approved)  | care@happypaws.lk        | Clinic@12345   | Can log in and answer questions |
| Clinic (pending)   | info@centralvet.lk       | Clinic@12345   | Blocked until admin approves    |
| Pet owner          | nimal@example.com        | Owner@12345    | Has one pet and one question    |

## Key flows to try

1. **Clinic approval** — log in as Admin → "Pending requests" tab → Approve or Reject `Central Veterinary Hospital`. Then try logging in as `info@centralvet.lk` before and after approval to see the gate in action.
2. **Ask a question** — log in as the pet owner → "Ask a question" → post something in any category.
3. **Answer a question** — log in as the approved clinic (`care@happypaws.lk`) → Community Q&A → open a question → post an answer.
4. **Account management** — as Admin, deactivate or permanently delete a clinic or pet-owner account from the "All clinics" / "Pet owners" tabs.

## API overview

All endpoints are prefixed with `/api`. Authenticated requests send `Authorization: Bearer <token>`.

| Method & path                              | Access          | Description                              |
|---------------------------------------------|-----------------|-------------------------------------------|
| `POST /auth/register/clinic`                 | Public          | Submit a clinic registration request       |
| `POST /auth/register/pet-owner`              | Public          | Create a pet owner account instantly       |
| `POST /auth/login`                           | Public          | Log in, returns a JWT                      |
| `GET /auth/me`                               | Authenticated   | Current user + profile                     |
| `GET /admin/stats`                           | Admin           | Dashboard counters                         |
| `GET /admin/clinics?status=`                 | Admin           | List clinics by status                     |
| `PATCH /admin/clinics/:id/approve`           | Admin           | Approve a clinic request                   |
| `PATCH /admin/clinics/:id/reject`            | Admin           | Reject with an optional reason             |
| `PATCH /admin/clinics/:id/suspend`           | Admin           | Suspend an approved clinic                 |
| `GET /admin/pet-owners`                      | Admin           | List all pet owners                        |
| `PATCH /admin/users/:id/toggle-active`       | Admin           | Activate/deactivate an account             |
| `DELETE /admin/users/:id`                    | Admin           | Delete a clinic or pet-owner account        |
| `GET /clinics`                               | Public          | Directory of approved clinics              |
| `GET/PATCH /clinics/me`                      | Clinic          | View/update own clinic profile             |
| `GET /pets`, `POST /pets`, `PATCH/DELETE /pets/:id` | Pet owner | Manage own pets                    |
| `GET /questions`                             | Public          | Browse/search/filter questions             |
| `POST /questions`                            | Pet owner       | Post a new question                        |
| `PATCH /questions/:id/resolve`               | Pet owner       | Toggle resolved status (author only)       |
| `POST /questions/:id/comments`               | Clinic          | Answer a question                          |
| `DELETE /questions/:id`, `DELETE .../comments/:commentId` | Owner/Clinic/Admin | Delete own content     |

## Notes & assumptions

The original assignment brief was intentionally minimal (no rubric, deadline, or tech-stack requirement). The following decisions were made to fill the gaps sensibly:

- Pet owners can self-register instantly (no approval needed) since the brief only describes an approval gate for clinics.
- Pets are modeled as their own entity so questions can optionally reference a specific pet.
- "Comments" are modeled as a flat list per question (one clinic answer per comment, no nested replies), matching "clinics can answer the queries by commenting on them."
- A `SUSPENDED` clinic status was added beyond the brief's approve/reject flow, since the brief says an admin can "update/delete" registered clinics — suspension is a safer, reversible alternative to outright deletion for temporarily disabling a clinic.
