# Myntra Dashboard - Vercel + Free Oracle Cloud Deployment Plan

## Goal
Deploy the Next.js frontend on Vercel (free hobby tier) and the backend services on Oracle Cloud's Always Free tier.

## Tooling (all free)
- **Frontend:** Vercel hobby plan
- **Backend VM:** Oracle Cloud `VM.Standard.A1.Flex` (up to 4 OCPUs and 24 GB RAM, always free)
- **DNS:** Cloudflare free plan
- **Backend SSL:** Caddy with automatic Let's Encrypt
- **Container runtime:** Docker + Docker Compose

## Pre-requisites
1. A GitHub repository at `https://github.com/swetapadmaswain/myntra-dashboard`.
2. A Vercel account linked to GitHub.
3. An Oracle Cloud account with a free trial.
4. A domain you control.
5. A YouTube Data API v3 key.

---

## Step 1 - Provision the free backend server

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

## Step 2 - Configure DNS

Use a subdomain for the API and the main (or another) domain for Vercel.

1. In Cloudflare, add:
   - `A` record for `api.example.com` → Oracle Cloud public IP
   - `CNAME` record for `app.example.com` → `cname.vercel-dns.com` (or use Vercel's auto-assigned domain for now)
2. If you don't want a custom domain on Vercel, you can use the default `*.vercel.app` URL.

---

## Step 3 - Prepare the Oracle server

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

## Step 4 - Configure backend environment

```bash
cp .env.prod.example .env
nano .env
```

Fill in at least:
- `API_DOMAIN` (e.g. `api.example.com`)
- `POSTGRES_PASSWORD`
- `MONGODB_PASSWORD`
- `JWT_SECRET`
- `YOUTUBE_API_KEY`
- `CORS_ORIGINS` = your Vercel frontend URL, e.g. `https://myntra-dashboard.vercel.app,https://app.example.com`

Save and exit.

---

## Step 5 - Deploy the backend

```bash
./deploy-backend.sh
```

This builds and starts the API, databases, NLP, analytics, and data ingestion services on the Oracle VM.

---

## Step 6 - Deploy the frontend on Vercel

1. Go to https://vercel.com and click **Add New... > Project**.
2. Import `swetapadmaswain/myntra-dashboard` and select the `develop` branch.
3. Set **Root Directory** to `frontend`.
4. Add environment variable `NEXT_PUBLIC_API_URL` = `https://api.example.com/api/v1`.
5. Click **Deploy**.

---

## Step 7 - Verify

```bash
docker compose -f docker-compose.backend.yml ps
curl -f https://api.example.com/api/v1/dashboard/metrics
```

Open the Vercel production URL. The dashboard should load and call the Oracle backend.

---

## Step 8 - Trigger initial YouTube ingestion

```bash
docker compose -f docker-compose.backend.yml exec data-ingestion \
  curl -X POST "http://localhost:8002/ingest/youtube?limit=300"
```

---

## Notes
- The Oracle A1 shape is free and has enough RAM (24 GB) to run the whole backend stack, including the NLP model.
- If you get CORS errors, update `CORS_ORIGINS` in `.env` and re-run `./deploy-backend.sh`.
