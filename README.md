# Ahoum — Sessions Marketplace

A full-stack wellness sessions marketplace. People sign in with Google, browse a
public catalog of live sessions, and book a seat. Teachers ("creators") publish and
manage their own sessions and see who booked. The whole system runs from a single
`docker compose up`.

---

## Project Overview

Ahoum is a two-sided marketplace for guided wellness sessions (meditation, breathwork,
yoga, sound healing, coaching). The frontend is a React single-page app; the backend is
a Django REST API; everything is fronted by a single Nginx reverse proxy.

### Features

- **Google OAuth sign-in** with backend-issued JWTs (access + refresh, silent auto-refresh).
- **Two roles** — *User* (browse & book) and *Creator* (publish & manage sessions). Role is a self-serve toggle in the profile.
- **Public catalog** with live search, category and format (online / in-person) filters, and animated tiles.
- **Session detail page** with booking, a clear "Session not available" state, and "Your session" / "Booked" awareness.
- **Booking flow** with server-enforced capacity (no overselling), duplicate-booking and own-session guards.
- **Stripe Checkout** for paid sessions (test mode) — the booking is created and marked **Paid** only after the payment is verified by a signed webhook; free sessions book instantly.
- **User Dashboard** — active & past bookings (with cancel, Paid badge) and an editable profile (name, avatar, bio).
- **Creator Dashboard** — create / edit / publish / delete own sessions, with a per-session attendee overview.
- **Reproducible deployment** — four Docker containers, one command, seeded demo catalog on first boot.

### Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18 + TypeScript (Vite), React Router, TanStack Query, GSAP, Tailwind v4 (tokens) |
| Backend | Django 5 + Django REST Framework, SimpleJWT, drf-spectacular |
| Database | PostgreSQL 16 |
| Auth | Google OAuth 2.0 (authorization-code flow) → backend-issued JWT |
| Payments | Stripe Checkout (test mode) with signature-verified webhooks |
| Infrastructure | Docker Compose, Nginx (reverse proxy) |

---

## Setup Instructions

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- A Google account (for the OAuth client — see [Google OAuth Client Setup](#google-oauth-client-setup))
- *(Optional)* A Stripe account in test mode, for paid sessions — see [Payments](#payments-stripe-test-mode)

### 1. Clone the repository

```bash
git clone <your-repo-url> ahoum
cd ahoum
```

### 2. Create the `.env` file

```bash
cp .env.example .env
```

### 3. Configure environment variables

Open `.env` and set at least:

- `DJANGO_SECRET_KEY` — any long random string.
- `POSTGRES_PASSWORD` — a database password.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `VITE_GOOGLE_CLIENT_ID` — from the Google Cloud Console (the client id goes in **both** `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`).

Every variable is explained in [Environment Variables](#environment-variables). You can boot
without the Google values to explore the app via the dev login, but real OAuth needs them.

> **Note:** Frontend (`VITE_*`) variables are **baked into the static bundle at build time**.
> If you change them, rebuild the frontend: `docker compose up -d --build frontend`.

### 4. Run with Docker Compose

```bash
docker compose up --build
```

This builds and starts all four services. The first boot runs migrations and seeds a demo
catalog. When it's ready, open:

| URL | What it serves |
| --- | --- |
| http://localhost | Frontend app |
| http://localhost/api/health/ | Backend health check |
| http://localhost/api/docs/ | Swagger API docs |
| http://localhost/admin/ | Django admin (`admin` / `admin12345` by default) |

### Common Docker commands

```bash
docker compose up --build        # build images and start everything (foreground)
docker compose up -d --build     # same, but detached (background)
docker compose logs -f backend   # follow backend logs (omit name for all)
docker compose ps                # list running services
docker compose down              # stop and remove containers (keeps volumes/data)
docker compose down -v           # also remove volumes (wipes the database)
```

### Running the frontend dev server (optional)

For fast UI iteration with hot-reload, run Vite directly. It proxies `/api` to the
Dockerized backend, so keep `docker compose up` running.

```bash
cd frontend
npm install
npm run dev          # http://localhost:5174
```

---

## Google OAuth Client Setup

Ahoum uses the Google **authorization-code** flow: the browser gets a code from Google,
the backend exchanges it (using the client secret) and issues its own JWT.

### 1. Create a project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).

### 2. Configure the OAuth consent screen

1. **APIs & Services → OAuth consent screen**.
2. Choose **External**, fill in the app name, support email, and developer contact.
3. While the app is in **Testing**, add your Google account under **Test users** (otherwise sign-in is blocked).

### 3. Create OAuth client credentials

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Application type: **Web application**.

### 4. Set Authorized JavaScript origins

```
http://localhost
```

### 5. Set Authorized redirect URIs

```
http://localhost/auth/callback
```

> This must exactly match `OAUTH_REDIRECT_URI` in `.env`. A mismatch produces Google's
> `Error 400: redirect_uri_mismatch`.

### 6. Add the credentials to `.env`

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com   # same client id
OAUTH_REDIRECT_URI=http://localhost/auth/callback
```

Then rebuild so the client id is baked into the frontend:

```bash
docker compose up -d --build frontend backend
```

---

## Payments (Stripe test mode)

Paid sessions are booked through **Stripe Checkout**. The booking is created **only after
Stripe verifies the payment** — via the webhook (and a redirect-return confirm as a safety
net). Free sessions skip payments entirely.

### Enable it

1. In the [Stripe Dashboard](https://dashboard.stripe.com/test) (test mode), copy your **Secret key** (`sk_test_…`).
2. Add it to `.env`:

   ```env
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_CURRENCY=inr            # must be supported by your Stripe account
   FRONTEND_BASE_URL=http://localhost
   ```

3. Forward webhooks to the backend with the [Stripe CLI](https://stripe.com/docs/stripe-cli):

   ```bash
   stripe listen --forward-to http://localhost/api/payments/webhook/
   ```

   Copy the printed signing secret (`whsec_…`) into `.env` as `STRIPE_WEBHOOK_SECRET`, then
   recreate the backend: `docker compose up -d --force-recreate backend`.

### Test the flow

- Open a **paid** session → **Book now** → you're redirected to Stripe Checkout.
- Pay with the test card **`4242 4242 4242 4242`**, any future expiry, any CVC.
- On success you return to the session page; the webhook (and confirm) create the booking and mark it **Paid**. Cancel instead → no booking is made.

> Without `STRIPE_SECRET_KEY`, paid bookings return "Payments are not configured" and free
> sessions still book normally — so the rest of the app runs without Stripe.

## Demo Flow

1. **User signs in with Google.** Open http://localhost → *Log in* → *Continue with Google* → pick an account and consent.
2. **Backend authenticates and issues a JWT.** Google redirects to `/auth/callback?code=…`; the backend exchanges the code, finds-or-creates the user, and returns an access + refresh JWT. The app stores them and signs you in.
3. **Become a creator and create a session.** Open the account menu → *Profile* → toggle **Creator mode** → *Save*. Go to **My sessions** → *+ New session*, fill the form, set status **Published**, and save.
4. **Browse sessions.** On the home page, scroll to *Upcoming sessions*. Use the search box and the practice / format filters to narrow the catalog.
5. **Open a session detail page.** Click a session title to open `/sessions/:id` with full details.
6. **Book the session.** Click **Book now**. For a **free** session the seat is reserved immediately and the button becomes a "You have a seat" confirmation. For a **paid** session you're sent to Stripe Checkout (test card `4242 4242 4242 4242`); the booking is created and marked **Paid** only after the payment succeeds (see [Payments](#payments-stripe-test-mode)).
7. **See it in the User Dashboard.** Account menu → *Your dashboard* → **Bookings** → *Active*. Cancel from here if needed.
8. **Creator sees the booking.** As the session's creator, open **My sessions** → *Attendees* on that session to see who booked.

> **No Google credentials yet?** In development (`DJANGO_DEBUG=1`) the login button falls
> back to a dev login that issues a real JWT without Google, so you can walk the whole flow.

---

## Project Structure

```
ahoum/
├─ docker-compose.yml        # 4 services: proxy, frontend, backend, db
├─ .env.example              # template for environment variables
├─ nginx/
│  └─ default.conf           # reverse proxy: /api,/admin → backend, / → frontend
├─ backend/                  # Django + DRF project
│  ├─ Dockerfile
│  ├─ entrypoint.sh          # migrate + collectstatic + seed, then run server
│  ├─ requirements.txt
│  ├─ config/                # project settings, root urls, wsgi/asgi
│  ├─ accounts/              # Profile model, roles, Google OAuth + JWT, /api/me, permissions
│  ├─ sessions/              # Session model, sessions API, seed_demo command
│  ├─ bookings/              # Booking model, booking service (capacity guard), bookings API
│  └─ payments/              # Payment model, Stripe Checkout, signed webhook + confirm
└─ frontend/                 # React (Vite) single-page app
   ├─ Dockerfile             # multi-stage: build with Node, serve static with Nginx
   ├─ nginx.conf             # SPA history fallback
   └─ src/
      ├─ pages/              # Home, SessionDetail, Dashboard, AuthCallback
      ├─ components/         # landing sections, cards, overlays, ui primitives
      │  └─ dashboard/       # Bookings, Profile, Creator panels + session form dialog
      ├─ auth/               # AppContext (auth state, login, refresh)
      ├─ lib/                # API client, auth/token store, session mappers, icons
      ├─ data/               # static content + types
      └─ styles/             # design tokens (theme.css)
```

### Backend apps at a glance

- **`accounts`** — `Profile` (role, display name, avatar, verified), Google code-exchange (`/api/auth/google/`), `/api/me`, and DRF permission classes (`IsCreator`, `IsOwnerOrReadOnly`).
- **`sessions`** — the `Session` model and its CRUD API, plus the `seed_demo` management command. (Its Django app label is `catalog` to avoid clashing with `django.contrib.sessions`.)
- **`bookings`** — the `Booking` model and the booking service, where capacity, duplicate, and own-session rules are enforced inside a database transaction.
- **`payments`** — the `Payment` model and Stripe Checkout integration: `/api/payments/checkout/` starts a hosted checkout, and the signature-verified `/api/payments/webhook/` (plus a redirect `/api/payments/confirm/` safety net) creates the booking only after Stripe verifies the payment.

---

## Environment Variables

All variables live in `.env` (copied from `.env.example`). The file is read by Docker
Compose for `${VAR}` interpolation and passed into the backend container.

### PostgreSQL

| Variable | Description |
| --- | --- |
| `POSTGRES_DB` | Database name. |
| `POSTGRES_USER` | Database user. |
| `POSTGRES_PASSWORD` | Database password. **Change for any real deployment.** |
| `POSTGRES_HOST` | Database host. `db` (the compose service name) inside Docker. |
| `POSTGRES_PORT` | Database port. Default `5432`. |

### Django

| Variable | Description |
| --- | --- |
| `DJANGO_SECRET_KEY` | Django cryptographic secret. Use a long random value. |
| `DJANGO_DEBUG` | `1` for development, `0` for production. Also enables the dev-login fallback. |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hosts Django will serve. |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins allowed to call the API (browser CORS). |
| `CSRF_TRUSTED_ORIGINS` | Comma-separated origins trusted for CSRF. |

### JWT

| Variable | Description |
| --- | --- |
| `JWT_ACCESS_MIN` | Access-token lifetime in minutes (default `15`). |
| `JWT_REFRESH_DAYS` | Refresh-token lifetime in days (default `7`). |

### Dev superuser (auto-created on boot)

| Variable | Description |
| --- | --- |
| `DJANGO_SUPERUSER_USERNAME` | Admin username created on first boot (for `/admin/`). |
| `DJANGO_SUPERUSER_EMAIL` | Admin email. |
| `DJANGO_SUPERUSER_PASSWORD` | Admin password. **Change for any real deployment.** |

### Google OAuth

| Variable | Description |
| --- | --- |
| `GOOGLE_CLIENT_ID` | OAuth client ID (used by the backend during the code exchange). |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret (backend only — never exposed to the browser). |
| `OAUTH_REDIRECT_URI` | Redirect URI; must match the value registered in Google Cloud. |

### Frontend (build-time)

| Variable | Description |
| --- | --- |
| `VITE_API_BASE` | API base path the SPA calls. Default `/api` (the Nginx proxy handles routing). |
| `VITE_GOOGLE_CLIENT_ID` | Public OAuth client ID, baked into the bundle to build the Google sign-in URL. Same value as `GOOGLE_CLIENT_ID`. |

### Stripe (paid sessions)

| Variable | Description |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_…`). Backend only. Leave blank to disable paid bookings. |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_…`) used to verify incoming Stripe events. |
| `STRIPE_CURRENCY` | ISO currency code for checkout (default `inr`; must be supported by your Stripe account). |
| `FRONTEND_BASE_URL` | Where Stripe redirects the user back after checkout (default `http://localhost`). |

### Bonus (optional, commented out)

`MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_BUCKET` — reserved for the object-storage bonus feature.

---

## Notes & Troubleshooting

- **`redirect_uri_mismatch`** — the redirect URI in Google Cloud must be exactly `http://localhost/auth/callback`, and `OAUTH_REDIRECT_URI` must match.
- **Google button does nothing / falls back to dev login** — `VITE_GOOGLE_CLIENT_ID` is empty or the frontend wasn't rebuilt after setting it. Run `docker compose up -d --build frontend`.
- **`exec ./entrypoint.sh: permission denied`** — `backend/entrypoint.sh` must be executable: `chmod +x backend/entrypoint.sh`.
- **Reset everything** — `docker compose down -v` wipes the database; the next `up` re-seeds the demo catalog.
