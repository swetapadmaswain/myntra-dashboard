# Myntra Dashboard - Vercel + Render Deployment Plan

## Goal
Deploy the Next.js frontend on Vercel (free hobby tier) and the backend services on Render (free tier) using free managed databases.

## Tooling (all free)
- **Frontend:** Vercel hobby plan
- **Backend web services:** Render free web services
- **PostgreSQL:** Supabase free tier (or Render 90-day free PostgreSQL)
- **MongoDB:** MongoDB Atlas M0 free cluster
- **Redis:** Upstash free Redis
- **SSL / CDN:** Included with Vercel and Render automatically

## Pre-requisites
1. A GitHub repository at `https://github.com/swetapadmaswain/myntra-dashboard`.
2. A Vercel account linked to GitHub.
3. A Render account linked to GitHub.
4. A YouTube Data API v3 key.

---

## Step 1 - Set up free managed databases

### 1.1 Supabase PostgreSQL
1. Create a project at [https://supabase.com](https://supabase.com).
2. Copy the **Connection string** from `Settings > Database`.
3. Note the host, port (`5432`), database name, user, and password.

### 1.2 MongoDB Atlas
1. Create a free M0 cluster at [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a user and allow access from anywhere (`0.0.0.0/0`) for Render.
3. Copy the connection string or SRV host.

### 1.3 Upstash Redis
1. Create a free database at [https://upstash.com](https://upstash.com).
2. Copy the endpoint and token.

---

## Step 2 - Deploy the backend on Render

1. In Render, click **New > Blueprint** and connect your GitHub repository.
2. Select the `develop` branch and the `render.yaml` blueprint.
3. Render will create four free web services:
   - `myntra-nlp-service`
   - `myntra-analytics-service`
   - `myntra-data-ingestion`
   - `myntra-api-gateway`
4. For each service, open the **Environment** tab and fill in the `<set in dashboard>` variables with values from Step 1.
5. Save and trigger a deploy.

> **Important:** The free Render web service has 512 MB RAM. The `myntra-nlp-service` with a transformer model usually needs more. If it crashes on startup, upgrade only that service to a `Starter` plan, or replace the local NLP model with a hosted Hugging Face Inference API.

---

## Step 3 - Deploy the frontend on Vercel

1. In Vercel, click **New Project** and import the GitHub repository.
2. Select the `develop` branch.
3. Set the **Root Directory** to `frontend`.
4. Add the following environment variable in the Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` = `https://myntra-api-gateway-xxx.onrender.com/api/v1`
   - Replace `xxx` with the actual Render subdomain shown in your `myntra-api-gateway` service.
5. Click **Deploy**.

The dashboard will be live at `https://<vercel-project>.vercel.app`.

---

## Step 4 - Trigger initial data ingestion

Once the services are healthy, trigger the first YouTube ingestion:

```bash
curl -X POST https://<myntra-data-ingestion-url>/ingest/youtube?limit=300
```

NLP processing runs in the background; charts will populate as it completes.

---

## Post-deployment notes

- **Free Render services sleep after 15 minutes of inactivity.** The first request after sleeping may take 30-60 seconds to wake up.
- **Keep API keys and database credentials in the Render / Vercel dashboards, never in the repo.**
- **CORS:** If the frontend cannot call the API, add your Vercel domain to the API Gateway's CORS allowed origins.
