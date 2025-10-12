# Technical Specification: Docker-Based Blog Deployment

**Document Version:** 1.0
**Date:** October 10, 2025
**Status:** Ready for Implementation
**Based on PRD:** docker-deployment-prd.md v1.1
**Covers:** Phase 0-3 (Pre-Deployment through Deployment Automation)

---

## Executive Summary

This technical specification provides complete implementation details for deploying the SvelteKit-based blog to a DigitalOcean VPS using Docker. It covers the first four phases:
- **Phase 0:** Pre-Deployment Preparation (local work)
- **Phase 1:** Infrastructure Setup (server provisioning)
- **Phase 2:** Application Containerization (Docker configuration)
- **Phase 3:** Deployment Automation (CI/CD setup)

All subsequent phases (monitoring, backups, post-deployment config) will be covered in future specifications after the initial deployment is successful.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Phase 0: Pre-Deployment Preparation](#phase-0-pre-deployment-preparation)
3. [Phase 1: Infrastructure Setup](#phase-1-infrastructure-setup)
4. [Phase 2: Application Containerization](#phase-2-application-containerization)
5. [Phase 3: Deployment Automation](#phase-3-deployment-automation)
6. [Integration Points](#integration-points)
7. [Environment Variables](#environment-variables)
8. [Testing & Validation](#testing--validation)
9. [Rollback Procedures](#rollback-procedures)
10. [Assumptions & Constraints](#assumptions--constraints)

---

## Current State Analysis

### Application Architecture

**Framework:** SvelteKit 2.27+ (Svelte 5 with runes)
**Adapter:** `@sveltejs/adapter-node` (already configured)
**Package Manager:** Bun 1.x
**Build Output:** Standalone Node.js server in `build/` directory

### Current Dependencies

**Core:**
- SvelteKit 2.27+, Svelte 5
- Node.js adapter for production builds
- Vite 7+ for build tooling

**Content:**
- MDsveX 0.12+ for markdown processing
- Shiki 3+ for syntax highlighting
- Gray Matter for front matter parsing

**Backend:**
- **Database:** Drizzle ORM + LibSQL (SQLite) - **NEEDS REMOVAL**
- **Email:** Nodemailer 7+ (configured for Postmark)
- **Rate Limiting:** Custom implementation in `src/lib/server/rate-limit.ts`

**Styling:**
- TailwindCSS 4
- Enhanced images for optimization

### Key Files & Structure

```
blog/
├── src/
│   ├── routes/
│   │   ├── +page.svelte                      # Homepage
│   │   ├── about/+page.svelte                # About page
│   │   └── blog/
│   │       ├── +page.svelte                  # Blog listing
│   │       └── [...slug]/
│   │           ├── +page.svelte              # Blog post renderer
│   │           └── +page.server.ts           # Server load + feedback action
│   ├── posts/                                # MDsveX blog content (.svx files)
│   ├── lib/
│   │   ├── components/blog/
│   │   │   ├── FeedbackWidget.svelte         # Uses form action + Umami tracking
│   │   │   ├── ShareWidget.svelte            # Social sharing
│   │   │   ├── BlogLayout.svelte             # Post wrapper
│   │   │   └── CodeBlock.svelte              # Syntax highlighting
│   │   ├── server/
│   │   │   ├── db/                           # **TO BE REMOVED**
│   │   │   ├── email/                        # Email service (keep)
│   │   │   └── rate-limit.ts                 # Rate limiting (keep)
│   │   └── utils/
│   │       └── posts.server.ts               # Post loading logic
│   ├── app.html                              # HTML template (needs Umami script)
│   └── app.css                               # Global styles
├── static/                                    # Static assets
├── package.json                              # Dependencies
├── svelte.config.js                          # SvelteKit + MDsveX config
├── vite.config.ts                            # Vite config
├── .env.example                              # Environment template
└── .gitignore                                # Already excludes .env, node_modules
```

### Integration Points

1. **FeedbackWidget** (`src/lib/components/blog/FeedbackWidget.svelte`)
   - Currently submits to `?/submitFeedback` form action
   - Already has Umami tracking: `window.umami.track()`
   - No database dependency in component itself

2. **Form Action** (`src/routes/blog/[...slug]/+page.server.ts`)
   - `submitFeedback` action sends email via Nodemailer
   - Rate limiting via in-memory store
   - **No database writes currently**

3. **Email Service** (`src/lib/server/email/`)
   - Uses Nodemailer with Postmark transport
   - Environment variables: `POSTMARK_API_TOKEN`, `ADMIN_EMAIL`, `ADMIN_NAME`

4. **Umami Script** (needs to be added to `src/app.html`)
   - Not yet integrated
   - Will use `window.umami.track()` for events

### Database Status

According to git status and PRD:
- Database files exist: `src/lib/server/db/`, `drizzle/`, `local.db`
- Database packages: `drizzle-orm`, `@libsql/client`, `drizzle-kit`
- **Current usage:** Unclear from code review - FeedbackWidget does NOT write to DB
- **Action required:** Remove all database dependencies per Epic 12

---

## Phase 0: Pre-Deployment Preparation

**Timeline:** 2 days (local development)
**Location:** Local development machine
**Goal:** Prepare application code for containerization

### Story 12.1: Remove Database Dependencies

**Objective:** Eliminate SQLite/Drizzle dependencies to simplify deployment.

#### Step 1: Verify Current Database Usage

**Commands to run:**
```bash
# Search for database imports
grep -r "drizzle" src/
grep -r "@libsql" src/
grep -r "db" src/lib/server/

# Check for database queries
grep -r "db\." src/
```

**Expected outcome:** Identify all files importing or using database.

#### Step 2: Remove Database Files & Directories

**Commands:**
```bash
# Remove database directory
rm -rf src/lib/server/db/

# Remove migrations directory
rm -rf drizzle/

# Remove database file
rm -f local.db local.db-shm local.db-wal
```

#### Step 3: Remove Database Packages

**Edit [package.json](../package.json):**

Remove the following from `devDependencies`:
- `drizzle-orm`
- `@libsql/client`
- `drizzle-kit`

Remove these scripts:
- `db:push`
- `db:generate`
- `db:migrate`
- `db:studio`

**Updated package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "prepare": "svelte-kit sync || echo ''",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "format": "prettier --write .",
    "lint": "prettier --check . && eslint ."
  }
}
```

#### Step 4: Remove Database Configuration

**Delete file:** `drizzle.config.ts`

#### Step 5: Clean Install Dependencies

**Commands:**
```bash
# Remove node_modules and lockfiles
rm -rf node_modules bun.lock

# Reinstall with Bun
bun install

# Verify no database packages remain
bun list | grep drizzle
bun list | grep libsql
```

#### Step 6: Verify Application Builds

**Commands:**
```bash
# Run type checking
bun run check

# Run linter
bun run lint

# Build production bundle
bun run build

# Preview production build
bun run preview
```

**Validation:**
- No TypeScript errors
- No database import errors
- Build completes successfully
- Preview server runs on http://localhost:4173
- All blog pages load
- FeedbackWidget renders without errors

#### Step 7: Update .gitignore

**Verify `.gitignore` contains:**
```
*.db
*.db-shm
*.db-wal
```

This ensures database files are not committed.

---

### Story 12.2: Configure Umami Tracking in Application

**Objective:** Add Umami analytics script to prepare for production analytics.

#### Step 1: Add Umami Script to app.html

**Edit [src/app.html](../src/app.html):**

Add the following script tag in the `<head>` section, **before** `%sveltekit.head%`:

```html
<!doctype html>
<html lang="en" class="%color-scheme%" data-color-scheme="%color-scheme%">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- general metadata tags -->
    <meta name="color-scheme" content="light dark" />
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#FFFAF5" />
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#18140F" />

    <!-- Umami Analytics -->
    <script
      async
      src="https://analytics.yourdomain.com/script.js"
      data-website-id="YOUR_WEBSITE_ID_HERE"
    ></script>

    <!-- SvelteKit Injected Header -->
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <!-- SvelteKit Hydrated Content -->
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

**Important notes:**
- Use placeholder `YOUR_WEBSITE_ID_HERE` for now
- Domain `analytics.yourdomain.com` is placeholder
- Actual website ID will be obtained after Umami setup (Phase 5 - Story 8.1)
- Script loads asynchronously to not block page rendering

#### Step 2: Add TypeScript Declarations for window.umami

**Create file:** `src/app.d.ts` (or add to existing if present)

```typescript
/// <reference types="@sveltejs/kit" />

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, properties?: Record<string, string>) => void;
    };
  }
}

export {};
```

This prevents TypeScript errors when using `window.umami.track()` in components.

#### Step 3: Verify FeedbackWidget Umami Integration

**Check [src/lib/components/blog/FeedbackWidget.svelte](../src/lib/components/blog/FeedbackWidget.svelte):**

The component already has Umami tracking implemented:

```typescript
function trackEvent(eventName: string, properties?: Record<string, string | boolean>) {
  if (typeof window !== 'undefined' && window.umami) {
    const stringProps: Record<string, string> = {};
    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
        stringProps[key] = String(value);
      }
    }
    window.umami.track(eventName, stringProps);
  }
}
```

Events tracked:
- `Feedback - Positive Button Clicked`
- `Feedback - Negative Button Clicked`
- `Feedback - Positive Submitted`
- `Feedback - Negative Submitted`

**No changes needed** - gracefully degrades if Umami not loaded.

#### Step 4: Test Locally

**Commands:**
```bash
# Build and preview
bun run build
bun run preview
```

**Test in browser:**
1. Open http://localhost:4173
2. Navigate to any blog post
3. Open browser DevTools → Console
4. Check for script load errors (expected: 404 for analytics script, but no JS errors)
5. Click feedback buttons
6. Verify no console errors from `window.umami` calls

**Expected behavior:**
- Script attempts to load (fails in dev, that's OK)
- No JavaScript errors
- FeedbackWidget still functions
- `trackEvent()` silently skips if Umami not available

#### Step 5: Document Post-Deployment Configuration

**Add comment in `.env.example`:**

```bash
# analytics
PUBLIC_BASE_URL=https://yourdomain.com
PUBLIC_ANALYTICS_SITE_ID=

# NOTE: After Umami deployment (Phase 5), update src/app.html with:
# 1. Replace "analytics.yourdomain.com" with your actual analytics domain
# 2. Replace "YOUR_WEBSITE_ID_HERE" with website ID from Umami dashboard
```

---

### Story 12.3: Create Dockerfiles and Configuration Files

**Objective:** Create all Docker-related files for containerization.

#### File 1: Dockerfile (Multi-Stage Build)

**Create file:** `Dockerfile` in project root

```dockerfile
# ===== STAGE 1: BUILDER =====
FROM oven/bun:1 AS builder

# Set working directory
WORKDIR /app

# Copy dependency files first (for caching)
COPY package.json bun.lockb ./

# Install dependencies with frozen lockfile
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# ===== STAGE 2: RUNTIME =====
FROM node:22-alpine AS runtime

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S sveltekit -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/package.json ./
COPY --from=builder --chown=sveltekit:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER sveltekit

# Expose port 3000
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the application
CMD ["node", "build"]
```

**Key features:**
- Multi-stage build reduces final image size
- Builder stage uses Bun for fast dependency installation
- Runtime stage uses Node.js Alpine (lightweight)
- Non-root user (UID 1001) for security
- Health check verifies application responds
- Port 3000 exposed (internal to Docker network)

#### File 2: .dockerignore

**Create file:** `.dockerignore` in project root

```
# Git
.git
.gitignore
.github

# Dependencies
node_modules

# Build outputs
.svelte-kit
build
.output
.vercel
.netlify
.wrangler

# Environment files
.env
.env.*
!.env.example

# Documentation
docs
*.md
README.md

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode
.idea
*.swp
*.swo

# Database (removed but just in case)
*.db
*.db-shm
*.db-wal
drizzle

# Logs
logs
*.log
npm-debug.log*

# Testing
coverage
.nyc_output

# Temporary files
tmp
temp
*.tmp
```

**Purpose:** Exclude unnecessary files from Docker build context, reducing build time and image size.

#### File 3: docker-compose.yml

**Create file:** `docker-compose.yml` in project root

```yaml
version: '3.9'

services:
  # ===== BLOG SERVICE =====
  blog:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: blog
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOST=0.0.0.0
      - PUBLIC_BASE_URL=${PUBLIC_BASE_URL}
      - PUBLIC_ANALYTICS_SITE_ID=${PUBLIC_ANALYTICS_SITE_ID}
      - POSTMARK_API_TOKEN=${POSTMARK_API_TOKEN}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_NAME=${ADMIN_NAME}
    networks:
      - blog-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ===== UMAMI ANALYTICS SERVICE =====
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    container_name: umami
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://umami:${POSTGRES_PASSWORD}@postgres:5432/umami
      - DATABASE_TYPE=postgresql
      - APP_SECRET=${UMAMI_APP_SECRET}
    ports:
      - "3001:3000"  # Map container port 3000 to host port 3001
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - blog-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/api/heartbeat || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # ===== POSTGRESQL DATABASE =====
  postgres:
    image: postgres:16-alpine
    container_name: postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=umami
      - POSTGRES_USER=umami
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - blog-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U umami"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ===== NGINX REVERSE PROXY =====
  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl-params.conf:/etc/nginx/ssl-params.conf:ro
      - letsencrypt:/etc/letsencrypt:ro
      - certbot-webroot:/var/www/certbot:ro
    depends_on:
      - blog
      - umami
    networks:
      - blog-network

networks:
  blog-network:
    driver: bridge

volumes:
  postgres-data:
  letsencrypt:
  certbot-webroot:
```

**Service breakdown:**

1. **blog** - SvelteKit application
   - Built from local Dockerfile
   - Port 3000 (internal only, accessed via Nginx)
   - Environment variables from `.env` file
   - Health check verifies HTTP 200 response

2. **umami** - Analytics platform
   - Official Umami image with PostgreSQL support
   - Port 3001 mapped to host (for initial setup only)
   - Connects to PostgreSQL database
   - Depends on `postgres` service being healthy

3. **postgres** - Database for Umami
   - PostgreSQL 16 Alpine image
   - Port 5432 (internal only, not exposed to host)
   - Persistent storage via `postgres-data` volume
   - Health check via `pg_isready`

4. **nginx** - Reverse proxy
   - Official Nginx Alpine image
   - Ports 80 and 443 exposed to internet
   - Routes traffic to blog and umami containers
   - Mounts config files and SSL certificates

**Networks:**
- `blog-network` - Bridge network for inter-container communication

**Volumes:**
- `postgres-data` - Persistent PostgreSQL data
- `letsencrypt` - SSL certificates
- `certbot-webroot` - Let's Encrypt challenge files

#### File 4: docker/nginx/nginx.conf

**Create directory and file:** `docker/nginx/nginx.conf`

```bash
mkdir -p docker/nginx
```

```nginx
events {
    worker_connections 1024;
}

http {
    # Basic settings
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # ===== HTTP REDIRECT TO HTTPS =====
    server {
        listen 80;
        listen [::]:80;
        server_name yourdomain.com www.yourdomain.com analytics.yourdomain.com;

        # Let's Encrypt challenge location
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Redirect all other HTTP traffic to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # ===== BLOG (PRIMARY DOMAIN) =====
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL configuration
        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
        include /etc/nginx/ssl-params.conf;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Client body size limit
        client_max_body_size 10M;

        # Rate limiting (general)
        limit_req zone=general burst=20 nodelay;

        # Proxy to blog container
        location / {
            proxy_pass http://blog:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # ===== UMAMI ANALYTICS SUBDOMAIN =====
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name analytics.yourdomain.com;

        # SSL configuration
        ssl_certificate /etc/letsencrypt/live/analytics.yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/analytics.yourdomain.com/privkey.pem;
        include /etc/nginx/ssl-params.conf;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Client body size limit
        client_max_body_size 5M;

        # Rate limiting (API endpoints stricter)
        location /api/ {
            limit_req zone=api burst=10 nodelay;
            proxy_pass http://umami:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # All other locations
        location / {
            limit_req zone=general burst=20 nodelay;
            proxy_pass http://umami:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

**Key features:**
- HTTP to HTTPS redirect (301)
- Two server blocks: main blog + analytics subdomain
- Security headers (HSTS, XSS protection, etc.)
- Rate limiting (10 req/s general, 5 req/s API)
- Gzip compression for text/assets
- Proxy headers for proper client IP forwarding
- Let's Encrypt challenge location

**Important:** Replace `yourdomain.com` with your actual domain before deployment.

#### File 5: docker/nginx/ssl-params.conf

**Create file:** `docker/nginx/ssl-params.conf`

```nginx
# SSL protocols and ciphers
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';

# SSL session settings
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Diffie-Hellman parameter (optional, for enhanced security)
# Uncomment after generating dhparam.pem:
# ssl_dhparam /etc/nginx/dhparam.pem;
```

**Purpose:** Centralized SSL/TLS best practices configuration.

#### File 6: docker-compose.dev.yml (Optional - Local Development)

**Create file:** `docker-compose.dev.yml` in project root

```yaml
version: '3.9'

services:
  blog-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: blog-dev
    restart: unless-stopped
    ports:
      - "5173:5173"
    volumes:
      - ./src:/app/src:cached
      - ./static:/app/static:cached
      - ./package.json:/app/package.json:ro
      - ./svelte.config.js:/app/svelte.config.js:ro
      - ./vite.config.ts:/app/vite.config.ts:ro
      - ./tsconfig.json:/app/tsconfig.json:ro
    environment:
      - NODE_ENV=development
    command: bun run dev --host 0.0.0.0
```

**Note:** This is optional for local Docker development. Most development will happen natively with `bun run dev`.

#### File 7: Update .env.example

**Edit `.env.example` to add production environment variables:**

```bash
# ===== DATABASE (REMOVED) =====
# DATABASE_URL was removed - no longer needed

# ===== COOKIES =====
PUBLIC_COOKIE_NAME_COLOR_SCHEME=blog-color-scheme

# ===== ANALYTICS =====
PUBLIC_BASE_URL=https://yourdomain.com
PUBLIC_ANALYTICS_SITE_ID=YOUR_WEBSITE_ID_HERE

# ===== EMAIL (Postmark) =====
POSTMARK_API_TOKEN=your_postmark_token_here
ADMIN_EMAIL=your-email@example.com
ADMIN_NAME=Your Name

# ===== DOCKER / PRODUCTION ONLY =====
# PostgreSQL password for Umami database (generate with: openssl rand -base64 32)
POSTGRES_PASSWORD=

# Umami app secret (generate with: openssl rand -base64 32)
UMAMI_APP_SECRET=

# Domain configuration
DOMAIN=yourdomain.com
ANALYTICS_DOMAIN=analytics.yourdomain.com

# Email for Let's Encrypt notifications
EMAIL=your-email@example.com
```

#### Step 8: Test Local Docker Build

**Commands:**
```bash
# Build the blog image
docker build -t blog-test .

# Check image size (should be < 500MB)
docker images | grep blog-test

# Run container locally
docker run -p 3000:3000 --env-file .env blog-test

# Test in browser
open http://localhost:3000

# Stop container
docker stop <container-id>
```

**Validation:**
- Image builds without errors
- Image size is reasonable (< 500MB)
- Container starts and responds on port 3000
- All pages load correctly
- No runtime errors in container logs

#### Step 9: Validate Docker Compose Configuration

**Commands:**
```bash
# Validate docker-compose.yml syntax
docker compose config

# Expected output: Formatted YAML without errors
```

**Note:** This only validates syntax. Full stack testing happens after SSL certificates are obtained.

#### Step 10: Commit Changes to Git

**Commands:**
```bash
# Stage all new files
git add .

# Commit
git commit -m "Phase 0: Add Docker configuration files

- Add Dockerfile with multi-stage build
- Add docker-compose.yml with 4 services (blog, umami, postgres, nginx)
- Add Nginx configuration files
- Add .dockerignore
- Remove database dependencies (drizzle, libsql)
- Add Umami analytics script to app.html
- Update .env.example with production variables"
```

**Important:** Do NOT commit `.env` file. Ensure `.gitignore` includes `.env`.

---

## Phase 1: Infrastructure Setup

**Timeline:** 2-4 days (includes DNS propagation wait time)
**Location:** DigitalOcean + Domain Registrar
**Goal:** Provision and secure production server

### Story 1.1: Provision VPS Server

**Objective:** Create DigitalOcean droplet with proper specifications.

#### Step 1: Create DigitalOcean Droplet

**Manual steps (DigitalOcean web interface):**

1. Log in to DigitalOcean: https://cloud.digitalocean.com/
2. Click "Create" → "Droplets"
3. **Choose Region:** Select based on target audience (e.g., New York, San Francisco, London)
4. **Choose Image:** Ubuntu 24.04 LTS x64
5. **Choose Size:**
   - Plan: Basic
   - CPU options: Regular (SSD)
   - Select: **$12/month** - 2GB RAM / 1 vCPU / 50GB SSD
6. **Add SSH Key:**
   - If you have an SSH key: Select it
   - If not, click "New SSH Key"
   - Generate locally (see Step 2 below)
7. **Hostname:** Choose descriptive name (e.g., `blog-prod-server`)
8. **Tags:** Optional (e.g., `blog`, `production`)
9. Click "Create Droplet"
10. **Record the IP address** - you'll need this for DNS and SSH

#### Step 2: Generate SSH Key (if you don't have one)

**Local machine commands:**

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/id_blog_prod

# Print public key (copy this to DigitalOcean)
cat ~/.ssh/id_blog_prod.pub
```

**Add to DigitalOcean:**
- Paste public key content into "New SSH Key" dialog
- Name it descriptively (e.g., "MacBook Pro - Blog Deployment")

#### Step 3: Initial SSH Connection Test

**Local machine command:**

```bash
# SSH to droplet as root (replace with your droplet IP)
ssh root@<DROPLET_IP>

# Accept fingerprint when prompted
# You should see Ubuntu welcome message
```

**Expected output:**
```
Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.5.0-... x86_64)
...
root@blog-prod-server:~#
```

#### Step 4: Update System Packages

**On server (as root):**

```bash
# Update package lists
apt update

# Upgrade all packages
apt upgrade -y

# Install essential tools
apt install -y curl wget git vim htop
```

#### Step 5: Create Non-Root User

**On server (as root):**

```bash
# Create user 'deploy' with home directory
adduser deploy

# Follow prompts:
# - Enter password (generate strong password, save in password manager)
# - Full Name: Deploy User
# - Other fields: Can leave blank (press Enter)

# Add user to sudo group
usermod -aG sudo deploy

# Switch to deploy user to test
su - deploy

# Test sudo access
sudo whoami
# Should output: root

# Exit back to root
exit
```

#### Step 6: Configure SSH for Deploy User

**On server (as root):**

```bash
# Create .ssh directory for deploy user
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# Copy root's authorized_keys to deploy user
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

#### Step 7: Test SSH Access as Deploy User

**From local machine:**

```bash
# SSH as deploy user
ssh deploy@<DROPLET_IP>

# Should log in without password
# Test sudo
sudo ls -la /root

# Should work after entering deploy user password
```

#### Step 8: Disable Root Login and Password Authentication

**On server (as deploy user):**

```bash
# Edit SSH configuration
sudo vim /etc/ssh/sshd_config
```

**Find and modify these lines:**

```
# Disable root login
PermitRootLogin no

# Disable password authentication (keys only)
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
```

**Save and restart SSH:**

```bash
# Test configuration
sudo sshd -t

# If no errors, restart SSH
sudo systemctl restart sshd
```

**Important:** Keep your current SSH session open while testing!

#### Step 9: Verify SSH Configuration

**From local machine (new terminal):**

```bash
# Try to SSH as root (should fail)
ssh root@<DROPLET_IP>
# Expected: Permission denied (publickey)

# SSH as deploy user (should work)
ssh deploy@<DROPLET_IP>
# Expected: Successful login
```

#### Step 10: Set Up SSH Config (Optional - Convenience)

**On local machine:**

Edit `~/.ssh/config`:

```
Host blog-prod
    HostName <DROPLET_IP>
    User deploy
    IdentityFile ~/.ssh/id_blog_prod
    ForwardAgent no
```

Now you can SSH with: `ssh blog-prod`

---

### Story 1.2: Configure Firewall and Security

**Objective:** Secure server with UFW firewall and Fail2ban intrusion prevention.

#### Step 1: Configure UFW Firewall

**On server (as deploy user):**

```bash
# Check UFW status (should be inactive by default)
sudo ufw status

# Allow SSH (port 22) FIRST - critical!
sudo ufw allow 22/tcp comment 'SSH'

# Allow HTTP (port 80)
sudo ufw allow 80/tcp comment 'HTTP'

# Allow HTTPS (port 443)
sudo ufw allow 443/tcp comment 'HTTPS'

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Enable UFW (confirm yes when prompted)
sudo ufw enable

# Verify status
sudo ufw status verbose
```

**Expected output:**
```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere                  # SSH
80/tcp                     ALLOW IN    Anywhere                  # HTTP
443/tcp                    ALLOW IN    Anywhere                  # HTTPS
```

**Important:** If you lose SSH access, you can use DigitalOcean console to disable UFW.

#### Step 2: Install and Configure Fail2ban

**On server:**

```bash
# Install Fail2ban
sudo apt install -y fail2ban

# Create local configuration (don't edit defaults)
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit local configuration
sudo vim /etc/fail2ban/jail.local
```

**Find and modify `[DEFAULT]` section:**

```ini
[DEFAULT]
# Ban time: 10 minutes
bantime = 10m

# Find time window: 10 minutes
findtime = 10m

# Max retries before ban
maxretry = 5

# Email notifications (optional - configure after SMTP setup)
# destemail = your-email@example.com
# sendername = Fail2ban
# action = %(action_mwl)s
```

**Find and enable `[sshd]` jail:**

```ini
[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 5
```

**Save and restart Fail2ban:**

```bash
# Start Fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo systemctl status fail2ban

# Check active jails
sudo fail2ban-client status

# Check SSH jail specifically
sudo fail2ban-client status sshd
```

#### Step 3: Test Fail2ban (Optional)

**From another machine or VPS:**

```bash
# Attempt to SSH with wrong password 6 times
# (Your IP will be banned for 10 minutes)

# On server, check banned IPs:
sudo fail2ban-client status sshd
```

**To unban your IP (if you accidentally banned yourself):**

```bash
sudo fail2ban-client set sshd unbanip <YOUR_IP>
```

#### Step 4: Configure Additional Fail2ban Jails (For Later)

**Note:** Nginx jails will be configured after Nginx is deployed. For now, just document them.

**Future jails to add (in Phase 4+):**

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

#### Step 5: Verify Security Configuration

**On server:**

```bash
# Check open ports
sudo ss -tulpn | grep LISTEN

# Should see: SSH (22), but NOT 80/443 yet (no services running)

# Check UFW status
sudo ufw status numbered

# Check Fail2ban jails
sudo fail2ban-client status
```

---

### Story 1.3: Install Docker Environment

**Objective:** Install Docker Engine and Docker Compose on the server.

#### Step 1: Uninstall Old Docker Versions (if any)

**On server:**

```bash
# Remove old versions
sudo apt remove -y docker docker-engine docker.io containerd runc

# Remove old data (if fresh server, won't exist)
sudo rm -rf /var/lib/docker
```

#### Step 2: Install Docker Repository

**On server:**

```bash
# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index
sudo apt update
```

#### Step 3: Install Docker Engine

**On server:**

```bash
# Install Docker Engine, CLI, containerd, and Compose plugin
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Expected output:
# Docker version 27.x.x, build ...
# Docker Compose version v2.29.x
```

#### Step 4: Configure Docker Daemon

**On server:**

```bash
# Create or edit daemon.json
sudo vim /etc/docker/daemon.json
```

**Add the following configuration:**

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "live-restore": true,
  "no-new-privileges": true
}
```

**Configuration explained:**
- `log-driver`: JSON file logging
- `max-size`: 10MB max per log file
- `max-file`: Keep 3 log files (30MB total per container)
- `live-restore`: Keep containers running during Docker daemon updates
- `no-new-privileges`: Security - prevent privilege escalation

**Restart Docker:**

```bash
# Restart Docker daemon
sudo systemctl restart docker

# Verify it's running
sudo systemctl status docker
```

#### Step 5: Add Deploy User to Docker Group

**On server:**

```bash
# Add deploy user to docker group
sudo usermod -aG docker deploy

# Apply group changes (logout and login, or use newgrp)
newgrp docker

# Verify docker works without sudo
docker ps

# Should show empty list (no error)
```

**Important:** You may need to logout and login again for group changes to fully apply.

#### Step 6: Enable Docker to Start on Boot

**On server:**

```bash
# Enable Docker service
sudo systemctl enable docker

# Verify
sudo systemctl is-enabled docker
# Should output: enabled
```

#### Step 7: Test Docker Installation

**On server:**

```bash
# Run hello-world container
docker run hello-world

# Expected output:
# "Hello from Docker!"
# "This message shows that your installation appears to be working correctly."

# Check Docker Compose
docker compose version

# Expected: Docker Compose version v2.29.x or higher

# Clean up test container
docker rm $(docker ps -aq --filter ancestor=hello-world)
```

#### Step 8: Configure Docker Networking (Optional)

**On server:**

```bash
# Check default networks
docker network ls

# Should see: bridge, host, none

# No additional configuration needed for basic setup
```

---

### Story 1.4: Configure Domain DNS

**Objective:** Point domain to DigitalOcean droplet IP address.

#### Step 1: Gather Required Information

**Information needed:**
- Droplet IP address (from Story 1.1)
- Domain name (purchase if you don't have one)
- Access to domain registrar's DNS management

#### Step 2: Access Domain Registrar DNS Settings

**Manual steps (varies by registrar):**

**Common registrars:**
- **Namecheap:** Domain List → Manage → Advanced DNS
- **GoDaddy:** Domain Settings → Manage DNS
- **Cloudflare:** DNS tab
- **Google Domains:** DNS → Custom records

#### Step 3: Create A Records

**Add the following DNS records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `<DROPLET_IP>` | 300 (5 min) |
| A | www | `<DROPLET_IP>` | 300 (5 min) |
| A | analytics | `<DROPLET_IP>` | 300 (5 min) |

**Example (replace with your IP):**
- `@` → `143.198.123.45`
- `www` → `143.198.123.45`
- `analytics` → `143.198.123.45`

**TTL (Time To Live):**
- Set to 300 seconds (5 minutes) during setup for faster propagation testing
- Can increase to 3600 (1 hour) after everything is working

#### Step 4: Optional - Create CNAME for www (Alternative)

**Alternative to A record for www:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | yourdomain.com | 300 |

**Note:** Use either A record OR CNAME for www, not both.

#### Step 5: Remove Conflicting Records

**Check for and remove:**
- Parking page redirects
- Old A records pointing elsewhere
- AAAA records (IPv6) if you don't have IPv6 configured

#### Step 6: Wait for DNS Propagation

**DNS propagation can take:**
- **Minimum:** 5-15 minutes
- **Typical:** 1-4 hours
- **Maximum:** 24-48 hours

**During this time, DO NOT proceed to SSL certificate acquisition.**

#### Step 7: Test DNS Propagation

**From local machine:**

```bash
# Test primary domain
nslookup yourdomain.com

# Expected output:
# Server: ...
# Address: ...
#
# Non-authoritative answer:
# Name: yourdomain.com
# Address: <DROPLET_IP>

# Test www subdomain
nslookup www.yourdomain.com

# Test analytics subdomain
nslookup analytics.yourdomain.com

# Alternative: Use dig
dig yourdomain.com +short
dig www.yourdomain.com +short
dig analytics.yourdomain.com +short

# All should return: <DROPLET_IP>
```

**Online DNS checker:**
- https://www.whatsmydns.net/
- Enter your domain and check A record
- Should show your droplet IP in multiple locations

#### Step 8: Test HTTP Connection (Before SSL)

**From local machine:**

```bash
# Try to curl your domain (will fail - no web server yet, but tests DNS)
curl http://yourdomain.com

# Expected: Connection refused or timeout
# This is NORMAL - we haven't deployed Nginx yet
# Important: Verify curl is using the CORRECT IP
```

**Check the IP curl is connecting to:**

```bash
# Verbose curl to see IP
curl -v http://yourdomain.com

# Look for line like:
# * Trying 143.198.123.45:80...
# This IP should match your droplet IP
```

#### Step 9: Document DNS Configuration

**Create file on server for reference:**

```bash
# On server, create deployment directory
mkdir -p /home/deploy/blog-deployment

# Create DNS reference file
cat > /home/deploy/blog-deployment/dns-records.txt << EOF
DNS Configuration for Blog Deployment
======================================

Droplet IP: <DROPLET_IP>

DNS Records:
- A record: @ → <DROPLET_IP>
- A record: www → <DROPLET_IP>
- A record: analytics → <DROPLET_IP>

Configured on: $(date)
Registrar: <YOUR_REGISTRAR>

Propagation verified: [YES/NO]
EOF
```

---

## Phase 2: Application Containerization

**Timeline:** 3-4 days
**Location:** Production server + local machine
**Goal:** Deploy containerized application stack

### Story 2.1: Set Up GitHub Repository

**Objective:** Create GitHub repository and push code.

#### Step 1: Create GitHub Repository

**Manual steps (GitHub web interface):**

1. Go to https://github.com/new
2. **Repository name:** `blog` (or `personal-blog`, your choice)
3. **Description:** "Personal blog built with SvelteKit and MDsveX"
4. **Visibility:** Public or Private (your choice)
5. **Initialize:** Do NOT check "Add README" (we already have one)
6. Click "Create repository"

#### Step 2: Verify Local Git Repository

**On local machine:**

```bash
# Check if git is initialized
git status

# If not a git repository, initialize
git init

# Check current branch
git branch

# If not on 'main', rename
git branch -M main
```

#### Step 3: Review and Update README

**Edit `README.md` on local machine:**

```markdown
# Personal Blog

A modern, performant blog built with SvelteKit 2 and deployed with Docker.

## Tech Stack

- **Framework:** SvelteKit 2.27+ (Svelte 5)
- **Content:** MDsveX for markdown processing
- **Styling:** TailwindCSS 4
- **Package Manager:** Bun
- **Deployment:** Docker + Docker Compose
- **Analytics:** Umami (self-hosted)
- **Email:** Nodemailer with Postmark

## Local Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Docker Deployment

See [docs/docker-deployment-techspec.md](docs/docker-deployment-techspec.md) for full deployment guide.

## License

[Your License Here]
```

#### Step 4: Verify .gitignore

**Check `.gitignore` includes:**

```
node_modules

# Output
.output
.vercel
.netlify
.wrangler
/.svelte-kit
/build

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.*
!.env.example
!.env.test

# Vite
vite.config.js.timestamp-*
vite.config.ts.timestamp-*

# SQLite (removed but prevent accidental commits)
*.db
*.db-shm
*.db-wal
```

#### Step 5: Stage and Commit All Changes

**On local machine:**

```bash
# Check what will be committed
git status

# Stage all files
git add .

# Review what's staged
git status

# Commit
git commit -m "Initial commit: SvelteKit blog with Docker deployment

- SvelteKit 2 with Svelte 5
- MDsveX for blog posts
- Docker configuration (Dockerfile, docker-compose.yml)
- Nginx reverse proxy configuration
- Removed database dependencies
- Added Umami analytics integration
- Email feedback system with Nodemailer"
```

#### Step 6: Add Remote and Push

**On local machine:**

```bash
# Add GitHub remote (replace with your repo URL)
git remote add origin git@github.com:yourusername/blog.git

# Verify remote
git remote -v

# Push to main branch
git push -u origin main

# Expected output:
# Enumerating objects: ...
# Counting objects: ...
# Writing objects: ...
# To github.com:yourusername/blog.git
#  * [new branch]      main -> main
```

#### Step 7: Verify Repository on GitHub

**Check in browser:**
1. Go to https://github.com/yourusername/blog
2. Verify all files are present
3. Verify `.env` is NOT present (should be gitignored)
4. Check that README renders correctly

#### Step 8: Create .env.example (if not already committed)

**Verify `.env.example` is in repository:**

```bash
# Check if committed
git ls-files | grep .env.example

# Should output: .env.example
```

---

### Story 2.2: Configure Deploy Keys

**Objective:** Set up SSH deploy keys for server to pull from GitHub.

#### Step 1: Generate SSH Key on Server

**On server:**

```bash
# Generate SSH key (use deploy user)
ssh-keygen -t ed25519 -C "deploy@blog-production" -f ~/.ssh/id_github_deploy

# Press Enter for no passphrase (required for automated deployments)

# View public key
cat ~/.ssh/id_github_deploy.pub
```

**Copy the entire public key output** (starts with `ssh-ed25519 ...`)

#### Step 2: Add Deploy Key to GitHub

**Manual steps (GitHub web interface):**

1. Go to your repository: https://github.com/yourusername/blog
2. Click "Settings" tab
3. Click "Deploy keys" in left sidebar
4. Click "Add deploy key"
5. **Title:** "Production Server - yourdomain.com"
6. **Key:** Paste the public key from Step 1
7. **Allow write access:** UNCHECK (read-only)
8. Click "Add key"

#### Step 3: Configure SSH to Use Deploy Key

**On server:**

```bash
# Create/edit SSH config
vim ~/.ssh/config
```

**Add the following:**

```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_github_deploy
    IdentitiesOnly yes
```

**Set permissions:**

```bash
chmod 600 ~/.ssh/config
```

#### Step 4: Test SSH Connection to GitHub

**On server:**

```bash
# Test connection
ssh -T git@github.com

# Expected output:
# Hi yourusername/blog! You've successfully authenticated, but GitHub does not provide shell access.

# If prompted about fingerprint, type 'yes'
```

#### Step 5: Clone Repository to Server

**On server:**

```bash
# Create deployment directory
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www
cd /var/www

# Clone repository
git clone git@github.com:yourusername/blog.git

# Enter directory
cd blog

# Verify clone
ls -la

# Check git status
git status
# Should output: On branch main, nothing to commit
```

#### Step 6: Set Up Git Configuration on Server

**On server:**

```bash
cd /var/www/blog

# Set git user (for future commits, if needed)
git config user.name "Deploy Bot"
git config user.email "deploy@yourdomain.com"

# Verify
git config --list
```

#### Step 7: Test Git Pull

**On server:**

```bash
cd /var/www/blog

# Pull latest (should already be up to date)
git pull origin main

# Expected output:
# Already up to date.
```

---

### Story 3.1: Create Blog Dockerfile (Already Done in Phase 0)

**Status:** ✅ Completed in Story 12.3

**Verification on server:**

```bash
cd /var/www/blog

# Check Dockerfile exists
ls -la Dockerfile

# Verify .dockerignore exists
ls -la .dockerignore
```

**No additional steps required.** Dockerfile was created in Phase 0 and is in the repository.

---

### Story 3.2: Create Docker Compose Configuration (Already Done in Phase 0)

**Status:** ✅ Completed in Story 12.3

**Verification on server:**

```bash
cd /var/www/blog

# Check docker-compose.yml exists
ls -la docker-compose.yml

# Validate configuration
docker compose config

# Should output formatted YAML without errors
```

**No additional steps required.** Docker Compose configuration was created in Phase 0.

---

### Story 3.3: Configure Nginx Reverse Proxy (Already Done in Phase 0)

**Status:** ✅ Completed in Story 12.3

**Verification on server:**

```bash
cd /var/www/blog

# Check Nginx config files exist
ls -la docker/nginx/

# Should show:
# nginx.conf
# ssl-params.conf
```

**Additional step: Update domain placeholders**

#### Update Nginx Configuration with Actual Domain

**On server:**

```bash
cd /var/www/blog/docker/nginx

# Replace yourdomain.com with actual domain
# Method 1: Using sed
sed -i 's/yourdomain\.com/ACTUAL-DOMAIN.com/g' nginx.conf

# Method 2: Manual edit
vim nginx.conf

# Replace all instances of:
# - yourdomain.com → your-actual-domain.com
# - analytics.yourdomain.com → analytics.your-actual-domain.com
```

**Important:** Do this for ALL occurrences in `nginx.conf` (server_name, ssl_certificate paths, etc.)

---

### Story 4.1: Obtain SSL Certificates

**Objective:** Obtain Let's Encrypt SSL certificates using Certbot.

#### Step 1: Create Environment File

**On server:**

```bash
cd /var/www/blog

# Create .env file
vim .env
```

**Add the following (replace placeholders):**

```bash
# ===== PRODUCTION ENVIRONMENT VARIABLES =====

# Domain configuration
DOMAIN=your-actual-domain.com
ANALYTICS_DOMAIN=analytics.your-actual-domain.com
EMAIL=your-email@example.com

# PostgreSQL password for Umami (generate random 32-char string)
POSTGRES_PASSWORD=GENERATE_THIS_SEE_STEP_2

# Umami app secret (generate random 32-char string)
UMAMI_APP_SECRET=GENERATE_THIS_SEE_STEP_2

# Analytics
PUBLIC_BASE_URL=https://your-actual-domain.com
PUBLIC_ANALYTICS_SITE_ID=YOUR_WEBSITE_ID_HERE

# Email (Postmark)
POSTMARK_API_TOKEN=your_postmark_token_here
ADMIN_EMAIL=your-email@example.com
ADMIN_NAME=Your Name

# Cookies
PUBLIC_COOKIE_NAME_COLOR_SCHEME=blog-color-scheme
```

#### Step 2: Generate Secrets

**On server:**

```bash
# Generate PostgreSQL password
openssl rand -base64 32

# Copy output, paste into .env as POSTGRES_PASSWORD

# Generate Umami app secret
openssl rand -base64 32

# Copy output, paste into .env as UMAMI_APP_SECRET
```

**Edit `.env` and replace the placeholder values.**

#### Step 3: Set Secure Permissions on .env

**On server:**

```bash
# Set file permissions (owner read/write only)
chmod 600 .env

# Verify
ls -la .env
# Should show: -rw------- 1 deploy deploy
```

#### Step 4: Create Temporary Nginx Configuration for Certificate Acquisition

**On server:**

```bash
# Create temporary nginx config directory
mkdir -p /var/www/blog/docker/nginx-temp

# Create minimal nginx config for Let's Encrypt challenge
cat > /var/www/blog/docker/nginx-temp/nginx-temp.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        listen [::]:80;
        server_name _;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'OK';
            add_header Content-Type text/plain;
        }
    }
}
EOF
```

#### Step 5: Start Temporary Nginx Container

**On server:**

```bash
cd /var/www/blog

# Create certbot webroot directory
mkdir -p certbot-webroot

# Start temporary nginx container
docker run -d \
  --name nginx-temp \
  -p 80:80 \
  -v $(pwd)/docker/nginx-temp/nginx-temp.conf:/etc/nginx/nginx.conf:ro \
  -v $(pwd)/certbot-webroot:/var/www/certbot \
  nginx:alpine

# Verify it's running
docker ps | grep nginx-temp

# Test from local machine
curl http://your-domain.com
# Should return: OK
```

#### Step 6: Obtain SSL Certificate for Primary Domain

**On server:**

```bash
# Load environment variables
cd /var/www/blog
source .env

# Run Certbot to obtain certificate
docker run -it --rm \
  --name certbot \
  -v letsencrypt:/etc/letsencrypt \
  -v $(pwd)/certbot-webroot:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email ${EMAIL} \
  --agree-tos \
  --no-eff-email \
  -d ${DOMAIN} \
  -d www.${DOMAIN}

# Follow prompts
# - Agree to Terms of Service: Yes
# - Share email with EFF: Your choice (No is fine)
```

**Expected output:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/your-domain.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/your-domain.com/privkey.pem
This certificate expires on YYYY-MM-DD.
```

#### Step 7: Obtain SSL Certificate for Analytics Subdomain

**On server:**

```bash
# Run Certbot for analytics subdomain
docker run -it --rm \
  --name certbot \
  -v letsencrypt:/etc/letsencrypt \
  -v $(pwd)/certbot-webroot:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email ${EMAIL} \
  --agree-tos \
  --no-eff-email \
  -d ${ANALYTICS_DOMAIN}
```

**Expected output:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/analytics.your-domain.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/analytics.your-domain.com/privkey.pem
```

#### Step 8: Verify Certificates

**On server:**

```bash
# List certificates in Docker volume
docker run --rm \
  -v letsencrypt:/etc/letsencrypt \
  alpine:latest \
  ls -la /etc/letsencrypt/live/

# Should show two directories:
# - your-domain.com
# - analytics.your-domain.com

# Check certificate details
docker run --rm \
  -v letsencrypt:/etc/letsencrypt \
  alpine:latest \
  cat /etc/letsencrypt/live/your-domain.com/README

# View certificate expiry
docker run --rm \
  -v letsencrypt:/etc/letsencrypt \
  alpine:latest \
  sh -c "apk add --no-cache openssl && openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -noout -dates"
```

#### Step 9: Stop Temporary Nginx Container

**On server:**

```bash
# Stop and remove temporary nginx
docker stop nginx-temp
docker rm nginx-temp

# Clean up temporary config
rm -rf /var/www/blog/docker/nginx-temp
```

#### Step 10: Document Certificate Information

**On server:**

```bash
cat > /var/www/blog/ssl-certificates.txt << EOF
SSL Certificates Obtained
=========================

Primary Domain: ${DOMAIN}
- Certificate: /etc/letsencrypt/live/${DOMAIN}/fullchain.pem
- Key: /etc/letsencrypt/live/${DOMAIN}/privkey.pem
- Expires: (check with openssl command above)

Analytics Domain: ${ANALYTICS_DOMAIN}
- Certificate: /etc/letsencrypt/live/${ANALYTICS_DOMAIN}/fullchain.pem
- Key: /etc/letsencrypt/live/${ANALYTICS_DOMAIN}/privkey.pem
- Expires: (check with openssl command above)

Obtained: $(date)
Email: ${EMAIL}

Renewal: Certificates auto-renew 30 days before expiry
EOF
```

---

### Story 4.2: Configure Automatic Certificate Renewal

**Objective:** Set up automatic SSL certificate renewal with Certbot.

**Note:** This will be implemented in Phase 4+ with a complete renewal system. For now, we'll document the manual renewal process.

#### Step 1: Test Certificate Renewal (Dry Run)

**On server:**

```bash
cd /var/www/blog

# Test renewal without actually renewing
docker run --rm \
  -v letsencrypt:/etc/letsencrypt \
  -v $(pwd)/certbot-webroot:/var/www/certbot \
  certbot/certbot renew --dry-run

# Expected output:
# Congratulations, all simulated renewals succeeded
```

#### Step 2: Document Manual Renewal Process (For Now)

**On server:**

```bash
cat > /var/www/blog/manual-renewal.sh << 'EOF'
#!/bin/bash
# Manual SSL certificate renewal script
# Run this 30 days before expiry if automatic renewal is not yet set up

set -e

cd /var/www/blog

echo "Starting SSL certificate renewal..."

# Renew certificates
docker run --rm \
  -v letsencrypt:/etc/letsencrypt \
  -v $(pwd)/certbot-webroot:/var/www/certbot \
  certbot/certbot renew

# Reload nginx
docker compose exec nginx nginx -s reload

echo "✅ SSL certificates renewed and nginx reloaded"
EOF

chmod +x /var/www/blog/manual-renewal.sh
```

**Automatic renewal will be implemented in Phase 4 with proper Certbot service in docker-compose.yml.**

---

### Story 5.1: Create Environment Configuration (Already Done)

**Status:** ✅ Completed in Story 4.1, Step 1-3

**Verification:**

```bash
cd /var/www/blog

# Check .env exists and has correct permissions
ls -la .env
# Should show: -rw------- 1 deploy deploy

# Verify all required variables are set
cat .env | grep -v '^#' | grep -v '^$'
```

---

## Phase 3: Deployment Automation

**Timeline:** 3-4 days
**Location:** Server + GitHub
**Goal:** Automate deployment process

### Story 5.2: Create Deployment Script

**Objective:** Create automated deployment script on server.

#### Step 1: Create Deployment Script

**On server:**

```bash
cd /var/www/blog

# Create deploy script
vim deploy.sh
```

**Script content:**

```bash
#!/bin/bash
# Blog Deployment Script
# Pulls latest code, rebuilds containers, and restarts services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Change to blog directory
cd /var/www/blog || { error "Failed to change to /var/www/blog"; exit 1; }

log "Starting deployment..."

# Step 1: Pull latest code
log "Pulling latest code from GitHub..."
git fetch origin main
BEFORE_HASH=$(git rev-parse HEAD)
git pull origin main
AFTER_HASH=$(git rev-parse HEAD)

if [ "$BEFORE_HASH" = "$AFTER_HASH" ]; then
    warning "No new commits. Already up to date."
    log "Current commit: $AFTER_HASH"
else
    success "Updated to commit: $AFTER_HASH"
fi

# Step 2: Check if dependencies changed
log "Checking for dependency changes..."
REBUILD_ALL=false

if git diff --name-only $BEFORE_HASH $AFTER_HASH | grep -q "package.json\|bun.lockb"; then
    warning "Dependencies changed. Will rebuild all containers."
    REBUILD_ALL=true
else
    log "No dependency changes detected."
fi

# Step 3: Build and restart containers
if [ "$REBUILD_ALL" = true ]; then
    log "Rebuilding all containers (dependencies changed)..."
    docker compose build --no-cache
    docker compose up -d
else
    log "Rebuilding only blog container..."
    docker compose build blog
    docker compose up -d --no-deps blog
fi

# Step 4: Wait for health checks
log "Waiting for services to become healthy..."
sleep 10

# Step 5: Check service status
log "Checking service status..."
SERVICES=$(docker compose ps --services)
ALL_HEALTHY=true

for SERVICE in $SERVICES; do
    STATUS=$(docker compose ps --format json $SERVICE | grep -o '"Health":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    if [ "$STATUS" = "healthy" ] || [ -z "$STATUS" ]; then
        success "$SERVICE: healthy"
    else
        error "$SERVICE: $STATUS"
        ALL_HEALTHY=false
    fi
done

# Step 6: Show logs (last 20 lines)
log "Recent logs from blog service:"
docker compose logs --tail=20 blog

# Step 7: Final status
echo ""
echo "========================================"
if [ "$ALL_HEALTHY" = true ]; then
    success "Deployment completed successfully!"
    success "Blog is live at: https://$(grep DOMAIN .env | grep -v ANALYTICS | cut -d'=' -f2)"
else
    error "Some services are not healthy. Check logs with: docker compose logs"
    exit 1
fi
echo "========================================"
```

#### Step 2: Make Script Executable

**On server:**

```bash
chmod +x deploy.sh

# Verify
ls -la deploy.sh
# Should show: -rwxr-xr-x
```

#### Step 3: Create Logs Directory

**On server:**

```bash
mkdir -p /var/www/blog/logs

# Verify
ls -la logs/
```

#### Step 4: Test Deployment Script (First Deployment)

**On server:**

```bash
cd /var/www/blog

# Run deployment
./deploy.sh

# Watch output for any errors
```

**Expected process:**
1. Pull latest code (should be up to date)
2. Check dependencies (may rebuild on first run)
3. Build Docker images
4. Start containers
5. Wait for health checks
6. Display status

**This will take 5-10 minutes on first run (building images).**

#### Step 5: Verify Deployment

**On server:**

```bash
# Check all containers are running
docker compose ps

# Expected output:
# NAME       IMAGE                                         STATUS        PORTS
# blog       blog-blog                                     Up (healthy)
# nginx      nginx:alpine                                  Up            0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# postgres   postgres:16-alpine                            Up (healthy)
# umami      ghcr.io/umami-software/umami:postgresql-latest Up (healthy)  0.0.0.0:3001->3000/tcp

# Check logs for errors
docker compose logs blog | tail -50
docker compose logs nginx | tail -20
docker compose logs umami | tail -20
```

#### Step 6: Test Blog in Browser

**From local machine:**

```bash
# Test HTTPS (should work now)
curl -I https://your-domain.com

# Expected: HTTP/2 200 OK

# Test in browser
open https://your-domain.com
```

**Expected:** Blog loads successfully with HTTPS.

#### Step 7: Test Umami Dashboard

**From local machine:**

```bash
# Test Umami
open https://analytics.your-domain.com
```

**Expected:**
- Umami login page loads
- Default credentials: `admin` / `umami`
- **Change password immediately!**

#### Step 8: Configure Deployment Logging

**On server:**

```bash
# Create deployment log wrapper
cat > /var/www/blog/deploy-with-logging.sh << 'EOF'
#!/bin/bash
# Deployment wrapper with logging

LOG_FILE="/var/www/blog/logs/deploy-$(date +%Y%m%d-%H%M%S).log"

echo "Deployment started at $(date)" | tee -a "$LOG_FILE"
/var/www/blog/deploy.sh 2>&1 | tee -a "$LOG_FILE"
EXIT_CODE=${PIPESTATUS[0]}

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Deployment completed successfully" | tee -a "$LOG_FILE"
else
    echo "❌ Deployment failed with exit code $EXIT_CODE" | tee -a "$LOG_FILE"
fi

# Keep only last 10 log files
cd /var/www/blog/logs
ls -t deploy-*.log | tail -n +11 | xargs -r rm

exit $EXIT_CODE
EOF

chmod +x /var/www/blog/deploy-with-logging.sh
```

#### Step 9: Test Deployment Script with Logging

**On server:**

```bash
cd /var/www/blog

# Run deployment with logging
./deploy-with-logging.sh

# Check log file
ls -la logs/
cat logs/deploy-*.log | tail -50
```

---

### Story 5.3: Set Up GitHub Actions Workflow

**Objective:** Automate deployments on push to main branch.

#### Step 1: Create GitHub Actions Directory

**On local machine:**

```bash
cd /path/to/blog

# Create workflow directory
mkdir -p .github/workflows
```

#### Step 2: Create Deployment Workflow File

**On local machine:**

```bash
# Create deploy workflow
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to Production

on:
  push:
    branches:
      - main
  workflow_dispatch:  # Allow manual trigger

jobs:
  test:
    name: Run Tests & Checks
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run TypeScript check
        run: bun run check

      - name: Run linter
        run: bun run lint

      - name: Build application
        run: bun run build

  deploy:
    name: Deploy to Server
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/blog
            ./deploy-with-logging.sh

      - name: Deployment status
        if: success()
        run: echo "✅ Deployment completed successfully"

      - name: Deployment failed
        if: failure()
        run: |
          echo "❌ Deployment failed"
          exit 1
EOF
```

#### Step 3: Create SSH Key for GitHub Actions

**On local machine (NOT on server):**

```bash
# Generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions@blog-deploy" -f ~/.ssh/id_github_actions_deploy

# Do NOT set a passphrase (press Enter twice)
```

#### Step 4: Add Public Key to Server

**On local machine:**

```bash
# Copy public key
cat ~/.ssh/id_github_actions_deploy.pub

# SSH to server
ssh deploy@<DROPLET_IP>

# On server:
vim ~/.ssh/authorized_keys

# Add the public key as a new line at the end
# Save and exit

# Verify permissions
chmod 600 ~/.ssh/authorized_keys
```

#### Step 5: Test SSH Connection

**On local machine:**

```bash
# Test connection with the new key
ssh -i ~/.ssh/id_github_actions_deploy deploy@<DROPLET_IP>

# Should connect successfully
# Exit the connection
exit
```

#### Step 6: Add Secrets to GitHub Repository

**Manual steps (GitHub web interface):**

1. Go to your repository: https://github.com/yourusername/blog
2. Click "Settings" tab
3. Click "Secrets and variables" → "Actions"
4. Click "New repository secret"

**Add three secrets:**

**Secret 1: SSH_PRIVATE_KEY**
```bash
# On local machine, copy private key
cat ~/.ssh/id_github_actions_deploy

# Copy entire content (including BEGIN and END lines)
```
- Name: `SSH_PRIVATE_KEY`
- Value: [Paste entire private key]
- Click "Add secret"

**Secret 2: SSH_HOST**
- Name: `SSH_HOST`
- Value: `<DROPLET_IP>` or `your-domain.com`
- Click "Add secret"

**Secret 3: SSH_USER**
- Name: `SSH_USER`
- Value: `deploy`
- Click "Add secret"

#### Step 7: Commit and Push Workflow

**On local machine:**

```bash
cd /path/to/blog

# Stage workflow file
git add .github/workflows/deploy.yml

# Commit
git commit -m "Add GitHub Actions deployment workflow

- Run TypeScript checks and linting before deploy
- Build application to verify no build errors
- SSH to server and run deployment script
- Only deploys on push to main branch"

# Push to main
git push origin main
```

#### Step 8: Monitor GitHub Actions

**Steps:**
1. Go to repository: https://github.com/yourusername/blog
2. Click "Actions" tab
3. Click on the running workflow (should start automatically after push)
4. Watch the deployment progress

**Expected steps:**
1. ✅ Checkout code
2. ✅ Setup Bun
3. ✅ Install dependencies
4. ✅ Run TypeScript check
5. ✅ Run linter
6. ✅ Build application
7. ✅ Deploy to production server
8. ✅ Deployment status

**If deployment fails:**
- Check workflow logs for error messages
- Verify secrets are set correctly
- SSH to server manually to debug

#### Step 9: Verify Deployment Completed

**On server:**

```bash
# Check latest deployment log
cat /var/www/blog/logs/deploy-*.log | tail -50

# Check docker containers
docker compose ps

# Check blog service logs
docker compose logs blog --tail=50
```

#### Step 10: Test Automated Deployment

**On local machine:**

```bash
# Make a small change (e.g., update README)
echo "## Deployment Test" >> README.md

# Commit and push
git add README.md
git commit -m "Test automated deployment"
git push origin main

# Watch GitHub Actions
# Wait for deployment to complete

# Verify change is live
curl https://your-domain.com
```

---

## Integration Points

### Summary of Integration Points

**Application Code:**
1. **FeedbackWidget** - Already integrated with Umami tracking, no database dependency
2. **Email Service** - Uses Nodemailer with Postmark, works independently
3. **Rate Limiting** - In-memory implementation, no external dependencies
4. **Umami Script** - Added to `src/app.html`, awaits website ID from Phase 5

**Docker Services:**
1. **blog** - SvelteKit app on port 3000 (internal)
2. **umami** - Analytics on port 3001 (initial setup) and via Nginx (production)
3. **postgres** - Database for Umami (internal port 5432)
4. **nginx** - Reverse proxy on ports 80/443 (public)

**Network Flow:**
```
Internet → Nginx (80/443) → {
    yourdomain.com → blog:3000
    analytics.yourdomain.com → umami:3000
}
```

**Data Persistence:**
- `postgres-data` volume - Umami analytics database
- `letsencrypt` volume - SSL certificates
- `certbot-webroot` volume - Let's Encrypt challenges

---

## Environment Variables

### Complete Environment Variable Reference

**Required for Production (.env file on server):**

```bash
# ===== DOMAIN CONFIGURATION =====
DOMAIN=your-actual-domain.com
ANALYTICS_DOMAIN=analytics.your-actual-domain.com
EMAIL=your-email@example.com

# ===== DOCKER SECRETS =====
# Generate with: openssl rand -base64 32
POSTGRES_PASSWORD=<32-char-random-string>
UMAMI_APP_SECRET=<32-char-random-string>

# ===== PUBLIC VARIABLES (injected into browser) =====
PUBLIC_BASE_URL=https://your-actual-domain.com
PUBLIC_ANALYTICS_SITE_ID=YOUR_WEBSITE_ID_HERE
PUBLIC_COOKIE_NAME_COLOR_SCHEME=blog-color-scheme

# ===== EMAIL SERVICE =====
POSTMARK_API_TOKEN=<your-postmark-api-token>
ADMIN_EMAIL=your-email@example.com
ADMIN_NAME=Your Name
```

**Variable Usage:**

| Variable | Used By | Purpose |
|----------|---------|---------|
| `DOMAIN` | Nginx, deploy scripts | Primary domain name |
| `ANALYTICS_DOMAIN` | Nginx | Analytics subdomain |
| `EMAIL` | Certbot | Let's Encrypt notifications |
| `POSTGRES_PASSWORD` | Postgres, Umami | Database authentication |
| `UMAMI_APP_SECRET` | Umami | Session encryption |
| `PUBLIC_BASE_URL` | SvelteKit | Base URL for links |
| `PUBLIC_ANALYTICS_SITE_ID` | Browser (future) | Umami website ID |
| `POSTMARK_API_TOKEN` | Nodemailer | Email delivery |
| `ADMIN_EMAIL` | Nodemailer | Feedback recipient |
| `ADMIN_NAME` | Nodemailer | Email from name |

---

## Testing & Validation

### Phase 0 Testing Checklist

- [ ] Database packages removed from package.json
- [ ] All database files deleted (db/, drizzle/, *.db)
- [ ] `bun install` completes without errors
- [ ] `bun run check` passes (no TypeScript errors)
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds
- [ ] `bun run preview` works, all pages load
- [ ] FeedbackWidget renders without errors
- [ ] Umami script added to app.html
- [ ] Dockerfile builds successfully
- [ ] Docker Compose config validates
- [ ] Changes committed to Git

### Phase 1 Testing Checklist

- [ ] SSH access as deploy user works
- [ ] Root login disabled
- [ ] Password authentication disabled
- [ ] UFW firewall enabled with correct rules
- [ ] Fail2ban running and monitoring SSH
- [ ] Docker Engine installed (version 27+)
- [ ] Docker Compose installed (version 2.29+)
- [ ] Deploy user in docker group
- [ ] `docker run hello-world` succeeds
- [ ] DNS A records point to droplet IP
- [ ] `nslookup` resolves all domains correctly

### Phase 2 Testing Checklist

- [ ] GitHub repository created
- [ ] Code pushed to main branch
- [ ] `.env` NOT in repository (gitignored)
- [ ] Deploy key added to GitHub
- [ ] SSH to GitHub works from server
- [ ] Repository cloned to /var/www/blog
- [ ] Nginx config updated with actual domain
- [ ] `.env` file created with all variables
- [ ] Secrets generated and added to .env
- [ ] File permissions on .env: 600
- [ ] SSL certificates obtained for both domains
- [ ] Certificates verified with openssl

### Phase 3 Testing Checklist

- [ ] `deploy.sh` script created and executable
- [ ] First deployment completes successfully
- [ ] All 4 containers running and healthy
- [ ] Blog accessible via HTTPS
- [ ] Umami dashboard accessible via HTTPS
- [ ] HTTP redirects to HTTPS (301)
- [ ] Security headers present (check with curl -I)
- [ ] GitHub Actions workflow created
- [ ] GitHub secrets configured (SSH_PRIVATE_KEY, SSH_HOST, SSH_USER)
- [ ] Automated deployment triggered on push to main
- [ ] Workflow completes successfully
- [ ] Changes appear on production site

### Manual Testing Commands

**Test HTTPS:**
```bash
curl -I https://your-domain.com
# Expected: HTTP/2 200, Strict-Transport-Security header

curl -I https://analytics.your-domain.com
# Expected: HTTP/2 200
```

**Test HTTP Redirect:**
```bash
curl -I http://your-domain.com
# Expected: HTTP/1.1 301 Moved Permanently
# Location: https://your-domain.com/
```

**Test Security Headers:**
```bash
curl -I https://your-domain.com | grep -i "x-frame-options\|strict-transport\|x-content-type"
# Expected: All three headers present
```

**Test Docker Services:**
```bash
# On server
docker compose ps
docker compose logs blog --tail=20
docker compose logs nginx --tail=20
docker compose logs umami --tail=20
docker compose logs postgres --tail=20
```

---

## Rollback Procedures

### Emergency Rollback Steps

**If deployment fails and site is down:**

#### Option 1: Rollback to Previous Git Commit

**On server:**
```bash
cd /var/www/blog

# Find previous commit
git log --oneline -5

# Rollback to previous commit (replace COMMIT_HASH)
git reset --hard <COMMIT_HASH>

# Redeploy
./deploy.sh
```

#### Option 2: Restart Containers

**On server:**
```bash
cd /var/www/blog

# Restart all services
docker compose restart

# Or rebuild and restart
docker compose down
docker compose up -d
```

#### Option 3: Restore from Docker Images

**On server:**
```bash
# List available images
docker images | grep blog

# Run specific image version
docker compose down
docker compose up -d
```

### Gradual Rollback Process

1. **Identify Issue:** Check logs (`docker compose logs`)
2. **Assess Severity:** Can it be fixed forward, or needs rollback?
3. **Communicate:** Post status update if public-facing
4. **Execute Rollback:** Use Git reset or container restart
5. **Verify:** Test site is functional
6. **Debug:** Fix issue in development
7. **Redeploy:** When fix is ready

---

## Assumptions & Constraints

### Assumptions

1. **Domain purchased:** You already own a domain or will purchase one
2. **DigitalOcean account:** You have access to DigitalOcean
3. **Email service:** Postmark account exists or will be created
4. **Local development:** You have Node.js/Bun installed locally
5. **Git knowledge:** Familiar with basic Git commands
6. **SSH knowledge:** Comfortable with SSH and terminal
7. **Budget:** $12/month for VPS is acceptable
8. **Traffic:** Low-to-moderate traffic (< 10k visitors/month)
9. **Content management:** Content updated via Git (no CMS)
10. **Single server:** No load balancing or multi-region deployment

### Constraints

1. **Memory:** 2GB RAM limits container count and resource allocation
2. **CPU:** 1 vCPU limits concurrent request handling
3. **Storage:** 50GB SSD limits Docker images, logs, and backups
4. **DNS propagation:** Can take up to 48 hours
5. **SSL certificates:** Require HTTP (port 80) accessible for Let's Encrypt
6. **Docker volumes:** Data persistence requires proper volume management
7. **Umami limitations:** Self-hosted analytics requires database maintenance
8. **Email delivery:** Depends on third-party service (Postmark)
9. **Backup strategy:** Manual backups until Phase 4+ automation
10. **Monitoring:** Basic health checks until Phase 4+ advanced monitoring

### Known Limitations

1. **No database backups yet:** Will be implemented in Phase 4
2. **No SSL auto-renewal yet:** Will be implemented in Phase 4
3. **No monitoring alerts yet:** Will be implemented in Phase 4
4. **Umami website ID:** Placeholder until Umami setup in Phase 5
5. **Email service:** Not configured until you add Postmark token
6. **No staging environment:** Deploying directly to production
7. **Single point of failure:** One server, no redundancy
8. **Resource limits not set:** Will be configured in Phase 5 (Story 10.2)

---

## Next Steps

After completing Phases 0-3, proceed to:

**Phase 4: Reliability & Monitoring (Week 2-3)**
- Epic 6: Backup & Recovery
- Epic 7: Monitoring & Health Checks
- Epic 15: Operational Excellence (Part 1)

**Phase 5: Post-Deployment Configuration (Week 3)**
- Epic 8: Configure Umami Analytics (Story 8.1)
  - Change default password
  - Add website to Umami
  - Get website ID
  - Update `src/app.html` with actual website ID
  - Redeploy application
- Epic 9: Email Service (Stories 9.1-9.2)
- Epic 10: Performance & Optimization

**Phase 6: Documentation & Security (Week 3-4)**
- Epic 11: Documentation & Maintenance
- Epic 15: Operational Excellence (Part 2)
- Epic 16: Security Hardening
- Epic 13: Emergency Response

**Phase 7: Optimization & Launch (Week 4)**
- Epic 14: Performance Optimization
- Final testing
- Go-live

---

## Quick Reference Commands

### Local Development
```bash
bun install                  # Install dependencies
bun run dev                  # Start dev server
bun run build                # Build for production
bun run preview              # Preview production build
bun run check                # TypeScript check
bun run lint                 # Run linter
```

### Git Operations
```bash
git status                   # Check status
git add .                    # Stage all changes
git commit -m "message"      # Commit changes
git push origin main         # Push to GitHub
```

### Server Management
```bash
ssh deploy@<IP>              # SSH to server
sudo systemctl status docker # Check Docker status
docker compose ps            # List running containers
docker compose logs <service> # View logs
docker compose restart       # Restart all services
```

### Deployment
```bash
cd /var/www/blog
./deploy.sh                  # Manual deployment
./deploy-with-logging.sh     # Deployment with logs
git pull origin main         # Pull latest code
```

### Docker Operations
```bash
docker compose up -d         # Start all services
docker compose down          # Stop all services
docker compose build         # Rebuild images
docker compose logs -f       # Follow logs
docker ps                    # List containers
docker images                # List images
```

### SSL Certificates
```bash
# Test renewal
docker run --rm -v letsencrypt:/etc/letsencrypt certbot/certbot renew --dry-run

# Check expiry
docker run --rm -v letsencrypt:/etc/letsencrypt alpine:latest \
  sh -c "apk add openssl && openssl x509 -in /etc/letsencrypt/live/DOMAIN/fullchain.pem -noout -dates"
```

---

## Support & Documentation

**PRD Reference:** [docs/docker-deployment-prd.md](docker-deployment-prd.md)

**Key Documentation:**
- Docker: https://docs.docker.com/
- SvelteKit: https://kit.svelte.dev/
- Nginx: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/docs/
- Umami: https://umami.is/docs

**Troubleshooting:**
- Check container logs: `docker compose logs <service>`
- Check server logs: `/var/log/nginx/`, `/var/log/auth.log`
- Check deployment logs: `/var/www/blog/logs/`
- GitHub Actions logs: Repository → Actions tab

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-10 | Technical Team | Initial technical specification for Phases 0-3 |

---

**END OF TECHNICAL SPECIFICATION - PHASES 0-3**
