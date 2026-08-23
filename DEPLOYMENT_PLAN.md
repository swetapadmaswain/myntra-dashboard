# Myntra Dashboard — Free Deployment Guide

> **Zero-cost deployment** using free-tier managed services + a free VPS.
> The NLP pipeline uses lightweight VADER/spaCy (no BERT), so the entire backend fits in 1 GB RAM with swap.

---

## Architecture at a Glance

```
┌────────────┐     ┌──────────────────────────────────────────┐
│  Vercel    │     │    Oracle Cloud Always Free (2 GB ARM)    │
│  (Frontend)│────▶│  Caddy (SSL) → API Gateway → Services    │
│  Free      │     │  NLP · Analytics · Data Ingestion        │
└────────────┘     └──────────────────────────────────────────┘
                         │           │            │
                    ┌─────▼───┐  ┌────▼────┐  ┌───▼──────┐
                    │ MongoDB │  │ Postgres │  │  Redis   │
                    │  Atlas  │  │ Supabase │  │  Upstash │
                    │  (free) │  │  (free)  │  │  (free)  │
                    └─────────┘  └──────────┘  └──────────┘
```

---

## Free Services Used

| Service       | Provider          | Free Limit                    |
|---------------|-------------------|-------------------------------|
| Frontend      | Vercel            | Unlimited static + SSR        |
| PostgreSQL    | Supabase          | 500 MB storage                |
| MongoDB       | MongoDB Atlas M0  | 512 MB storage                |
| Redis         | Upstash           | 10,000 commands/day           |
| VPS           | Oracle Cloud      | 2 GB ARM / Always Free        |
| SSL           | Caddy + Let's Encrypt | Automatic, free          |

> Oracle Cloud Always Free is **truly free forever** — no 12-month expiry, no charge. You get 2 GB RAM ARM VM which is more than enough for this stack.

---

## Prerequisites

1. **GitHub repo** — `https://github.com/swetapadmaswain/myntra-dashboard`
2. **Vercel account** — linked to GitHub
3. **Supabase account** — for PostgreSQL
4. **MongoDB Atlas account** — for MongoDB
5. **Upstash account** — for Redis
6. **Oracle Cloud account** — for the Always Free VPS (2 GB ARM)
7. **A domain name** — e.g. `myntra.example.com`
8. **YouTube Data API v3 key** — for data ingestion

---

## Step 1 — Set Up Managed Databases

### 1.1 Supabase (PostgreSQL)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Wait for provisioning (~2 min)
3. Go to **Project Settings → Database**
4. Copy the connection details:

```
POSTGRES_HOST=db.<project-id>.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<your-password>
POSTGRES_SSLMODE=require
```

### 1.2 MongoDB Atlas (MongoDB)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → **Create Cluster** (M0 Free)
2. Choose a cloud provider and region closest to your VPS
3. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere)
4. **Database Access** → Create a user
5. Click **Connect → Drivers** and copy the connection string

```
MONGODB_HOST=cluster0.xxxxx.mongodb.net
MONGODB_PORT=27017
MONGODB_DB=myntra_dashboard
MONGODB_USER=<your-user>
MONGODB_PASSWORD=<your-password>
```

### 1.3 Upstash (Redis)

1. Go to [upstash.com](https://upstash.com) → **Create Database**
2. Choose the region closest to your VPS
3. Copy the endpoint and password:

```
REDIS_HOST=us1-xxx-xxxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=<your-password>
```

---

## Step 2 — Create an Oracle Cloud Account

Oracle Cloud offers a **truly free** ARM VM with 2 GB RAM and 1 OCPU — no expiry, no charge, forever.

### 2.1 Sign up for Oracle Cloud

1. Open your browser and go to **https://www.oracle.com/cloud/free**
2. Click the **Start for free** button (top right)
3. You will be taken to a registration form. Fill in the following:
   - **Cloud Account Name**: Choose a name, e.g. `myntradashboard` (this becomes your OCI tenancy name, cannot be changed later)
   - **Home Region**: Select the region closest to your users. This **cannot be changed** after signup.
     - For India: **AP South (Mumbai)**
     - For US: **US East (Ashburn)** or **US West (Phoenix)**
     - For Europe: **EU Frankfurt** or **UK South (London)**
   - **Email**: Your email address
   - **First Name / Last Name**: Your name
   - **Company Name**: Optional, can be left blank
4. Click **Verify my email**
5. Check your email for a verification code and enter it on the page
6. Set a **password** for your Oracle Cloud account (must be 8+ chars, upper/lower/number/special)
7. Click **Continue**

### 2.2 Add payment verification

1. Oracle requires a card for verification, but **it will NOT be charged** if you stay within Always Free limits
2. Enter your card details:
   - **Card type**: Visa / Mastercard / Amex
   - **Card number**: Your card number
   - **Expiry date**: MM/YY
   - **CVV**: 3-digit code
3. Click **Verify payment method**
4. Oracle may charge a temporary $1 hold and reverse it immediately — this is normal
5. Click **Continue**

### 2.3 Accept the agreement

1. Review the Oracle Cloud Free Tier terms
2. Check the box: **"I have read and accept the Oracle Cloud Free Tier Agreement"**
3. Click **Start my free trial**

### 2.4 Wait for account provisioning

1. You will see a page saying **"Your account is being provisioned"**
2. This takes **5–15 minutes** — do not close the page
3. Once done, you will receive an email with the subject **"Your Oracle Cloud Account is ready"**
4. Click the **Sign in to Oracle Cloud** button in that email
5. You will be redirected to the **Oracle Cloud Console** at `https://console.<region>.oraclecloud.com`

> **Important**: Bookmark the console URL. You will need it every time you log in.

---

## Step 3 — Generate SSH Keys

You need an SSH key pair to securely connect to your Oracle Cloud VM. You'll generate this on your **local machine** (the computer you're working on now).

### On Windows (PowerShell)

1. Open **PowerShell** (press `Win + X`, then click **Windows PowerShell**)

2. Check if you already have SSH keys:
   ```powershell
   ls ~/.ssh/id_ed25519*
   ```
   If you see files listed, you already have keys — skip to Step 4. Otherwise continue.

3. Generate a new SSH key:
   ```powershell
   ssh-keygen -t ed25519 -C "myntra-dashboard" -f $HOME\.ssh\myntra_oracle
   ```
   - When prompted for a passphrase: **press Enter** to leave it empty (or set one if you prefer, but you'll need to type it every time you SSH in)

4. Two files are created:
   - `C:\Users\<your-username>\.ssh\myntra_oracle` — **private key** (NEVER share this)
   - `C:\Users\<your-username>\.ssh\myntra_oracle.pub` — **public key** (this goes to Oracle)

5. View your public key (you'll need to copy this in the next step):
   ```powershell
   cat $HOME\.ssh\myntra_oracle.pub
   ```
   Copy the entire output — it starts with `ssh-ed25519` and ends with `myntra-dashboard`.

### On macOS / Linux (Terminal)

1. Open **Terminal**

2. Check if you already have SSH keys:
   ```bash
   ls ~/.ssh/id_ed25519*
   ```
   If you see files, you may use those or create new ones. To create new ones:

3. Generate a new SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "myntra-dashboard" -f ~/.ssh/myntra_oracle
   ```
   - When prompted for a passphrase: **press Enter** to leave empty

4. Two files are created:
   - `~/.ssh/myntra_oracle` — **private key** (NEVER share this)
   - `~/.ssh/myntra_oracle.pub` — **public key** (this goes to Oracle)

5. View your public key:
   ```bash
   cat ~/.ssh/myntra_oracle.pub
   ```
   Copy the entire output — it starts with `ssh-ed25519` and ends with `myntra-dashboard`.

---

## Step 4 — Create the Compute Instance (VM)

This is where you actually create the free 2 GB ARM virtual machine.

### 4.1 Navigate to Compute

1. Log in to the **Oracle Cloud Console** at `https://console.<region>.oraclecloud.com`
2. In the **left-hand hamburger menu** (three horizontal lines, top-left), click it to expand
3. Scroll down and find **Compute** → click **Instances**
4. You should see an empty list or a "Get started" message
5. Click the **Create instance** button

### 4.2 Configure the instance — Name and Placement

1. **Name**: Type `myntra-dashboard`
2. **Compartment**: Leave as default (usually `(root)`)
3. **Placement → Availability domain**: Leave as the default selected option
   - Oracle Cloud Free Tier gives you one AD in your home region
4. Do NOT change the placement — just leave it as-is

### 4.3 Configure the instance — Image and Shape

1. Under **Image and Shape**, you'll see a default image (might be Oracle Linux). You need to change this to Ubuntu.

2. **Change the Image**:
   - Click the **Edit** button next to the image
   - In the popup, click **Change image**
   - In the **Image source** dropdown, select **Canonical Ubuntu**
   - Select **Canonical Ubuntu 22.04** from the list
   - Click **Select image**
   - You should now see "Canonical Ubuntu 22.04" as the image

3. **Change the Shape** (this is the critical part for free tier):
   - Click the **Edit** button next to the shape
   - Click **Change shape**
   - You will see three tabs: **Intel**, **Ampere**, **AMD**
   - Click the **Ampere** tab
   - Select **VM.Standard.A1.Flex** (this is the Always Free ARM shape)
   - Configure the shape:
     - **Number of OCPUs**: Type or select **1**
     - **Amount of memory (GB)**: Type or select **2**
   - Click **Change shape**
   - You should now see "VM.Standard.A1.Flex" with "1 OCPU, 2 GB memory"

> **Important**: The Ampere A1.Flex shape is the **Always Free** eligible shape. If you select Intel or AMD shapes, they are only free for the trial period (30 days), not forever. Always choose **Ampere**.

### 4.4 Configure SSH keys

1. Scroll down to **Add SSH keys**
2. You'll see three options:
   - **Generate a key pair** — Oracle generates keys for you
   - **Upload public key files** — Upload a `.pub` file
   - **Paste public keys** — Paste the key text directly
3. Select **Paste public keys**
4. Paste the **entire public key** you copied in Step 3 (starts with `ssh-ed25519` and ends with `myntra-dashboard`)
5. The key should appear in the text box

> If you prefer, you can also select **Upload public key files** and upload the `myntra_oracle.pub` file directly.

### 4.5 Configure Networking

1. Scroll down to the **Networking** section (below SSH keys, above boot volume)
2. You'll see the following fields — leave everything as default:

   - **Virtual cloud network (VCN)**: You need a VCN with a public subnet. If you see a default VCN in the dropdown, select it. If the dropdown is empty or has no VCN, follow **Step 4.5a** below to create one first, then come back here.

   - **Subnet**: Select a **public** subnet
     - It will be named something like `Public Subnet-...` or `Default Subnet for Default-VCN...`
     - **Important**: Make sure it says **"Public"** in the name — this gives your VM a public IP
     - Do NOT select a private subnet (you won't be able to SSH in)
     - If no public subnet exists, follow **Step 4.5a** below to create a VCN with a public subnet

   - **Public IPv4 address**: Leave as default
     - Oracle auto-assigns a public IP from their pool
     - This is free with Always Free tier
     - If you see an option for **"No public IP"**, change it to **"Assign a public IPv4 address"**

3. Do NOT change any other networking settings — leave everything else as default

> **Why does this matter?** The VCN (Virtual Cloud Network) is your private network in Oracle Cloud. The subnet determines whether your VM is reachable from the internet. You need a **public subnet** so that:
> - Caddy can serve HTTPS traffic on ports 80/443
> - You can SSH into the VM on port 22
> - The Vercel frontend can reach your API

### 4.5a Create a VCN with Public Subnet (if none exists)

If you don't see a VCN or a public subnet in the dropdown, you need to create one. **Save your instance configuration first** (Oracle doesn't save drafts, so you may want to open the VCN creation in a new browser tab).

1. **Open a new browser tab** and go to your Oracle Cloud Console
2. Click the **hamburger menu** (top-left) → **Networking** → **Virtual Cloud Networks**
3. Click **Start VCN Wizard** (or **Create VCN** if you don't see the wizard button)

#### If you see the VCN Wizard:

1. Select **Create VCN with Internet Connectivity** — this is the option that creates a public subnet
2. Click **Start VCN Wizard**
3. Fill in:
   - **VCN Name**: `myntra-vcn`
   - **Compartment**: Leave as default (root)
   - **VCN IPv4 CIDR**: `10.0.0.0/16` (default — do not change)
   - **Public Subnet IPv4 CIDR**: `10.0.0.0/24` (default — do not change)
   - **Private Subnet IPv4 CIDR**: `10.0.1.0/24` (default — do not change)
4. Scroll down and click **Next**
5. Review the configuration — you should see:
   - VCN: `myntra-vcn` (10.0.0.0/16)
   - Public subnet: `10.0.0.0/24` — this is what you need
   - Private subnet: `10.0.1.0/24`
   - Internet Gateway: Yes (this allows internet access)
   - NAT Gateway: Yes
   - Service Gateway: Yes
6. Click **Create**
7. Wait for the wizard to finish — you'll see a progress bar, then **"VCN Creation Complete"**
8. Click **Close** or **View VCN**

#### If you see "Create VCN" (manual mode, no wizard):

1. Click **Create VCN**
2. Fill in:
   - **Name**: `myntra-vcn`
   - **Compartment**: Leave as default
   - **CIDR Block**: `10.0.0.0/16`
   - **DNS Label**: Leave as auto-generated (e.g. `myntravcn`)
3. Scroll down — do NOT check "Create a public subnet" yet
4. Click **Create VCN**
5. Wait for it to be created (status: Available)
6. Now create the public subnet:
   - Click on your new VCN `myntra-vcn`
   - Under **Resources** (left sidebar), click **Subnets**
   - Click **Create Subnet**
   - Fill in:
     - **Name**: `public-subnet`
     - **Subnet Type**: Regional
     - **CIDR Block**: `10.0.0.0/24`
     - **Route Table**: Select the default route table (or create one with an internet gateway rule)
     - **DHCP Options**: Leave as default
     - **Subnet Access**: Select **Public Subnet** (this is critical!)
   - Click **Create Subnet**
7. Now create an Internet Gateway (if not auto-created):
   - Under **Resources**, click **Internet Gateways**
   - Click **Create Internet Gateway**
   - **Name**: `internet-gateway`
   - **VCN**: `myntra-vcn` (auto-selected)
   - Click **Create**
8. Add a route rule to send internet traffic through the gateway:
   - Under **Resources**, click **Route Tables**
   - Click on the default route table
   - Click **Add Route Rules**
   - Fill in:
     - **Destination Type**: CIDR Block
     - **Destination CIDR**: `0.0.0.0/0`
     - **Target Type**: Internet Gateway
     - **Target**: Select `internet-gateway`
   - Click **Add Route Rules**

#### After VCN creation — go back to instance creation:

1. Go back to your instance creation browser tab (or start over: **Compute → Instances → Create Instance**)
2. In the **Networking** section, you should now see:
   - **VCN**: `myntra-vcn` in the dropdown — select it
   - **Subnet**: `public-subnet` (or `Public Subnet-...`) — select it
   - **Public IPv4 address**: Auto-assigned
3. Continue with the rest of the instance configuration

### 4.6 Configure boot volume

1. Scroll down to **Configure boot volume**
2. Leave all settings as default:
   - **Boot volume size**: 47 GB (this is the default, and is Always Free eligible up to 200 GB total across all boot volumes)
   - **Use in-transit encryption**: Leave checked (default)
3. Do NOT change anything here

### 4.7 Review and create

1. Scroll to the bottom of the page
2. Review all settings:
   - Name: `myntra-dashboard`
   - Image: `Canonical Ubuntu 22.04`
   - Shape: `VM.Standard.A1.Flex` — 1 OCPU, 2 GB
   - SSH keys: Your public key
   - VCN: Default VCN (auto-created with your account)
   - Subnet: Default **public** subnet
   - Public IP: Auto-assigned
3. Click the **Create** button at the bottom

### 4.8 Wait for provisioning

1. You will see the instance with a **PROVISIONING** status (yellow icon)
2. Wait **2–5 minutes** — the status will change to **RUNNING** (green icon)
3. Once it shows **RUNNING**, click on the instance name `myntra-dashboard` to open its details page
4. Find the **Public IP Address** field — it will look something like `129.150.xx.xx` or `150.230.xx.xx`
5. **Write down this IP** — you'll need it for the rest of the guide

> If the Public IP Address field is empty, you may need to assign one:
> 1. Scroll down to **Attached VNICs** → click the VNIC
> 2. Click **IPv4 Addresses** → **Edit** → check **Assign a public IPv4 address** → **Update**

---

## Step 5 — Open Firewall Ports (VCN Security List)

Oracle Cloud has **two layers of firewalls**. This step opens the first layer (VCN Security List). You must do this in the Oracle Cloud Console.

### 5.1 Navigate to VCN

1. In the **left-hand hamburger menu**, click it to expand
2. Scroll down to **Networking** → click **Virtual Cloud Networks**
3. You should see a VCN named something like `Default-VCN-...` or `vcn-...`
4. Click on the VCN name to open it

### 5.2 Open the Security List

1. On the VCN details page, look for **Resources** on the left sidebar
2. Click **Security Lists**
3. You should see a security list named **Default Security List for ...**
4. Click on it to open

### 5.3 Add Ingress Rule for SSH (Port 22)

1. Click the **Add Ingress Rules** button
2. Fill in:
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: `TCP`
   - **Source Port Range**: `All`
   - **Destination Port Range**: `22`
   - **Description**: `SSH access`
3. Click **Add Ingress Rules**

> Port 22 may already be open by default. If you see an existing rule for port 22, skip this step.

### 5.4 Add Ingress Rule for HTTP (Port 80)

1. Click **Add Ingress Rules** again
2. Fill in:
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: `TCP`
   - **Source Port Range**: `All`
   - **Destination Port Range**: `80`
   - **Description**: `HTTP access`
3. Click **Add Ingress Rules**

### 5.5 Add Ingress Rule for HTTPS (Port 443)

1. Click **Add Ingress Rules** again
2. Fill in:
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: `TCP`
   - **Source Port Range**: `All`
   - **Destination Port Range**: `443`
   - **Description**: `HTTPS access`
3. Click **Add Ingress Rules**

### 5.6 Verify all rules

You should now see at least 4 ingress rules in the security list:

| Source CIDR | Protocol | Dest Port | Description  |
|-------------|----------|-----------|--------------|
| `0.0.0.0/0` | TCP      | `22`      | SSH access   |
| `0.0.0.0/0` | TCP      | `80`      | HTTP access  |
| `0.0.0.0/0` | TCP      | `443`     | HTTPS access |
| `0.0.0.0/0` | ICMP     | All       | (default)    |

If all three (22, 80, 443) are present, the VCN firewall is configured. Move to the next step.

---

## Step 6 — SSH Into the Server

Now you'll connect to your new VM from your local machine.

### On Windows (PowerShell)

```powershell
ssh -i $HOME\.ssh\myntra_oracle ubuntu@<oracle-public-ip>
```

### On macOS / Linux (Terminal)

```bash
ssh -i ~/.ssh/myntra_oracle ubuntu@<oracle-public-ip>
```

Replace `<oracle-public-ip>` with the IP you wrote down in Step 4.7 (e.g. `129.150.1.2`).

### First connection

1. You will see a message like:
   ```
   The authenticity of host '129.150.xx.xx (129.150.xx.xx)' can't be established.
   ED25519 key fingerprint is SHA256:xxxxx.
   Are you sure you want to continue connecting (yes/no/[fingerprint])?
   ```
2. Type **yes** and press Enter
3. If you set a passphrase on your SSH key, you'll be prompted for it
4. You should now see a prompt like:
   ```
   ubuntu@instance-20240xxx-xxxx:~$
   ```
5. **You're in!** You are now connected to your Oracle Cloud VM.

> If you get "Permission denied (publickey)", double-check:
> - You used the correct private key file (`-i` flag)
> - The public key you pasted in Step 4.4 matches the private key you're using
> - You used `ubuntu@` as the username (not `root@` or your name)

---

## Step 7 — Open iptables Ports (VM-level Firewall)

Oracle Cloud VMs have a **second firewall layer** using iptables. Even though you opened the VCN security list in Step 5, the VM itself blocks ports 80 and 443 by default. You need to open them.

### 7.1 Check current iptables rules

```bash
sudo iptables -L INPUT -n --line-numbers
```

You'll see several rules. Look for rules blocking ports 80 and 443 — typically there's a final `REJECT` rule around line 6.

### 7.2 Open port 80 (HTTP)

```bash
sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT
```

This inserts a rule at position 6 (before the REJECT rule) to allow incoming HTTP traffic.

### 7.3 Open port 443 (HTTPS)

```bash
sudo iptables -I INPUT 6 -p tcp --dport 443 -j ACCEPT
```

### 7.4 Save iptables rules permanently

```bash
sudo netfilter-persistent save
```

You should see:
```
run-parts: executing /usr/share/netfilter-persistent/plugins.d/15-ip4tables save
run-parts: executing /usr/share/netfilter-persistent/plugins.d/25-ip6tables save
```

### 7.5 Verify

```bash
sudo iptables -L INPUT -n --line-numbers
```

You should now see `ACCEPT  tcp  --  0.0.0.0/0  0.0.0.0/0  tcp dpt:80` and `tcp dpt:443` in the list.

> **Why both layers?** Oracle Cloud has the VCN Security List (cloud-level, Step 5) AND iptables (VM-level, this step). Traffic must pass **both** firewalls. If either one blocks a port, the traffic is dropped. This is why you need to configure both.

---

## Step 8 — Add Swap Space

Even though you have 2 GB RAM, adding 2 GB swap is a safety net for memory spikes during Docker builds.

### 8.1 Create the swap file

```bash
sudo fallocate -l 2G /swapfile
```

### 8.2 Set correct permissions

```bash
sudo chmod 600 /swapfile
```

### 8.3 Format as swap

```bash
sudo mkswap /swapfile
```

You'll see output like:
```
Setting up swapspace version 1, size = 2 GiB (2147479552 bytes)
no label, UUID=xxxxx-xxxx-xxxx
```

### 8.4 Enable swap

```bash
sudo swapon /swapfile
```

### 8.5 Make swap permanent across reboots

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 8.6 Tune swappiness

```bash
sudo sysctl vm.swappiness=60
echo 'vm.swappiness=60' | sudo tee -a /etc/sysctl.conf
```

### 8.7 Verify swap is active

```bash
free -h
```

You should see:
```
               total        used        free      shared  buff/cache   available
Mem:           2.0Gi       120Mi       1.7Gi       8.0Mi       150Mi       1.7Gi
Swap:          2.0Gi          0B       2.0Gi
```

Swap total should show `2.0Gi`. Done!

---

## Step 9 — Install Docker and Tools

### 9.1 Update the system

```bash
sudo apt update && sudo apt upgrade -y
```

Wait for the update to finish (30–60 seconds).

### 9.2 Install Docker, Docker Compose, and Git

```bash
sudo apt install -y docker.io docker-compose-v2 git
```

Wait for installation to complete (1–2 minutes).

### 9.3 Add your user to the docker group

```bash
sudo usermod -aG docker ubuntu
```

### 9.4 Apply the group change

```bash
newgrp docker
```

> If `newgrp` doesn't work, just log out and SSH back in:
> ```bash
> exit
> ssh -i ~/.ssh/myntra_oracle ubuntu@<oracle-public-ip>
> ```

### 9.5 Verify Docker is working

```bash
docker --version
```

You should see something like:
```
Docker version 24.0.7, build afdd53b
```

```bash
docker compose version
```

You should see something like:
```
Docker Compose version v2.21.0
```

### 9.6 Enable Docker to start on boot

```bash
sudo systemctl enable docker
```

You should see:
```
Synchronizing state of docker.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable docker
```

### 9.7 Verify Git is installed

```bash
git --version
```

You should see something like:
```
git version 2.34.1
```

> If any of these commands fail, re-run `sudo apt install -y docker.io docker-compose-v2 git` and try again.

---

## Step 10 — Configure DNS

In your DNS provider (e.g. Cloudflare, Namecheap, Route53):

| Type   | Name              | Value                          |
|--------|-------------------|--------------------------------|
| A      | `api`             | `<oracle-public-ip>`           |
| CNAME  | `app` (or `@`)    | `cname.vercel-dns.com`         |

Wait for DNS propagation (check with `dig api.example.com`).

---

## Step 11 — Clone and Configure the Project

```bash
cd ~
git clone https://github.com/swetapadmaswain/myntra-dashboard.git
cd myntra-dashboard
git checkout develop

cp .env.prod.example .env
nano .env
```

Fill in all values from Step 1:

```env
# Domain
API_DOMAIN=api.example.com
CORS_ORIGINS=https://app.example.com,https://myntra-dashboard.vercel.app

# Supabase PostgreSQL
POSTGRES_HOST=db.<id>.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<your-password>
POSTGRES_SSLMODE=require

# MongoDB Atlas
MONGODB_HOST=cluster0.xxxxx.mongodb.net
MONGODB_PORT=27017
MONGODB_DB=myntra_dashboard
MONGODB_USER=<your-user>
MONGODB_PASSWORD=<your-password>

# Upstash Redis
REDIS_HOST=us1-xxx-xxxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=<your-password>

# Security
JWT_SECRET=<generate-a-long-random-string>

# Data
YOUTUBE_API_KEY=<your-youtube-api-key>
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## Step 12 — Deploy the Backend

```bash
chmod +x deploy-free.sh
./deploy-free.sh
```

This script will:
1. Run pre-flight checks (`.env` exists, Docker running)
2. Pull latest code
3. Build and start 5 containers: `api-gateway`, `data-ingestion`, `nlp-service`, `analytics-service`, `caddy`
4. Wait for health checks
5. Print a deployment summary

### Verify the backend

```bash
# Check container status
docker compose -f docker-compose.free.yml ps

# Test the API (replace with your domain)
curl -f https://api.example.com/api/v1/dashboard/metrics

# Or test locally on the VPS
curl -f http://localhost:3000/api/v1/dashboard/metrics
```

You should see JSON with KPI metrics. If not, check logs:

```bash
docker compose -f docker-compose.free.yml logs -f
```

---

## Step 13 — Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import `swetapadmaswain/myntra-dashboard`
3. Select the **`develop`** branch
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL` = `https://api.example.com/api/v1`
5. Click **Deploy**

Vercel will build and deploy the frontend. You'll get a URL like `myntra-dashboard.vercel.app`.

### Optional: Add custom domain

1. In Vercel project settings → **Domains**
2. Add `app.example.com`
3. Update your DNS CNAME to point to Vercel (as in Step 10)

---

## Step 14 — Ingest Initial Data

Once the backend is running and healthy, ingest some YouTube reviews:

```bash
docker compose -f docker-compose.free.yml exec data-ingestion \
  curl -X POST "http://localhost:8002/ingest/youtube?limit=100"
```

This will:
1. Fetch 100 YouTube comments about Myntra
2. Send them to the NLP service for enrichment (sentiment, intent, hesitation)
3. Store the enriched conversations in MongoDB Atlas

After ingestion, refresh the dashboard to see data.

---

## Step 15 — Verify End-to-End

```bash
# 1. Backend health
curl -f https://api.example.com/api/v1/dashboard/metrics

# 2. Frontend loads
curl -f https://app.example.com

# 3. Data exists in MongoDB
docker compose -f docker-compose.free.yml exec data-ingestion \
  curl -s http://localhost:8002/health
```

Open `https://app.example.com` in your browser — you should see the full dashboard with data.

---

## Memory Budget (Oracle Cloud 2 GB ARM)

| Container           | Memory Limit |
|---------------------|-------------|
| API Gateway         | 128 MB      |
| Data Ingestion      | 128 MB      |
| NLP Service         | 256 MB      |
| Analytics Service   | 128 MB      |
| Caddy               | 64 MB       |
| **Containers Total**| **704 MB**  |
| OS + Docker daemon  | ~300 MB     |
| Swap                | 2 GB        |
| **Grand Total**     | **~1 GB + 2 GB swap** |

> With 2 GB RAM, there's ~1 GB of headroom. Swap is a safety net, not a necessity.

---

## Troubleshooting

### Containers keep restarting
```bash
docker compose -f docker-compose.free.yml logs --tail=50 <service-name>
```
Common causes: wrong DB credentials, network access not configured in Atlas, Redis password incorrect.

### Caddy SSL not working
- Ensure ports 80 and 443 are open in **both** the Oracle VCN security list AND iptables
- Ensure DNS `api.example.com` points to your Oracle VM public IP
- Check Caddy logs: `docker compose -f docker-compose.free.yml logs caddy`
- Oracle Cloud ARM VMs sometimes need `sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT` and `--dport 443`

### MongoDB Atlas connection refused
- In Atlas, ensure `0.0.0.0/0` is in the IP Access List
- Verify the connection string format

### Upstash Redis connection issues
- Ensure you're using the correct endpoint (not the local Redis URL)
- Upstash uses TLS — if your Redis client doesn't support it, check the Upstash docs for non-TLS endpoint

### Frontend can't reach API
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check `CORS_ORIGINS` in `.env` includes your Vercel URL
- Test: `curl -I https://api.example.com/api/v1/dashboard/metrics`

---

## Useful Commands

```bash
# View running containers
docker compose -f docker-compose.free.yml ps

# View logs (all services)
docker compose -f docker-compose.free.yml logs -f

# View logs (single service)
docker compose -f docker-compose.free.yml logs -f api-gateway

# Restart a single service
docker compose -f docker-compose.free.yml restart nlp-service

# Stop everything
docker compose -f docker-compose.free.yml down

# Rebuild and restart
docker compose -f docker-compose.free.yml up -d --build

# Ingest more data
docker compose -f docker-compose.free.yml exec data-ingestion \
  curl -X POST "http://localhost:8002/ingest/youtube?limit=200"
```

---

## File Reference

| File                        | Purpose                                    |
|-----------------------------|--------------------------------------------|
| `docker-compose.free.yml`   | Backend-only compose (no local DBs)        |
| `deploy-free.sh`            | One-command deploy script with health checks|
| `.env.prod.example`         | Template for environment variables         |
| `.env`                      | Your actual env vars (not committed)       |
| `Caddyfile.backend`         | Caddy config for API reverse proxy + SSL   |
| `docker-compose.yml`        | Local development (all services + DBs)     |

---

## Notes

- The NLP pipeline uses **VADER + spaCy** (rule-based), not BERT. This keeps memory usage under 256 MB.
- MongoDB Atlas M0 has a **512 MB** limit. If exceeded, upgrade to M2 ($9/mo) or reduce ingestion volume.
- Upstash free tier allows **10,000 Redis commands/day**. The dashboard caches aggressively but stays well within this.
- Supabase free tier has **500 MB** PostgreSQL storage. This is used for metadata only, not raw conversations.
- Oracle Cloud Always Free is **free forever** — no 12-month expiry. You get 1 OCPU + 2 GB RAM ARM VM.
- All services have `restart: unless-stopped` — they will survive VPS reboots if Docker is enabled on boot (`sudo systemctl enable docker`).
- Oracle Cloud may reclaim idle Always Free ARM instances. To prevent this, ensure the VM has active traffic or set up a cron job to keep it warm.
