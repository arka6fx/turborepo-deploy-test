# Deployment runbook (staging + production)

This document contains only the deployment setup used for this project.

## 1) Provision infrastructure

- Create two Ubuntu EC2 instances: `dev` (staging) and `prod` (production).
- Save each instance public IPv4 address (or public DNS).
- Use `ubuntu` as SSH user for Ubuntu AMIs.

## 2) Access servers

```sh
ssh -i /path/to/key ubuntu@<SERVER_IP>
```

If `root` login is denied, continue with `ubuntu`.

## 3) Install runtime dependencies

Install Node.js with nvm:

```sh
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install --lts
```

Install pnpm, pm2, and nginx:

```sh
npm install -g pnpm
pnpm add -g pm2
sudo apt update && sudo apt install -y nginx
sudo systemctl enable --now nginx
```

## 4) Prisma fix used during setup

If Prisma fails with `Cannot find module 'dotenv/config'`:

```sh
pnpm add dotenv
```

Install this in the correct workspace/package scope.

## 5) Run services with PM2

```sh
pm2 start pnpm --name "fe-server" -- start
pm2 start pnpm --name "http-server" -- start
pm2 start pnpm --name "ws-server" -- start
```

## 6) Configure DNS records

Point A records to the correct EC2 IP.

- Staging domains: `staging.fe.arka6fx.com`, `staging.httpserver.arka6fx.com`, `staging.wsserver.arka6fx.com`
- Production domains: `fe.arka6fx.com`, `httpserver.arka6fx.com`, `wsserver.arka6fx.com`

## 7) Configure Nginx reverse proxy

For Ubuntu site files (`/etc/nginx/sites-available/*`), add only `server {}` blocks.
Do not place `events {}` or `http {}` in site files.

Port mapping used:

- `fe.*` -> `http://localhost:3000`
- `httpserver.*` -> `http://localhost:3001`
- `wsserver.*` -> `http://localhost:3002`

Validate and apply:

```sh
sudo nginx -t && sudo systemctl reload nginx
```

## 8) GitHub Actions workflows

- `.github/workflows/cd_staging.yml`
  - Trigger: push to `main`
  - Deploy target: staging server
- `.github/workflows/cd_prod.yml`
  - Trigger: push to `production`
  - Deploy target: production server

Both workflows deploy with `appleboy/ssh-action` and run:

```sh
cd ~/turborepo-deploy-test
git pull
pnpm install
pnpm build
pm2 restart fe-server
pm2 restart http-server
pm2 restart ws-server
```

## 9) Required GitHub repository secrets

- `SSH_PRIVATE_KEY`: private key content used by Actions SSH
- `STAGING_HOST`: staging server public IP/DNS
- `STAGING_USER`: staging SSH user (usually `ubuntu`)
- `PROD_HOST`: production server public IP/DNS
- `PROD_USER`: production SSH user (usually `ubuntu`)

## 10) Branch rules for CD

- Workflow must exist in the same branch it triggers from.
- Keep deployment workflow files in both long-lived branches (`main`, `production`) as needed.
- Keep infra configs (Nginx templates/workflows) versioned in git so setup is reproducible.
