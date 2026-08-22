# Myntra Dashboard - Deployment Plan

## Goal
Deploy the full Myntra Dashboard stack to a live, cost-free (or mostly free) production environment.

## Tooling (all free)
- **Cloud VM:** Oracle Cloud Infrastructure (OCI) Always Free `VM.Standard.A1.Flex` (up to 4 OCPUs and 24 GB RAM)
- **DNS / CDN:** Cloudflare (free plan)
- **SSL:** Caddy (auto-managed Let's Encrypt)
- **Container runtime:** Docker + Docker Compose
- **CI/CD (optional):** GitHub Actions (free for public repos) to build and push images to GitHub Container Registry

## Architecture Overview
The stack is composed of these logical tiers:

1. **Databases:** PostgreSQL, MongoDB, Redis (all self-hosted in Docker)
2. **Backend services:** API Gateway, Data Ingestion, NLP, Analytics (all containerised FastAPI/Express services)
3. **Frontend:** Next.js production build behind a reverse proxy
4. **Proxy / SSL:** Caddy on ports 80/443

All services run on a single OCI `VM.Standard.A1.Flex` instance via `docker-compose.prod.yml`.

## Step-by-step Deployment

### Step 1 - Provision the free cloud server
1. Create an Oracle Cloud Free Tier account at [https://www.oracle.com/cloud/free/](https://www.oracle.com/cloud/free/).
2. In the OCI console, create a `VM.Standard.A1.Flex` instance with:
   - Shape: 4 OCPUs, 24 GB RAM (Always Free-eligible)
   - OS: Canonical Ubuntu 22.04
   - Boot volume: 100 GB
   - Networking: allow ingress on TCP ports `22`, `80`, and `443`
3. Note the public IP address.

### Step 2 - Configure DNS
1. Add an `A` record in Cloudflare (or any free DNS provider) pointing `myntra.example.com` to the server IP.
2. Wait for DNS propagation.

### Step 3 - Prepare the server
SSH into the instance and run:

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER
newgrp docker
```

Clone the repository:

```bash
git clone https://github.com/swetapadmaswain/myntra-dashboard.git
cd myntra-dashboard
git checkout develop
```

### Step 4 - Create the production environment file

```bash
cp .env.prod.example .env
nano .env
```

Fill in the real values, especially:
- `DOMAIN` (e.g. `myntra.example.com`)
- `POSTGRES_PASSWORD`
- `MONGODB_PASSWORD`
- `JWT_SECRET`
- `YOUTUBE_API_KEY`

### Step 5 - Deploy

```bash
./deploy.sh
```

This will build all production images, tear down any existing containers, and bring up the stack.

### Step 6 - Verify

```bash
docker compose -f docker-compose.prod.yml ps
curl -f https://$DOMAIN/health 2>/dev/null || echo "not ready yet"
```

The dashboard should be available at `https://myntra.example.com`.

### Step 7 - Initial data ingestion (manual)

YouTube data is collected on demand. To trigger the first production ingestion:

```bash
docker compose -f docker-compose.prod.yml exec data-ingestion \
  curl -X POST "http://localhost:8002/ingest/youtube?limit=300"
```

NLP processing runs in the background; the friction chart will populate as it completes.

## Post-deployment maintenance

- **Logs:** `docker compose -f docker-compose.prod.yml logs -f <service>`
- **Updates:** edit the repo, run `git pull` and then `./deploy.sh` again
- **Backups:** snapshot the `*_data` Docker volumes regularly
- **Security:** keep Docker, host OS, and npm/pip dependencies patched

## Cost caveats
- OCI Always Free is free indefinitely if you remain within the free tier limits.
- Cloudflare DNS/SSL proxy is free.
- If the OCI A1 instance is unavailable in your region, fall back to an AWS EC2 `t3.micro` free tier instance (1 GB RAM is tight and may require removing databases to managed free tiers).
