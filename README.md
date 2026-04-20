# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Deployment runbook (staging + production)

This is the exact sequence used to deploy this project with two EC2 machines (`dev` and `prod`), Nginx reverse proxy, PM2 process management, and GitHub Actions CD.

### 1) Provision servers

- Create two Ubuntu EC2 instances: one for staging/dev and one for production.
- Save each instance public IPv4 (or public DNS).
- SSH user for Ubuntu AMIs is usually `ubuntu`.

### 2) SSH access

- Connect with your key:

```sh
ssh -i /path/to/key ubuntu@<SERVER_IP>
```

- If `root` login is blocked, use `ubuntu`.

### 3) Install Node, pnpm, pm2, nginx

- Install Node via `nvm`:

```sh
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install --lts
```

- Install pnpm and pm2:

```sh
npm install -g pnpm
pnpm add -g pm2
```

- Install Nginx:

```sh
sudo apt update && sudo apt install -y nginx
sudo systemctl enable --now nginx
```

### 4) Common Prisma fix

If Prisma fails with `Cannot find module 'dotenv/config'`, install `dotenv` in the correct workspace/package:

```sh
pnpm add dotenv
```

### 5) Run services with PM2

Start apps with pnpm using PM2 process names:

```sh
pm2 start pnpm --name "fe-server" -- start
pm2 start pnpm --name "http-server" -- start
pm2 start pnpm --name "ws-server" -- start
```

### 6) DNS records

Create A records that point to the target instance IP.

- Staging examples: `staging.fe.arka6fx.com`, `staging.httpserver.arka6fx.com`, `staging.wsserver.arka6fx.com`
- Production examples: `fe.arka6fx.com`, `httpserver.arka6fx.com`, `wsserver.arka6fx.com`

### 7) Nginx reverse proxy

For Ubuntu site files (`/etc/nginx/sites-available/*`), keep only `server {}` blocks (do not include `events {}` and `http {}` in site files).

Example mapping:

- `fe.*` -> `http://localhost:3000`
- `httpserver.*` -> `http://localhost:3001`
- `wsserver.*` -> `http://localhost:3002`

Validate and reload:

```sh
sudo nginx -t && sudo systemctl reload nginx
```

### 8) GitHub Actions CD setup

- Staging workflow file: `.github/workflows/cd_staging.yml`
  - Trigger: push to `main`
- Production workflow file: `.github/workflows/cd_prod.yml`
  - Trigger: push to `production`

Both workflows use `appleboy/ssh-action` and run:

```sh
cd ~/turborepo-deploy-test
git pull
pnpm install
pnpm build
pm2 restart fe-server
pm2 restart http-server
pm2 restart ws-server
```

### 9) Required GitHub repository secrets

- `SSH_PRIVATE_KEY`: private key content used for SSH
- `STAGING_HOST`: staging EC2 public IP/DNS
- `STAGING_USER`: staging SSH user (usually `ubuntu`)
- `PROD_HOST`: production EC2 public IP/DNS
- `PROD_USER`: production SSH user (usually `ubuntu`)

### 10) Branch behavior

- A workflow must exist in the branch it triggers from.
- Keep deployment workflow files present in both long-lived branches (`main` and `production`) as needed.
- Keep infra config (like Nginx templates) versioned so environments are reproducible.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo build
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo build
pnpm dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo build --filter=docs
```

Without global `turbo`:

```sh
npx turbo build --filter=docs
pnpm exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo dev
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo dev
pnpm exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo dev --filter=web
```

Without global `turbo`:

```sh
npx turbo dev --filter=web
pnpm exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo login
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo login
pnpm exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo link
```

Without global `turbo`:

```sh
npx turbo link
pnpm exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
