# Myntra Dashboard - Vercel + Free Oracle Cloud + Supabase Deployment Plan

## Goal
Deploy the Next.js frontend on Vercel (free), the backend services on Oracle Cloud (free), and PostgreSQL on Supabase (free tier).

## Tooling (all free)
- **Frontend:** Vercel hobby plan
- **Backend VM:** Oracle Cloud `VM.Standard.A1.Flex` (up to 4 OCPUs and 24 GB RAM, always free)
- **PostgreSQL:** Supabase free tier
- **MongoDB / Redis:** self-hosted on the Oracle VM
- **DNS:** Cloudflare free plan
- **Backend SSL:** Caddy with automatic Let's Encrypt
- **Container runtime:** Docker + Docker Compose

## Pre-requisites
1. A GitHub repository at `https://github.com/swetapadmaswain/myntra-dashboard`.
2. A Vercel account linked to GitHub.
3. An Oracle Cloud account with a free trial.
4. A Supabase account.
5. A domain you control.
6. A YouTube Data API v3 key.

---

## Step 1 - Set up Supabase PostgreSQL

1. Open https://supabase.com and create a new project.
2. Pick a region close to your Oracle VM.
3. In **Project Settings > Database**, copy the **Connection string > URI** value. It looks like:
   `postgresql://postgres:<password>@db.<id>.supabase.co:5432/postgres`
4. Note these values:
   - `POSTGRES_HOST` = `db.<id>.supabase.co`
   - `POSTGRES_PORT` = `5432`
   - `POSTGRES_DB` = `postgres`
   - `POSTGRES_USER` = `postgres`
   - `POSTGRES_PASSWORD` = your project password

---

## Step 2 - Provision the free backend server

1. Sign in at https://cloud.oracle.com and go to **Compute > Instances**.
2. Click **Create Instance**.
3. Choose the **VM.Standard.A1.Flex** shape and give it the full free allowance:
   - OCPUs: `4`
   - Memory: `24 GB`
   - Boot volume: `100 GB`
4. Use **Ubuntu 22.04** for the image.
5. Add an SSH key and download the private key.
6. Open TCP ports `22`, `80`, and `443` in the instance's security list.
7. Copy the public IP.

---

## Step 3 - Configure DNS

1. In Cloudflare, add:
   - `A` record for `api.example.com` → Oracle Cloud public IP
   - `CNAME` record for `app.example.com` → `cname.vercel-dns.com` (or use the Vercel default URL)
2. If you don't want a custom domain on Vercel, you can use the default `*.vercel.app` URL.

---

## Step 4 - Prepare the Oracle server

SSH in and install Docker:

```bash
ssh -i <your-key>.key ubuntu@<oracle-ip>

sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER
newgrp docker
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
- `MONGODB_PASSWORD` (strong random value for the local MongoDB container)
- `JWT_SECRET` (strong random value)
- `YOUTUBE_API_KEY`
- `CORS_ORIGINS` = your Vercel frontend URL, e.g. `https://myntra-dashboard.vercel.app,https://app.example.com`

Save and exit.

---

## Step 6 - Deploy the backend

```bash
./deploy-backend.sh
```

This builds and starts the API, NLP, analytics, data ingestion, MongoDB, and Redis services on the Oracle VM. PostgreSQL is provided by Supabase.

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

Open the Vercel production URL. The dashboard should load and call the Oracle backend.

---

## Step 9 - Trigger initial YouTube ingestion

```bash
docker compose -f docker-compose.backend.yml exec data-ingestion \
  curl -X POST "http://localhost:8002/ingest/youtube?limit=300"
```

---

## Notes
- Supabase's free PostgreSQL has a 500 MB limit. The raw MongoDB data and analytics cache live on the Oracle VM, so Postgres is mainly for metadata and analytics tables.
- If you hit the Supabase 500 MB limit, you can either upgrade Supabase or move Postgres back to the Oracle VM (`docker-compose.prod.yml`).
