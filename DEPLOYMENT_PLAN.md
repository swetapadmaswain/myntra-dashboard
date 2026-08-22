# Myntra Dashboard - Vercel + Hetzner + Supabase Deployment Plan

## Goal
Deploy the Next.js frontend on Vercel, the backend services on a cheap Hetzner VPS, and PostgreSQL on Supabase.

## Cost
- **Vercel** — free hobby plan
- **Supabase** — free tier (500 MB)
- **Hetzner** — ~€5.35/month for a `CX21` (2 vCPU, 4 GB RAM) or ~€7.18/month for `CPX21` (2 vCPU, 4 GB RAM, NVMe). For the NLP model, `CX31` (8 GB RAM, ~€10/month) is safer.

If you need a 100% free alternative, the only realistic path is to remove the local NLP model and use a third-party API, then run the rest on a free `t3.micro` or `e2-micro`. That is not covered in this guide.

## Tooling
- **Frontend:** Vercel
- **Backend VM:** Hetzner Cloud
- **PostgreSQL:** Supabase
- **MongoDB / Redis:** self-hosted on the Hetzner VPS
- **DNS:** Cloudflare
- **SSL:** Caddy
- **Container runtime:** Docker + Docker Compose

## Pre-requisites
1. A GitHub repository at `https://github.com/swetapadmaswain/myntra-dashboard`.
2. A Vercel account linked to GitHub.
3. A Hetzner account with a payment method.
4. A Supabase account.
5. A domain you control.
6. A YouTube Data API v3 key.

---

## Step 1 - Set up Supabase PostgreSQL

1. Open https://supabase.com and create a new project.
2. In **Project Settings > Database**, copy the **Connection string > URI** value. It looks like:
   `postgresql://postgres:<password>@db.<id>.supabase.co:5432/postgres`
3. Note these values:
   - `POSTGRES_HOST` = `db.<id>.supabase.co`
   - `POSTGRES_PORT` = `5432`
   - `POSTGRES_DB` = `postgres`
   - `POSTGRES_USER` = `postgres`
   - `POSTGRES_PASSWORD` = your project password

---

## Step 2 - Provision the Hetzner server

1. Sign in at https://console.hetzner.cloud.
2. Go to **Projects > Add Server**.
3. Choose a location close to your users.
4. Pick an image: **Ubuntu 22.04**.
5. Pick a type. Recommended:
   - `CX21` (2 vCPU, 4 GB) if budget is tight
   - `CX31` or `CPX31` (2 vCPU, 8 GB) if the NLP model is large
6. Add an SSH key and give the server a name.
7. Create the server and copy the public IPv4 address.

---

## Step 3 - Configure DNS

1. In Cloudflare (or your DNS provider), add:
   - `A` record for `api.example.com` → Hetzner public IP
   - `CNAME` record for `app.example.com` → `cname.vercel-dns.com` (optional)
2. If you don't want a custom domain on Vercel, you can use the default `*.vercel.app` URL.

---

## Step 4 - Prepare the server

SSH in and install Docker:

```bash
ssh root@<hetzner-ip>

apt update && apt install -y docker.io docker-compose-v2 git
usermod -aG docker root
```

Clone the repo:

```bash
git clone https://github.com/swetapadmaswain/myntra-dashboard.git
cd myntra-dashboard
git checkout develop
```

---

## Step 5 - Configure the environment

```bash
cp .env.prod.example .env
nano .env
```

Fill in:

- `API_DOMAIN` (e.g. `api.example.com`)
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (from Supabase)
- `POSTGRES_SSLMODE` = `require`
- `MONGODB_PASSWORD` (strong random value)
- `JWT_SECRET` (strong random value)
- `YOUTUBE_API_KEY`
- `CORS_ORIGINS` = your Vercel frontend URL, e.g. `https://myntra-dashboard.vercel.app`

Save and exit.

---

## Step 6 - Deploy the backend

```bash
./deploy-backend.sh
```

This builds and starts the API, NLP, analytics, data ingestion, MongoDB, and Redis services on Hetzner. PostgreSQL is provided by Supabase.

---

## Step 7 - Deploy the frontend on Vercel

1. Go to https://vercel.com and click **Add New... > Project**.
2. Import `swetapadmaswain/myntra-dashboard` and select the `develop` branch.
3. Set **Root Directory** to `frontend`.
4. Add the environment variable `NEXT_PUBLIC_API_URL` = `https://api.example.com/api/v1`.
5. Click **Deploy**.

---

## Step 8 - Verify

```bash
docker compose -f docker-compose.backend.yml ps
curl -f https://api.example.com/api/v1/dashboard/metrics
```

Open the Vercel production URL.

---

## Step 9 - Trigger initial YouTube ingestion

```bash
docker compose -f docker-compose.backend.yml exec data-ingestion \
  curl -X POST "http://localhost:8002/ingest/youtube?limit=300"
```
