# Project Tracker

Mini internal **Project Tracker** built with **Next.js 16**, **NestJS 11**, **Prisma 6**, and **MySQL**.

This app helps a digital team track **Clients**, **Projects**, and **Tasks** in one place.

## What’s Included

- Dashboard with key metrics
- Client management
- Project management with status updates
- Task management with assignment, priority, due dates, and filtering
- Server-side business rule: a project cannot be marked **Completed** while it still has unfinished tasks
- Seed data for review

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind 4, TypeScript
- **Backend**: NestJS 11, TypeScript
- **Database**: MySQL via Prisma 6

## Prerequisites

- Node.js >= 18
- MySQL Server
- npm

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd project-tracker
```

### 2. Database setup

Install and start MySQL, then create the database:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS project_tracker;"
```

### 3. Backend setup

```bash
cd backend
cp .env.example .env
```

Update `DATABASE_URL` in `.env` if your MySQL credentials differ.

Install dependencies:

```bash
npm install
```

Generate Prisma client and run migrations:

```bash
npx prisma migrate dev
```

Load demo data:

```bash
npx prisma db seed
```

Start the backend server:

```bash
npm run start:dev
```

Backend runs on `http://localhost:3001`.

### 4. Frontend setup

Open a new terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `PORT` | Backend port, default `3001` |
| `CORS_ORIGIN` | Allowed frontend origin |

### Frontend

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

## API Endpoints

### Clients

- `GET /api/clients` - List all clients
- `POST /api/clients` - Create a client
- `GET /api/clients/:id` - Get a client
- `PATCH /api/clients/:id` - Update a client
- `DELETE /api/clients/:id` - Delete a client

### Projects

- `GET /api/projects` - List all projects
- `GET /api/projects?clientId=1` - Filter projects by client
- `POST /api/projects` - Create a project
- `GET /api/projects/:id` - Get a project
- `PATCH /api/projects/:id` - Update a project
- `PATCH /api/projects/:id/status` - Update project status
- `DELETE /api/projects/:id` - Delete a project

### Tasks

- `GET /api/tasks` - List all tasks
- `GET /api/tasks?status=PENDING&priority=HIGH&projectId=1` - Filter tasks
- `POST /api/tasks` - Create a task
- `GET /api/tasks/:id` - Get a task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

### Team Members

- `GET /api/team-members` - List all team members (for task assignment)

## Business Rule

A project **cannot** be marked as `COMPLETED` while it still contains unfinished tasks.

The backend enforces this rule in `ProjectsService.updateStatus()` and returns a `400 Bad Request` with a clear message when the rule is violated.

## Demo Data

Run the seed command to load sample data:

```bash
cd backend
npx prisma db seed
```

The seed includes:
- 3 clients
- 4 projects
- 3 team members
- 8 tasks with mixed statuses, priorities, and due dates

## Assumptions

- No authentication is required per the assessment instructions
- Team members are seeded and used for task assignment; no separate team member management UI is provided
- Project statuses: `PLANNED`, `ACTIVE`, `ON_HOLD`, `COMPLETED`
- Task statuses: `PENDING`, `IN_PROGRESS`, `COMPLETED`
- Task priorities: `LOW`, `MEDIUM`, `HIGH`

## Known Limitations

- No pagination on list endpoints
- No file attachments or comments on tasks
- No advanced search beyond basic filtering
- No role-based access control
- Frontend uses `alert()` for error feedback in some places

## Project Structure

```
project-tracker/
  backend/
    prisma/
      schema.prisma
      seed.ts
      migrations/
    src/
      clients/
      projects/
      tasks/
      dashboard/
      team-members/
      prisma/
  frontend/
    src/
      app/
        dashboard/
        clients/
        projects/
        tasks/
      components/
      lib/
```

## License

This project is for evaluation purposes only.
