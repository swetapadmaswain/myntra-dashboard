# Myntra Dashboard - Free No-Payment Tier Deployment Plan

## Goal
Deploy the frontend on Vercel (free) and the lightweight backend on a free 1 GB VPS, using only free managed services for databases. No payment required as long as you stay within the free limits.

## Why this now works
The heavy BERT/Transformer NLP model has been replaced with a lightweight rule-based/VADER pipeline. The backend now fits in a 1 GB VM with swap.

## Free stack
- **Frontend:** Vercel
- **PostgreSQL:** Supabase
- **MongoDB:** MongoDB Atlas M0 (free)
- **Redis:** Upstash (free)
- **Backend services:** AWS Free Tier `t2.micro` or any 1 GB VPS with Docker
- **SSL:** Caddy (automatic Let's Encrypt)

## Costs
- **Vercel:** free
- **Supabase:** free (500 MB)
- **MongoDB Atlas M0:** free forever (512 MB)
- **Upstash:** free (10,000 commands/day)
- **AWS `t2.micro`:** free for 12 months. Requires a card for verification, but is not charged if you stay within limits.

If you cannot use any card at all, the only remaining option is Oracle Cloud Always Free. All other 1 GB free trials require a card for verification.

## Pre-requisites
1. A GitHub repository at `https://github.com/swetapadmaswain/myntra-dashboard`.
2. A Vercel account linked to GitHub.
3. An AWS account.
4. A Supabase account.
5. A MongoDB Atlas account.
6. An Upstash account.
7. A domain you control.
8. A YouTube Data API v3 key.

---

## Step 1 - Set up managed databases

### Supabase PostgreSQL
1. Open https://supabase.com and create a new project.
2. In **Project Settings > Database**, copy the URI.
3. Note:
   - `POSTGRES_HOST` = `db.<id>.supabase.co`
   - `POSTGRES_PORT` = `5432`
   - `POSTGRES_DB` = `postgres`
   - `POSTGRES_USER` = `postgres`
   - `POSTGRES_PASSWORD` = your project password

### MongoDB Atlas
1. Open https://www.mongodb.com/atlas and create a cluster (M0 free tier).
2. Allow network access from `0.0.0.0/0` or your VM IP.
3. Create a database user and get the connection string:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority`
4. Set `MONGODB_HOST` to the cluster host, `MONGODB_USER`, `MONGODB_PASSWORD`, and `MONGODB_DB`.

### Upstash Redis
1. Open https://upstash.com and create a Redis database.
2. Copy the **Redis URL** or the endpoint + token.
3. Set `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD`.

---

## Step 2 - Provision the free AWS `t2.micro` VM

1. Sign in at https://aws.amazon.com and open the EC2 console.
2. Click **Launch instance**.
3. Name it `myntra-dashboard`.
4. Select the **Ubuntu 22.04** AMI.
5. Select instance type **t2.micro** (free tier eligible).
6. Create a key pair and download it.
7. In **Network settings**, create or edit the security group and open TCP ports:
   - `22` (SSH)
   - `80` (HTTP)
   - `443` (HTTPS)
8. Launch the instance.
9. Note the public IPv4 address.

---

## Step 3 - Add swap and install Docker

SSH into the server:

```bash
ssh -i <your-key>.pem ubuntu@<aws-ip>

sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo sysctl vm.swappiness=60

sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER
newgrp docker
```

---

## Step 4 - Configure DNS

In your DNS provider, add:
- `A` record for `api.example.com` → AWS public IP
- `CNAME` record for `app.example.com` → `cname.vercel-dns.com` (or use the Vercel default URL)

---

## Step 5 - Clone and configure the project

```bash
git clone https://github.com/swetapadmaswain/myntra-dashboard.git
cd myntra-dashboard
git checkout develop

cp .env.prod.example .env
nano .env
```

Fill in:
- `API_DOMAIN` = `api.example.com`
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_SSLMODE=require`
- `MONGODB_HOST`, `MONGODB_PORT`, `MONGODB_DB`, `MONGODB_USER`, `MONGODB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `JWT_SECRET`
- `YOUTUBE_API_KEY`
- `CORS_ORIGINS` = your Vercel URL

Save and exit.

---

## Step 6 - Deploy the backend

```bash
./deploy-free.sh
```

This uses `docker-compose.free.yml` which only runs the app containers (no local databases).

---

## Step 7 - Deploy the frontend on Vercel

1. Go to https://vercel.com and add a new project.
2. Import `swetapadmaswain/myntra-dashboard` and select the `develop` branch.
3. Set **Root Directory** to `frontend`.
4. Add `NEXT_PUBLIC_API_URL` = `https://api.example.com/api/v1`.
5. Click **Deploy**.

---

## Step 8 - Verify

```bash
docker compose -f docker-compose.free.yml ps
curl -f https://api.example.com/api/v1/dashboard/metrics
```

---

## Step 9 - Ingest some YouTube data

```bash
docker compose -f docker-compose.free.yml exec data-ingestion \
  curl -X POST "http://localhost:8002/ingest/youtube?limit=100"
```

---

## Notes
- The AWS `t2.micro` has only 1 GB RAM, so swap is required.
- Sentiment, intent, and hesitation are now rule-based/VADER instead of BERT. Results are less accurate but the service fits on a free VM.
- If any free database limit is reached, upgrade or switch to a paid plan.
