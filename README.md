# Ahoum — Sessions Marketplace

OAuth-authenticated sessions marketplace. Browse a public catalog, book sessions,
and manage them through role-based dashboards.

**Stack:** React (Vite + TypeScript) · Django + DRF · PostgreSQL · Nginx · Docker Compose
· Google OAuth + JWT.

> Status: **Phase 0 — scaffold & compose skeleton.** The four containers boot and the
> frontend reaches the backend health endpoint through Nginx. Features land in later phases
> (see `implementation.pdf`).

## Quickstart

```bash
# 1. clone, then from the repo root:
cp .env.example .env          # adjust secrets as needed
docker compose up --build     # builds and starts all 4 services
# 2. open the app
open http://localhost          # SPA, served through nginx
```

What you should see: the landing page with an "API ok · ahoum-backend" status pill,
confirming the proxy → frontend and proxy → backend → db paths all work.

Useful URLs:

| URL | Serves |
| --- | --- |
| `http://localhost/` | Frontend SPA |
| `http://localhost/api/health/` | Backend health JSON |
| `http://localhost/admin/` | Django admin |

## Project layout

```
ahoum/
├─ docker-compose.yml        # proxy · frontend · backend · db (+ minio, bonus)
├─ .env.example              # all required variables
├─ nginx/default.conf        # reverse proxy routing
├─ backend/                  # Django + DRF
│  ├─ config/                # settings, urls, wsgi/asgi, health
│  └─ accounts/ sessions/ bookings/ payments/
└─ frontend/                 # Vite + React + TS + Tailwind + TanStack Query
   └─ src/
```

## Local dev (without Docker)

```bash
# backend
cd backend && python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate && python manage.py runserver   # needs a local Postgres

# frontend (separate shell) — vite proxies /api to :8000
cd frontend && npm install && npm run dev
```

## Roadmap

OAuth + JWT, profiles, sessions CRUD, booking, dashboards, then bonus
(payments · MinIO · rate limiting). Full plan in `implementation.pdf`.

## Environment variables

See `.env.example`. OAuth client setup steps and the scripted demo flow are added
alongside the auth and feature phases.
