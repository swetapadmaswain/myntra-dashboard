# Myntra Dashboard - Free Production Deployment Plan

## Goal
Deploy the full Myntra Dashboard stack for $0 using Oracle Cloud's Always Free tier.

## Tooling (all free)
- **Cloud VM:** Oracle Cloud `VM.Standard.A1.Flex` (up to 4 OCPUs and 24 GB RAM, always free)
- **DNS / CDN:** Cloudflare free plan
- **SSL:** Caddy with automatic Let's Encrypt
- **Container runtime:** Docker + Docker Compose

## Pre-requisites
1. A GitHub repository at `https://github.com/swetapadmaswain/myntra-dashboard`.
2. An Oracle Cloud account with a free trial.
3. A domain you control (or a free `nip.io` / `sslip.io` subdomain).
4. A YouTube Data API v3 key.

---

## Step 1 - Provision the free server

1. Sign in at https://cloud.oracle.com and go to **Compute > Instances**.
2. Click **Create Instance**.
3. Choose the **VM.Standard.A1.Flex** shape and give it the full free allowance:
   - OCPUs: `4`
   - Memory: `24 GB`
   - Boot volume: `100 GB`
4. Use **Ubuntu 22.04** for the image.
5. Add an SSH key (generate one if you don't have it) and download the private key.
6. Under networking, make sure the instance's VCN subnet allows ingress on TCP `22`, `80`, and `443`. If not, add these ingress rules in the security list.
7. Launch the instance and copy its public IP.

---

## Step 2 - Point your domain at the server

1. Open Cloudflare (or any DNS provider).
2. Add an **A** record for `myntra.example.com` pointing to the Oracle Cloud public IP.
3. Wait a few minutes for DNS to propagate.

---

## Step 3 - Prepare the server

SSH into the instance and install Docker:

```bash
ssh -i <your-key>.key ubuntu@<instance-ip>

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

## Step 4 - Configure environment variables

```bash
cp .env.prod.example .env
nano .env
```

Fill in real values for:

- `DOMAIN` (e.g. `myntra.example.com`)
- `POSTGRES_PASSWORD` (strong random value)
- `MONGODB_PASSWORD` (strong random value)
- `JWT_SECRET` (strong random value)
- `YOUTUBE_API_KEY`

Save and exit.

---

## Step 5 - Deploy the stack

```bash
./deploy.sh
```

This will build all images and start the services in the background.

---

## Step 6 - Verify

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f caddy
```

Open `https://myntra.example.com` in a browser. Caddy will automatically obtain and renew the SSL certificate.

---

## Step 7 - Trigger initial YouTube ingestion

```bash
docker compose -f docker-compose.prod.yml exec data-ingestion \
  curl -X POST "http://localhost:8002/ingest/youtube?limit=300"
```

The dashboard will populate as NLP processing completes.

---

## Post-deployment maintenance

- **Logs:** `docker compose -f docker-compose.prod.yml logs -f <service>`
- **Updates:** `git pull` then run `./deploy.sh` again
- **Backups:** snapshot the `*_data` Docker volumes regularly
- **Security:** update the host OS and Docker packages; do not commit secrets to Git

## Notes
- The `VM.Standard.A1.Flex` with 24 GB RAM is the always-free ARM shape. It is large enough to run PostgreSQL, MongoDB, Redis, the API gateway, data ingestion, analytics, and the NLP model in one place.
- If you don't have a custom domain, use a free wildcard service like `nip.io` (e.g. `<ip>.nip.io`) and set `DOMAIN` to that.
