# taskMeter — Team Task Manager

A full-stack team task manager inspired by Linear. Built with **Node.js + Express + MongoDB** on the backend, and **Vite + React + TypeScript + Tailwind + shadcn/ui** on the frontend. Ships with a clean, dark-first UI, full role-based access control (Admin/Member), and a live analytics dashboard.

> Assignment: Team Task Manager (Full-Stack)

---

## ✨ Features

- **Authentication** — JWT-based signup & login, secure password hashing (bcrypt). The first user becomes admin automatically.
- **Role-based access (Admin / Member)** — admins can manage all users, projects, and teams.
- **Projects** — create, edit, delete; status, priority, color, due date; member management.
- **Tasks** — create, assign, set status, priority, due date, labels, comments. Kanban board + list view.
- **Teams** — group people with custom colors & roles.
- **Dashboard** — real-time stats, completion trend (area), status breakdown (pie), priority distribution (bar), upcoming tasks, recent activity.
- **Linear-inspired UI** — gradient accents, subtle animations, monospace project keys, clean spacing.
- **Light & Dark themes** — beautifully tuned tokens for both.
- **Search, filters, board/list views, comments, member roles, and more.**

---

## 🧱 Tech Stack

| Layer    | Stack |
|---------|-------|
| Frontend | Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix), Zustand, React Router, Axios, Recharts, Sonner |
| Backend  | Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, helmet, cors, rate-limit |
| Deploy   | Railway (configs included) |

---

## 📁 Project structure

```
taskmanagement/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── railway.json
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/        # ui, layout, projects, tasks, etc.
    │   ├── context/
    │   ├── hooks/
    │   ├── lib/
    │   ├── pages/
    │   ├── store/
    │   ├── types/
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env.example
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Getting started (Local Development)

### Prerequisites
- Node.js 18+
- npm or pnpm
- MongoDB Atlas cluster (or local MongoDB)

### 1) Clone & install

```bash
git clone <your-repo-url>
cd taskmanagement

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2) Configure environment variables

Copy each `.env.example` to `.env` and fill in the values:

**`backend/.env`**
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskmanagement
JWT_SECRET=<a-long-random-string>
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3) Run

In two terminals:

```bash
# terminal 1 — backend
cd backend
npm run dev          # starts on http://localhost:5000

# terminal 2 — frontend
cd frontend
npm run dev          # starts on http://localhost:5173
```

Open http://localhost:5173 and sign up. The first registered user becomes the **admin**.

---

## 🌐 Deploying to Railway

This repo includes `railway.json` for both services.

### Backend
1. Create a new Railway service from `backend/`.
2. Add env vars:
   - `MONGODB_URI` (Atlas)
   - `JWT_SECRET`
   - `CLIENT_URL` (your deployed frontend URL)
   - `NODE_ENV=production`
   - `PORT` is supplied by Railway automatically
3. Deploy. Note the public URL.

### Frontend
1. Create another Railway service from `frontend/`.
2. Set:
   - `VITE_API_URL` = `https://<your-backend>.up.railway.app/api`
3. Add a build command: `npm install && npm run build`
4. Start command: `npm run preview -- --port $PORT --host`
5. Deploy.

Update the backend's `CLIENT_URL` to point to the frontend URL.

---

## 🔐 API overview

Base URL: `/api`

### Auth
- `POST /auth/register` – { name, email, password } → user + token
- `POST /auth/login` – { email, password } → user + token
- `GET /auth/me` – current user
- `PUT /auth/profile` – update name/bio/avatar
- `PUT /auth/password` – change password

### Users (admin only for role/delete)
- `GET /users` (search), `GET /users/:id`
- `PUT /users/:id/role`
- `DELETE /users/:id`

### Teams
- `GET /teams`, `POST /teams`
- `GET/PUT/DELETE /teams/:id`
- `POST /teams/:id/members`
- `DELETE /teams/:id/members/:userId`

### Projects
- `GET /projects` (filters: status, search, all=true for admin)
- `POST /projects`
- `GET/PUT/DELETE /projects/:id`
- `POST /projects/:id/members`
- `DELETE /projects/:id/members/:userId`

### Tasks
- `GET /tasks` (filters: project, status, assignee, priority, search, due, mine)
- `POST /tasks`
- `GET/PUT/DELETE /tasks/:id`
- `POST /tasks/:id/comments`
- `DELETE /tasks/:id/comments/:commentId`

### Dashboard
- `GET /dashboard` – stats, charts, upcoming, recent

All non-auth endpoints require `Authorization: Bearer <token>`.

---

## 🛡️ Roles & permissions

- **Admin** — global access: any user, project, team. Can change roles, delete users.
- **Member** — only the projects/teams they own or are members of. Can create their own projects/tasks.
- The **first registered user** is auto-promoted to admin so you have a starting account.

---

## 🧪 Smoke test

1. Register two accounts (one admin, one member).
2. Admin: create a team, add members, assign a project.
3. Member: open a project, create tasks, assign, comment.
4. Admin: open `/app/members` to manage roles.
5. Visit dashboard for live charts & stats.

---

## 📜 License

MIT — feel free to use this as a starter for assignments, internships, or your own product.
