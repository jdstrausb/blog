# Product Requirements Document: Docker-Based Blog Deployment

**Document Version:** 1.1
**Date:** October 9, 2025
**Status:** Draft
**Owner:** Product Management
**Target Release:** Q4 2025

---

## Executive Summary

This PRD defines the requirements for deploying a SvelteKit-based personal blog to a DigitalOcean VPS using Docker containerization. The deployment will support a production-ready blog with self-hosted analytics (Umami), SSL/TLS encryption, automated deployment workflows, and comprehensive monitoring capabilities.

### Success Metrics

- Blog accessible via HTTPS with 99.9% uptime
- Page load time < 3 seconds
- Zero-downtime deployments
- Automated SSL certificate renewal
- Complete backup and recovery procedures

---

## Product Overview

### Current State

- **Application:** Personal blog built with SvelteKit 2.27+ (Svelte 5)
- **Content:** File-based MDsveX (.svx files in `src/posts/`)
- **Styling:** TailwindCSS 4
- **Package Manager:** Bun
- **Adapter:** `@sveltejs/adapter-node`
- **Development:** Local development server functional
- **Repository:** Git initialized locally (not yet pushed to remote)

### Target State

- **Infrastructure:** DigitalOcean VPS running Ubuntu 24.04 LTS
- **Containerization:** Docker Compose orchestrating 4 services
- **Deployment:** Automated via GitHub Actions
- **Security:** SSL/TLS via Let's Encrypt, firewall configured
- **Monitoring:** Umami Analytics (to be configured post-deployment)
- **Email:** SMTP service for feedback feature (to be configured)

---

## User Stories & Acceptance Criteria

### Epic 1: Infrastructure Setup

#### Story 1.1: Provision VPS Server

**As a** developer
**I want to** set up a DigitalOcean droplet with proper specifications
**So that** I have a suitable hosting environment for my blog

**Acceptance Criteria:**

- [ ] DigitalOcean droplet created with following specs:
  - Plan: Basic $12/month (2GB RAM, 1 vCPU, 50GB SSD)
  - OS: Ubuntu 24.04 LTS x64
  - Region: Selected based on target audience location
  - SSH key added during creation
- [ ] SSH access confirmed from local machine
- [ ] Non-root user created with sudo privileges
- [ ] SSH configured to use key-based authentication only
- [ ] Password authentication disabled in `/etc/ssh/sshd_config`
- [ ] Root login disabled via SSH
- [ ] Server accessible via SSH on port 22

**Priority:** P0 (Blocker)
**Estimated Effort:** 2 hours

---

#### Story 1.2: Configure Firewall and Security

**As a** system administrator
**I want to** secure the server with proper firewall rules
**So that** only necessary ports are accessible

**Acceptance Criteria:**

- [ ] UFW (Uncomplicated Firewall) installed and enabled
- [ ] Only ports 22, 80, 443 allowed through firewall
- [ ] Default deny policy for incoming traffic
- [ ] Default allow policy for outgoing traffic
- [ ] Fail2ban installed and configured
- [ ] Fail2ban monitoring SSH, nginx-http-auth, nginx-limit-req
- [ ] SSH jail enabled with 10-minute ban time
- [ ] Ban configuration: max 5 retries in 10 minutes
- [ ] Firewall status verified with `sudo ufw status verbose`

**Priority:** P0 (Blocker)
**Estimated Effort:** 1 hour

---

#### Story 1.3: Install Docker Environment

**As a** developer
**I want to** install Docker and Docker Compose on the server
**So that** I can run containerized applications

**Acceptance Criteria:**

- [ ] Docker Engine 27+ installed from official Docker repository
- [ ] Docker Compose plugin 2.29+ installed
- [ ] Docker daemon configured with security best practices:
  - Log rotation (10MB max, 3 files)
  - Live restore enabled
  - No new privileges flag set
- [ ] User added to docker group (no sudo needed for docker commands)
- [ ] Docker service enabled to start on boot
- [ ] Docker installation verified with `docker run hello-world`
- [ ] Docker Compose verified with `docker compose version`

**Priority:** P0 (Blocker)
**Estimated Effort:** 1 hour

---

#### Story 1.4: Configure Domain DNS

**As a** developer
**I want to** point my domain to the DigitalOcean droplet
**So that** users can access my blog via a friendly URL

**Acceptance Criteria:**

- [ ] Domain registered and accessible via domain registrar
- [ ] A record created: `@` → Droplet IP address
- [ ] A record created: `analytics` → Droplet IP address
- [ ] Optional: CNAME record: `www` → primary domain
- [ ] DNS propagation verified (can take up to 48 hours)
- [ ] `nslookup yourdomain.com` resolves to droplet IP
- [ ] `nslookup analytics.yourdomain.com` resolves to droplet IP

**Priority:** P0 (Blocker)
**Estimated Effort:** 30 minutes (+ propagation wait time)

---

### Epic 2: Repository & Version Control

#### Story 2.1: Set Up GitHub Repository

**As a** developer
**I want to** create a public GitHub repository for the blog
**So that** I can version control my code and enable automated deployments

**Acceptance Criteria:**

- [ ] GitHub repository created (public)
- [ ] Repository name follows convention (e.g., `blog` or `personal-blog`)
- [ ] README.md created with project description
- [ ] LICENSE file added (if applicable)
- [ ] `.gitignore` includes:
  - `.env`
  - `.env.*` (excluding `.env.example`)
  - `node_modules/`
  - `.DS_Store`
  - `build/`
  - `.svelte-kit/`
- [ ] `.env.example` created with placeholder values
- [ ] Local repository connected to remote: `git remote add origin <url>`
- [ ] Initial commit pushed to `main` branch
- [ ] Repository URL accessible in browser

**Priority:** P0 (Blocker)
**Estimated Effort:** 30 minutes

---

#### Story 2.2: Configure Deploy Keys

**As a** developer
**I want to** set up SSH deploy keys
**So that** the server can pull code from GitHub

**Acceptance Criteria:**

- [ ] SSH key pair generated on VPS server
- [ ] Public key added to GitHub repository as deploy key
- [ ] Deploy key has read-only access (write access disabled)
- [ ] SSH connection to GitHub verified: `ssh -T git@github.com`
- [ ] Repository can be cloned via SSH on server
- [ ] Deploy key titled descriptively (e.g., "Production Server - yourdomain.com")

**Priority:** P0 (Blocker)
**Estimated Effort:** 20 minutes

---

### Epic 3: Docker Configuration

#### Story 3.1: Create Blog Dockerfile

**As a** developer
**I want to** create an optimized multi-stage Dockerfile for the blog
**So that** the blog can run efficiently in a container

**Acceptance Criteria:**

- [ ] Dockerfile created in project root
- [ ] Multi-stage build implemented:
  - Stage 1 (builder): Install deps, run build
  - Stage 2 (runtime): Copy build output only
- [ ] Base image: `oven/bun:1` for builder stage
- [ ] Runtime uses Node.js compatible base image
- [ ] `bun install --frozen-lockfile` used for reproducible builds
- [ ] Build runs `bun run build` command
- [ ] Non-root user created for runtime (UID 1001)
- [ ] Container runs as non-root user
- [ ] Port 3000 exposed
- [ ] `.dockerignore` excludes:
  - `.git/`
  - `node_modules/`
  - `.env`
  - `.svelte-kit/`
  - `docs/`
- [ ] Image builds successfully: `docker build -t blog .`
- [ ] Image size < 500MB

**Priority:** P0 (Blocker)
**Estimated Effort:** 2 hours

---

#### Story 3.2: Create Docker Compose Configuration

**As a** developer
**I want to** define all services in a docker-compose.yml file
**So that** I can orchestrate the entire application stack

**Acceptance Criteria:**

- [ ] `docker-compose.yml` created in project root
- [ ] Version 3.9+ specified
- [ ] Four services defined:
  1. **blog**: Custom built from Dockerfile
  2. **umami**: `ghcr.io/umami-software/umami:postgresql-latest`
  3. **postgres**: `postgres:16-alpine`
  4. **nginx**: `nginx:alpine`
- [ ] Blog service configuration:
  - Build context: `.`
  - Container name: `blog`
  - Port: `3000` (internal only)
  - Restart policy: `unless-stopped`
  - Health check defined
- [ ] Umami service configuration:
  - Container name: `umami`
  - Port: `3001:3000` (mapped from container 3000)
  - Depends on: `postgres`
  - Environment: `DATABASE_URL`, `DATABASE_TYPE`, `APP_SECRET`
  - Restart policy: `unless-stopped`
  - Health check defined
- [ ] PostgreSQL service configuration:
  - Container name: `postgres`
  - Port: `5432` (internal only, not exposed to host)
  - Environment: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
  - Volume: `postgres-data:/var/lib/postgresql/data`
  - Restart policy: `unless-stopped`
  - Health check defined
- [ ] Nginx service configuration:
  - Container name: `nginx`
  - Ports: `80:80`, `443:443`
  - Volumes: nginx config, SSL certs, webroot
  - Depends on: `blog`, `umami`
  - Restart policy: `unless-stopped`
- [ ] Custom bridge network defined
- [ ] All volumes defined (postgres-data, letsencrypt, certbot-webroot)
- [ ] Environment variables reference `.env` file
- [ ] `docker compose config` validates successfully

**Priority:** P0 (Blocker)
**Estimated Effort:** 3 hours

---

#### Story 3.3: Configure Nginx Reverse Proxy

**As a** developer
**I want to** configure Nginx to route traffic to the correct containers
**So that** users can access both the blog and analytics via their domains

**Acceptance Criteria:**

- [ ] `docker/nginx/nginx.conf` created
- [ ] Two server blocks configured:
  1. Blog: `yourdomain.com` → `http://blog:3000`
  2. Analytics: `analytics.yourdomain.com` → `http://umami:3000`
- [ ] HTTP (port 80) redirects to HTTPS (301 redirect)
- [ ] SSL certificates configured for both domains
- [ ] Security headers included:
  - `Strict-Transport-Security` (HSTS)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Gzip compression enabled
- [ ] Client body size limit set (e.g., 10M)
- [ ] Rate limiting configured for API endpoints
- [ ] WebSocket support for Umami (if needed)
- [ ] `.well-known/acme-challenge/` location for Let's Encrypt
- [ ] Proxy headers set correctly:
  - `X-Real-IP`
  - `X-Forwarded-For`
  - `X-Forwarded-Proto`
  - `Host`
- [ ] Configuration validates: `docker compose exec nginx nginx -t`

**Priority:** P0 (Blocker)
**Estimated Effort:** 2 hours

---

### Epic 4: SSL/TLS Configuration

#### Story 4.1: Obtain SSL Certificates

**As a** developer
**I want to** obtain SSL certificates from Let's Encrypt
**So that** my blog is served over HTTPS

**Acceptance Criteria:**

- [ ] Temporary nginx container started for certificate acquisition
- [ ] Certbot container obtains certificates for primary domain:
  - Domain: `yourdomain.com`
  - SAN: `www.yourdomain.com`
- [ ] Certbot container obtains certificates for analytics subdomain:
  - Domain: `analytics.yourdomain.com`
- [ ] Certificates stored in `letsencrypt` Docker volume
- [ ] Certificate files exist at `/etc/letsencrypt/live/<domain>/`
- [ ] Certificate expiry > 85 days from now
- [ ] Email notifications configured for renewal alerts
- [ ] Temporary nginx container stopped and removed
- [ ] Certificate verification: `openssl x509 -in cert.pem -text -noout`

**Priority:** P0 (Blocker)
**Estimated Effort:** 1 hour

---

#### Story 4.2: Configure Automatic Certificate Renewal

**As a** system administrator
**I want to** automate SSL certificate renewal
**So that** certificates don't expire

**Acceptance Criteria:**

- [ ] Certbot service configured in docker-compose.yml
- [ ] Renewal command configured to run periodically
- [ ] Renewal check runs twice daily (recommended by Let's Encrypt)
- [ ] Nginx reloads after successful renewal
- [ ] Renewal logs available: `docker compose logs certbot`
- [ ] Test renewal: `docker compose run --rm certbot renew --dry-run`
- [ ] Certificate expiry monitored (should renew 30 days before expiry)

**Priority:** P1 (High)
**Estimated Effort:** 1 hour

---

### Epic 5: Deployment Automation

#### Story 5.1: Create Environment Configuration

**As a** developer
**I want to** manage environment variables securely
**So that** sensitive data is not exposed in code

**Acceptance Criteria:**

- [ ] `.env` file created on server (not in git)
- [ ] `.env` file permissions set to 600 (owner read/write only)
- [ ] Required variables defined:
  - `POSTGRES_PASSWORD` (32+ char random string)
  - `UMAMI_APP_SECRET` (32+ char random string)
  - `DOMAIN` (e.g., yourdomain.com)
  - `ANALYTICS_DOMAIN` (e.g., analytics.yourdomain.com)
  - `EMAIL` (for Let's Encrypt notifications)
- [ ] `.env.example` committed to repository with placeholders
- [ ] Secrets generated using: `openssl rand -base64 32`
- [ ] Documentation explains how to generate secrets
- [ ] `.gitignore` includes `.env` to prevent accidental commits

**Priority:** P0 (Blocker)
**Estimated Effort:** 30 minutes

---

#### Story 5.2: Create Deployment Script

**As a** developer
**I want to** automate the deployment process
**So that** I can deploy updates quickly and consistently

**Acceptance Criteria:**

- [ ] `deploy.sh` script created in `/var/www/blog/`
- [ ] Script is executable (`chmod +x deploy.sh`)
- [ ] Script performs the following steps:
  1. Pull latest changes from Git
  2. Check if dependencies changed (package.json, bun.lockb)
  3. Rebuild containers if dependencies changed
  4. Otherwise, rebuild only blog container
  5. Restart affected services
  6. Wait for health checks
  7. Display service status
  8. Show recent logs
- [ ] Script outputs clear progress messages
- [ ] Script exits on error (`set -e`)
- [ ] Script execution time < 5 minutes
- [ ] Test deployment completes successfully
- [ ] Script logs execution: `./deploy.sh >> logs/deploy.log 2>&1`

**Priority:** P0 (Blocker)
**Estimated Effort:** 2 hours

---

#### Story 5.3: Set Up GitHub Actions Workflow

**As a** developer
**I want to** automate deployments when I push to main branch
**So that** changes are deployed without manual intervention

**Acceptance Criteria:**

- [ ] `.github/workflows/deploy.yml` created
- [ ] Workflow triggers on push to `main` branch
- [ ] Workflow runs on latest Ubuntu runner
- [ ] Workflow steps:
  1. Checkout code
  2. Run tests (if applicable)
  3. Run TypeScript check (`bun run check`)
  4. Run linter (`bun run lint`)
  5. SSH into server
  6. Execute deployment script
  7. Verify deployment success
- [ ] GitHub Secrets configured:
  - `SSH_PRIVATE_KEY` (for server access)
  - `SSH_HOST` (droplet IP or domain)
  - `SSH_USER` (deployment user)
- [ ] Workflow includes error notifications
- [ ] Workflow provides deployment status in GitHub UI
- [ ] Workflow execution time < 10 minutes
- [ ] Test deployment via workflow succeeds
- [ ] Failed deployments are reported

**Priority:** P1 (High)
**Estimated Effort:** 3 hours

**Dependencies:** Story 2.1 (GitHub Repository), Story 5.2 (Deployment Script)

---

### Epic 6: Backup & Recovery

#### Story 6.1: Implement Database Backup

**As a** system administrator
**I want to** automatically back up the PostgreSQL database
**So that** I can recover data in case of failure

**Acceptance Criteria:**

- [ ] `backup-database.sh` script created
- [ ] Script is executable
- [ ] Backup directory created: `/home/<user>/backups/postgres/`
- [ ] Script performs PostgreSQL dump from running container
- [ ] Backup compressed with gzip
- [ ] Backup filename includes timestamp: `umami_YYYYMMDD_HHMMSS.sql.gz`
- [ ] Script verifies backup file was created
- [ ] Script removes backups older than 7 days
- [ ] Script outputs backup size and location
- [ ] Cron job configured to run daily at 2 AM
- [ ] Backup logs appended to `/home/<user>/backups/backup.log`
- [ ] Test backup and verify file integrity
- [ ] Test backup restoration procedure

**Priority:** P1 (High)
**Estimated Effort:** 2 hours

---

#### Story 6.2: Implement Volume Backup

**As a** system administrator
**I want to** back up critical Docker volumes
**So that** I can recover the entire system state

**Acceptance Criteria:**

- [ ] `backup-volumes.sh` script created
- [ ] Script is executable
- [ ] Backup directory created: `/home/<user>/backups/volumes/`
- [ ] Script backs up `postgres-data` volume
- [ ] Script backs up `letsencrypt` volume
- [ ] Backups compressed as tar.gz files
- [ ] Backup filenames include timestamp
- [ ] Script removes backups older than 7 days
- [ ] Cron job configured to run weekly (Sunday at 3 AM)
- [ ] Backup logs appended to backup log file
- [ ] Test backup creation succeeds
- [ ] Test restoration procedure documented

**Priority:** P1 (High)
**Estimated Effort:** 2 hours

---

#### Story 6.3: Create Restore Procedures

**As a** system administrator
**I want to** documented procedures for restoring from backups
**So that** I can recover quickly from data loss

**Acceptance Criteria:**

- [ ] `restore-database.sh` script created
- [ ] `restore-volumes.sh` script created
- [ ] Scripts are executable
- [ ] Database restore script:
  - Lists available backups
  - Prompts for confirmation before restoring
  - Stops affected services
  - Drops and recreates database
  - Restores from backup file
  - Restarts services
  - Verifies restoration
- [ ] Volume restore script:
  - Lists available backups
  - Identifies volume type from filename
  - Prompts for confirmation
  - Stops affected services
  - Restores volume data
  - Restarts services
- [ ] Restoration tested successfully in non-production environment
- [ ] Documentation includes step-by-step instructions
- [ ] Recovery Time Objective (RTO) < 1 hour
- [ ] Recovery Point Objective (RPO) < 24 hours

**Priority:** P1 (High)
**Estimated Effort:** 2 hours

---

### Epic 7: Monitoring & Health Checks

#### Story 7.1: Implement Health Check Script

**As a** system administrator
**I want to** monitor system health automatically
**So that** I can detect issues proactively

**Acceptance Criteria:**

- [ ] `health-check.sh` script created
- [ ] Script is executable
- [ ] Script checks:
  - Docker daemon status
  - Container status (running/stopped)
  - Container health checks
  - Disk space usage
  - Memory usage
  - Docker volume usage
  - Recent errors in logs (last 24h)
  - SSL certificate expiry
- [ ] Script outputs clear status indicators (✓/✗)
- [ ] Script exits with appropriate exit codes
- [ ] Cron job configured to run every 30 minutes
- [ ] Health check logs maintained
- [ ] Test script executes without errors

**Priority:** P1 (High)
**Estimated Effort:** 2 hours

---

#### Story 7.2: Configure Alert System

**As a** system administrator
**I want to** receive alerts when issues are detected
**So that** I can respond to problems quickly

**Acceptance Criteria:**

- [ ] `alert-check.sh` script created
- [ ] Script is executable
- [ ] Script monitors:
  - Unhealthy containers
  - High disk usage (>85%)
  - Container count (expected 4 running)
  - Failed services
- [ ] Alerts sent when thresholds exceeded
- [ ] Alert mechanism configured (email or webhook)
- [ ] Cron job configured to run every 15 minutes
- [ ] Test alert triggered successfully
- [ ] Alert fatigue minimized (no duplicate alerts)
- [ ] Documentation explains how to configure alerts

**Priority:** P2 (Medium)
**Estimated Effort:** 2 hours

**Note:** Email alerts require SMTP configuration (Story 9.1)

---

#### Story 7.3: Implement Deployment Testing

**As a** developer
**I want to** verify deployments are successful
**So that** I can catch issues before users are affected

**Acceptance Criteria:**

- [ ] `test-deployment.sh` script created
- [ ] Script is executable
- [ ] Script performs 10 tests:
  1. Container status (all 4 running)
  2. HTTP to HTTPS redirect
  3. Blog HTTPS response (200 OK)
  4. Umami HTTPS response (200 OK)
  5. Umami API heartbeat
  6. SSL certificate validity
  7. Security headers present
  8. PostgreSQL connection
  9. Disk space check
  10. Memory usage check
- [ ] Each test outputs clear pass/fail status
- [ ] Script generates summary report
- [ ] Script runs automatically after deployment
- [ ] Failed tests prevent deployment completion
- [ ] Test results logged
- [ ] Script execution time < 2 minutes

**Priority:** P1 (High)
**Estimated Effort:** 3 hours

---

### Epic 8: Post-Deployment Configuration

#### Story 8.1: Configure Umami Analytics

**As a** blog owner
**I want to** set up Umami to track blog analytics
**So that** I can understand my audience

**Acceptance Criteria:**

- [ ] Umami accessible at `https://analytics.yourdomain.com`
- [ ] Default admin password changed immediately
- [ ] Website added to Umami:
  - Name: Blog name
  - Domain: yourdomain.com
- [ ] Website ID copied from Umami dashboard
- [ ] Tracking script added to `src/app.html`:
  - Correct website ID
  - Correct Umami domain
  - Script loads asynchronously
  - `data-host-url` set correctly
  - `data-website-id` set correctly
- [ ] Blog rebuilt and redeployed with tracking script
- [ ] Tracking verified:
  - Visit blog in browser
  - Check Network tab for Umami script load
  - Check Umami dashboard for page view
  - Real-time stats updating
- [ ] No console errors from tracking script
- [ ] Tracking respects user privacy (no PII collected)

**Priority:** P2 (Medium)
**Estimated Effort:** 1 hour

**Dependencies:** Epic 5 (Deployment), Epic 3 (Docker Configuration)
**Timing:** After initial deployment is successful

---

### Epic 9: Email Service Configuration

#### Story 9.1: Set Up SMTP Service

**As a** blog owner
**I want to** configure email delivery for the feedback feature
**So that** I can receive feedback from readers

**Acceptance Criteria:**

- [ ] Email service provider selected (e.g., SendGrid, Mailgun, AWS SES, Resend)
- [ ] Email service account created
- [ ] SMTP credentials obtained:
  - SMTP host
  - SMTP port
  - SMTP username
  - SMTP password/API key
- [ ] Environment variables added to `.env`:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM_EMAIL`
  - `SMTP_FROM_NAME`
- [ ] Email configuration added to SvelteKit app
- [ ] Test email sent successfully
- [ ] Feedback form sends emails to specified address
- [ ] Email delivery confirmed (check inbox)
- [ ] SPF/DKIM records configured (if applicable)
- [ ] No emails marked as spam
- [ ] Rate limiting configured to prevent abuse

**Priority:** P2 (Medium)
**Estimated Effort:** 3 hours

**Timing:** After initial deployment is successful

---

#### Story 9.2: Implement Feedback Widget

**As a** blog reader
**I want to** submit feedback on blog posts
**So that** I can communicate with the author

**Acceptance Criteria:**

- [ ] Feedback widget visible on blog pages
- [ ] Widget includes form fields:
  - Name (optional)
  - Email (optional)
  - Message (required)
- [ ] Form validation implemented:
  - Email format validation
  - Message length validation (min/max)
  - Required field validation
- [ ] Form submission sends email via SMTP
- [ ] Success message displayed after submission
- [ ] Error handling for failed submissions
- [ ] Rate limiting prevents spam (max 5 per hour per IP)
- [ ] CAPTCHA or honeypot field (optional but recommended)
- [ ] Mobile-responsive design
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Test submission succeeds end-to-end

**Priority:** P2 (Medium)
**Estimated Effort:** 4 hours

**Dependencies:** Story 9.1 (SMTP Service)

---

### Epic 10: Performance & Optimization

#### Story 10.1: Optimize Docker Images

**As a** developer
**I want to** minimize Docker image sizes
**So that** deployments are faster and use less storage

**Acceptance Criteria:**

- [ ] Multi-stage build used for blog image
- [ ] `.dockerignore` excludes unnecessary files
- [ ] Alpine-based images used where possible
- [ ] Only production dependencies installed in final image
- [ ] Build cache optimized (COPY package files before source)
- [ ] Blog image size < 500MB
- [ ] Nginx image size < 50MB
- [ ] PostgreSQL image size < 150MB
- [ ] Total image size < 1GB
- [ ] Image layers minimized (combine RUN commands)
- [ ] No sensitive data in image layers

**Priority:** P2 (Medium)
**Estimated Effort:** 2 hours

---

#### Story 10.2: Configure Resource Limits

**As a** system administrator
**I want to** set resource limits on containers
**So that** no single service can consume all system resources

**Acceptance Criteria:**

- [ ] CPU limits configured in docker-compose.yml:
  - Blog: 0.5 CPUs
  - Umami: 0.5 CPUs
  - PostgreSQL: 0.3 CPUs
  - Nginx: 0.2 CPUs
- [ ] Memory limits configured:
  - Blog: 512MB limit, 256MB reservation
  - Umami: 512MB limit, 256MB reservation
  - PostgreSQL: 512MB limit, 256MB reservation
  - Nginx: 256MB limit, 128MB reservation
- [ ] Total reserved memory < 1GB (buffer for system)
- [ ] OOM (Out of Memory) killer configured
- [ ] Container restart policy set to `unless-stopped`
- [ ] Resource usage monitored: `docker stats`
- [ ] No containers being killed due to OOM
- [ ] System remains responsive under load

**Priority:** P2 (Medium)
**Estimated Effort:** 1 hour

---

#### Story 10.3: Implement Swap Space

**As a** system administrator
**I want to** configure swap space on the server
**So that** the system has additional memory buffer

**Acceptance Criteria:**

- [ ] 2GB swap file created: `/swapfile`
- [ ] Swap file permissions set to 600
- [ ] Swap enabled: `swapon /swapfile`
- [ ] Swap configured to persist across reboots (added to `/etc/fstab`)
- [ ] Swap usage monitored: `free -h`
- [ ] Swappiness configured appropriately (vm.swappiness=10)
- [ ] System uses swap only when necessary
- [ ] Documentation explains swap configuration

**Priority:** P2 (Medium)
**Estimated Effort:** 30 minutes

---

### Epic 11: Documentation & Maintenance

#### Story 11.1: Create Deployment Documentation

**As a** future maintainer
**I want to** comprehensive documentation of the deployment
**So that** I can maintain and troubleshoot the system

**Acceptance Criteria:**

- [ ] README.md updated with deployment overview
- [ ] `docs/deployment-guide.md` created with:
  - Prerequisites
  - Step-by-step deployment instructions
  - Environment variable explanations
  - Troubleshooting section
  - Common issues and solutions
- [ ] Architecture diagram included
- [ ] All scripts documented with usage examples
- [ ] Backup and restore procedures documented
- [ ] Rollback procedure documented
- [ ] Emergency procedures documented
- [ ] Monitoring and alerting explained
- [ ] Docker commands reference included
- [ ] Links to external resources (Docker docs, Let's Encrypt, etc.)

**Priority:** P1 (High)
**Estimated Effort:** 4 hours

---

#### Story 11.2: Create Troubleshooting Guide

**As a** system administrator
**I want to** documented solutions for common issues
**So that** I can resolve problems quickly

**Acceptance Criteria:**

- [ ] `docs/troubleshooting.md` created
- [ ] Common issues documented:
  - Container won't start
  - Database connection failures
  - SSL certificate issues
  - Nginx 502 Bad Gateway
  - High memory usage
  - Blog build fails
  - Out of disk space
- [ ] Each issue includes:
  - Symptoms
  - Diagnosis commands
  - Root causes
  - Step-by-step solutions
- [ ] Emergency procedures section:
  - Complete system failure
  - Data corruption
  - Security breach response
- [ ] Commands copy-pasteable
- [ ] Examples use placeholder values
- [ ] Links to relevant documentation

**Priority:** P1 (High)
**Estimated Effort:** 3 hours

---

#### Story 11.3: Create Operations Runbook

**As a** system administrator
**I want to** documented procedures for routine maintenance
**So that** I can maintain the system effectively

**Acceptance Criteria:**

- [ ] `docs/operations-runbook.md` created
- [ ] Daily tasks documented:
  - Check container health
  - Review logs for errors
  - Monitor disk space
- [ ] Weekly tasks documented:
  - Review backup status
  - Check SSL certificate expiry
  - Update Docker images
  - Review security updates
- [ ] Monthly tasks documented:
  - Rotate secrets (if needed)
  - Review resource usage trends
  - Test disaster recovery procedures
  - Clean up old Docker resources
- [ ] Each task includes:
  - Purpose
  - Commands to execute
  - Expected output
  - What to do if checks fail
- [ ] Checklist format for easy tracking
- [ ] Estimated time for each task

**Priority:** P2 (Medium)
**Estimated Effort:** 2 hours

---

### Epic 12: Application Pre-Deployment Preparation

#### Story 12.1: Remove Database Dependencies

**As a** developer
**I want to** remove SQLite database dependencies from the blog application
**So that** the application runs without a local database

**Acceptance Criteria:**

- [ ] Database packages removed from `package.json`:
  - `drizzle-orm`
  - `@libsql/client`
  - Any other database-related packages
- [ ] Database code removed:
  - `src/lib/server/db/` directory deleted
  - `drizzle/` directory deleted
  - `local.db` file deleted (if exists)
- [ ] Database imports removed from codebase:
  - Search for `drizzle` imports
  - Search for database initialization code
  - Remove server-side database queries
- [ ] FeedbackWidget updated to use Umami event tracking instead of database:
  - Replace database feedback storage with `window.umami.track()`
  - Event tracking for "helpful" feedback
  - No database dependency
- [ ] Build verification:
  - `bun install` completes without errors
  - `bun run build` succeeds
  - `bun run preview` works correctly
  - No console errors related to database
- [ ] All blog pages load without database errors
- [ ] No TypeScript errors: `bun run check` passes

**Priority:** P0 (Blocker)
**Estimated Effort:** 2 hours

**Dependencies:** Must be completed before Story 3.1 (Dockerfile creation)

---

#### Story 12.2: Configure Umami Tracking in Application

**As a** developer
**I want to** add Umami tracking script to the blog
**So that** analytics are tracked from day one

**Acceptance Criteria:**

- [ ] Umami script tag added to `src/app.html` in `<head>` section
- [ ] Script attributes configured:
  - `async` attribute set
  - `src` pointing to `https://analytics.yourdomain.com/script.js`
  - `data-website-id` with placeholder `YOUR_WEBSITE_ID_HERE`
- [ ] Script positioned before `%sveltekit.head%` tag
- [ ] TypeScript types for `window.umami` added (if needed)
- [ ] FeedbackWidget uses Umami tracking:
  - `window.umami.track('feedback', { helpful: true/false })`
  - Graceful degradation if Umami not loaded
- [ ] Local build test:
  - Script doesn't cause errors in development
  - Script loads correctly in preview mode
  - No console errors
- [ ] Documentation notes that `YOUR_WEBSITE_ID_HERE` must be replaced post-deployment

**Priority:** P0 (Blocker)
**Estimated Effort:** 1 hour

**Note:** Actual website ID will be obtained after Umami setup (Story 8.1)

---

#### Story 12.3: Create Dockerfiles and Configuration Files

**As a** developer
**I want to** create all Docker-related configuration files
**So that** the application can be containerized

**Acceptance Criteria:**

- [ ] `Dockerfile` created with multi-stage build (as specified in Story 3.1)
- [ ] `.dockerignore` created with exclusions:
  - `.git/`, `node_modules/`, `.env`, `.svelte-kit/`, `docs/`
  - Build outputs, logs, temporary files
  - OS-specific files (`.DS_Store`, `Thumbs.db`)
- [ ] `docker-compose.yml` created with 4 services (as specified in Story 3.2)
- [ ] `docker-compose.dev.yml` created for local development:
  - Uses Vite dev server
  - Volume mounts for hot reload
  - Development environment variables
- [ ] `docker/nginx/nginx.conf` created with full configuration:
  - HTTP to HTTPS redirect
  - Two server blocks (blog + analytics)
  - Security headers
  - Rate limiting
  - Gzip compression
  - Proxy settings
- [ ] `docker/nginx/ssl-params.conf` created with SSL best practices:
  - TLS 1.2+ protocols
  - Strong cipher suites
  - OCSP stapling
  - Session configuration
- [ ] `.env.example` created with placeholder values:
  - `POSTGRES_PASSWORD=`
  - `UMAMI_APP_SECRET=`
  - `DOMAIN=yourdomain.com`
  - `ANALYTICS_DOMAIN=analytics.yourdomain.com`
  - `EMAIL=your-email@example.com`
- [ ] All placeholder domain names use `yourdomain.com` consistently
- [ ] Local Docker build test succeeds: `docker build -t blog-test .`
- [ ] Docker Compose validation: `docker compose config` passes

**Priority:** P0 (Blocker)
**Estimated Effort:** 4 hours

**Dependencies:** Story 12.1 (Database removal), Story 12.2 (Umami script)

---

### Epic 13: Emergency Response & Troubleshooting

#### Story 13.1: Create Data Corruption Recovery Procedure

**As a** system administrator
**I want to** documented procedures for handling data corruption
**So that** I can recover from database corruption incidents

**Acceptance Criteria:**

- [ ] Data corruption procedure documented in `docs/troubleshooting.md`
- [ ] Procedure includes step-by-step instructions:
  1. Stop affected services (umami, postgres)
  2. Backup current state (even if corrupted)
  3. Restore from last known good backup
  4. Restart services
  5. Verify data integrity
- [ ] Data integrity verification commands included:
  - PostgreSQL connection test
  - Row count queries
  - Sample data verification
- [ ] Commands are copy-pasteable
- [ ] Symptoms of data corruption listed:
  - Database connection errors
  - Query failures
  - Umami dashboard errors
  - Missing analytics data
- [ ] Recovery tested in non-production environment
- [ ] Expected recovery time documented (RTO)
- [ ] Recovery point documented (RPO)

**Priority:** P1 (High)
**Estimated Effort:** 1 hour

**Dependencies:** Story 6.3 (Restore procedures)

---

#### Story 13.2: Create Security Breach Response Plan

**As a** security administrator
**I want to** a documented incident response plan
**So that** I can respond quickly to security incidents

**Acceptance Criteria:**

- [ ] Security breach response documented in `docs/troubleshooting.md`
- [ ] Response plan includes phases:
  1. **Isolate:** Block malicious IPs via UFW
  2. **Assess:** Stop services, audit logs
  3. **Remediate:** Rotate secrets, update packages
  4. **Recover:** Restart services with new credentials
  5. **Review:** Analyze breach, update defenses
- [ ] Log audit commands documented:
  - Docker daemon logs
  - Container logs
  - Authentication logs (`/var/log/auth.log`)
  - Nginx access/error logs
  - Fail2ban logs
- [ ] Secret rotation procedure included:
  - Generate new PostgreSQL password
  - Generate new Umami app secret
  - Update `.env` file
  - Update database password
  - Restart affected services
- [ ] Commands for blocking malicious IPs:
  - `sudo ufw deny from <ip>`
  - `sudo fail2ban-client set sshd banip <ip>`
- [ ] Post-incident checklist:
  - Review security logs
  - Update firewall rules
  - Patch vulnerabilities
  - Change all credentials
  - Document lessons learned
- [ ] Contact information for security resources
- [ ] Escalation procedures documented

**Priority:** P1 (High)
**Estimated Effort:** 2 hours

---

### Epic 14: Performance Optimization

#### Story 14.1: Optimize Docker Image Builds

**As a** developer
**I want to** optimize Docker build performance
**So that** deployments are faster

**Acceptance Criteria:**

- [ ] Docker BuildKit enabled for faster builds
- [ ] Build optimization script created: `optimize-images.sh`
- [ ] Script includes commands:
  - Remove unused images: `docker image prune -a`
  - Check image sizes
  - Rebuild with BuildKit: `DOCKER_BUILDKIT=1 docker build`
- [ ] Multi-stage build optimization verified:
  - Dependencies cached in separate layer
  - Source code copied after dependencies
  - Build artifacts minimized in final image
- [ ] `.dockerignore` optimized to exclude maximum files
- [ ] Image size targets met:
  - Blog image < 500MB
  - Total image size < 1GB
- [ ] Build time measured and documented
- [ ] Build cache effectiveness verified
- [ ] Documentation includes build optimization tips

**Priority:** P2 (Medium)
**Estimated Effort:** 1 hour

---

#### Story 14.2: Implement Database Optimization

**As a** database administrator
**I want to** optimize PostgreSQL database performance
**So that** Umami responds quickly

**Acceptance Criteria:**

- [ ] Database optimization script created: `optimize-database.sh`
- [ ] Script includes VACUUM command:
  - `docker compose exec postgres vacuumdb -U umami -d umami -v -f -z`
- [ ] Database size monitoring command:
  - Query to check database size
  - Query to check table sizes
- [ ] Query performance analysis documented:
  - `EXPLAIN ANALYZE` usage
  - Slow query identification
- [ ] Optimization schedule recommended:
  - Weekly VACUUM
  - Monthly ANALYZE
- [ ] Performance metrics baseline established:
  - Query response time < 100ms
  - Database size monitoring
- [ ] Script is executable and tested
- [ ] Documentation includes when to run optimization

**Priority:** P2 (Medium)
**Estimated Effort:** 1 hour

---

#### Story 14.3: Configure Nginx Caching

**As a** system administrator
**I want to** enable Nginx caching for static assets
**So that** page load times are reduced

**Acceptance Criteria:**

- [ ] Nginx cache configuration added to `docker/nginx/nginx.conf`
- [ ] Cache path configured:
  - `proxy_cache_path /var/cache/nginx`
  - Levels: 1:2
  - Keys zone: 10m
  - Max size: 100m
  - Inactive: 60m
- [ ] Cache rules for static assets:
  - File types: `.jpg`, `.jpeg`, `.png`, `.gif`, `.ico`, `.css`, `.js`, `.woff`, `.woff2`
  - Cache valid: 60 minutes
  - Cache status header: `X-Cache-Status`
- [ ] Cache volume added to docker-compose.yml
- [ ] Cache purge procedure documented
- [ ] Cache hit rate monitored via headers
- [ ] Performance improvement measured:
  - Before/after page load times
  - Cache hit percentage
- [ ] Documentation includes cache management commands

**Priority:** P2 (Medium)
**Estimated Effort:** 1.5 hours

---

### Epic 15: Operational Excellence

#### Story 15.1: Create Backup Verification Script

**As a** system administrator
**I want to** automatically verify backup integrity
**So that** I can trust my backups

**Acceptance Criteria:**

- [ ] `verify-backups.sh` script created
- [ ] Script is executable
- [ ] Script checks:
  - Database backups exist
  - Database backup count
  - Latest backup date/time
  - Backup file integrity (gunzip test)
  - Volume backups exist
  - Volume backup count
  - Docker volume status
- [ ] Script outputs comprehensive report:
  - Total backup count
  - Latest backup details
  - File sizes
  - Integrity test results
  - Clear ✓/✗ indicators
- [ ] Report format is readable and parseable
- [ ] Script runs without errors
- [ ] Cron job configured for monthly verification
- [ ] Failed verifications send alerts
- [ ] Documentation includes interpretation of results

**Priority:** P1 (High)
**Estimated Effort:** 2 hours

---

#### Story 15.2: Document File Structure and Commands

**As a** developer
**I want to** complete documentation with file structure and command reference
**So that** new team members can understand the project quickly

**Acceptance Criteria:**

- [ ] Complete file structure documented in `docs/deployment-guide.md`:
  - Directory tree showing all important files
  - Description of each directory's purpose
  - Key files highlighted
- [ ] Essential commands reference created:
  - Docker Compose commands (up, down, logs, restart, etc.)
  - Container management commands
  - System maintenance commands
  - Deployment commands
- [ ] Port reference table included:
  - Service, internal port, external port, access level
- [ ] Command examples include expected output
- [ ] Common command combinations documented
- [ ] Quick reference card format available
- [ ] Commands tested and verified
- [ ] Cross-references to detailed documentation

**Priority:** P1 (High)
**Estimated Effort:** 2 hours

---

#### Story 15.3: Document Cost Breakdown and Resources

**As a** project stakeholder
**I want to** understand ongoing costs and available resources
**So that** I can budget appropriately

**Acceptance Criteria:**

- [ ] Monthly cost breakdown documented:
  - VPS: $12/month (2GB droplet)
  - Domain: ~$1/month (amortized)
  - Total: ~$13/month
- [ ] Optional add-on costs documented:
  - Off-site backups (Backblaze B2)
  - Email service tiers
  - Monitoring services
  - Upgraded VPS options
- [ ] One-time costs documented:
  - Domain registration
  - Initial setup time investment
- [ ] Resource allocation documented:
  - RAM usage per service
  - CPU allocation
  - Storage requirements
  - Network bandwidth
- [ ] Upgrade path documented:
  - When to upgrade (metrics)
  - 4GB droplet costs ($24/month)
  - Benefits of upgrading
- [ ] Learning resources compiled:
  - Official documentation links
  - Tutorial links
  - Community resources
  - Troubleshooting forums
- [ ] Cost optimization tips included

**Priority:** P2 (Medium)
**Estimated Effort:** 1 hour

---

### Epic 16: Security Hardening

#### Story 16.1: Implement Docker Security Best Practices

**As a** security-conscious administrator
**I want to** harden Docker security
**So that** containers are isolated and secure

**Acceptance Criteria:**

- [ ] Non-root user configured in blog Dockerfile
- [ ] `--no-new-privileges` flag set in Docker daemon config
- [ ] Containers run with read-only filesystem where possible
- [ ] Secrets not stored in Dockerfiles or images
- [ ] AppArmor/SELinux profiles enabled (if available)
- [ ] Unnecessary capabilities dropped
- [ ] Docker socket not mounted in containers
- [ ] Container images scanned for vulnerabilities
- [ ] Only necessary ports exposed
- [ ] Docker daemon TLS configured (if remote access needed)
- [ ] User namespaces enabled (if compatible with OS)
- [ ] Docker daemon configuration file created: `/etc/docker/daemon.json`
- [ ] Configuration includes:
  - Log rotation settings
  - Live restore enabled
  - `no-new-privileges` flag
- [ ] Security best practices documented
- [ ] Container security audit completed

**Priority:** P1 (High)
**Estimated Effort:** 3 hours

---

#### Story 16.2: Configure Automatic Security Updates

**As a** system administrator
**I want to** automatically apply security updates
**So that** the system stays patched

**Acceptance Criteria:**

- [ ] `unattended-upgrades` package installed
- [ ] Automatic security updates enabled
- [ ] Configuration file `/etc/apt/apt.conf.d/50unattended-upgrades` configured:
  - Security updates automatically installed
  - System reboots if required (at scheduled time)
  - Email notifications configured (optional)
- [ ] Update check frequency: daily
- [ ] Verification: `/etc/apt/apt.conf.d/20auto-upgrades` configured
- [ ] Test update applied successfully
- [ ] Logs reviewed: `/var/log/unattended-upgrades/`
- [ ] Critical updates applied within 24 hours

**Priority:** P1 (High)
**Estimated Effort:** 1 hour

---

#### Story 16.3: Implement Secret Rotation

**As a** security-conscious administrator
**I want to** rotate secrets periodically
**So that** compromised credentials have limited lifespan

**Acceptance Criteria:**

- [ ] Secret rotation procedure documented
- [ ] Rotation schedule defined (quarterly recommended)
- [ ] `rotate-secrets.sh` script created (optional)
- [ ] Procedure includes:
  - Generate new secrets
  - Update `.env` file
  - Update PostgreSQL password
  - Update Umami app secret
  - Restart affected services
  - Verify services healthy
- [ ] Secrets stored securely (never in git)
- [ ] Old secrets invalidated after rotation
- [ ] Rotation tested in non-production environment
- [ ] Calendar reminder set for next rotation

**Priority:** P2 (Medium)
**Estimated Effort:** 2 hours

---

## Technical Requirements

### System Requirements

| Component | Requirement |
|-----------|-------------|
| **VPS Provider** | DigitalOcean |
| **Plan** | Basic Droplet - $12/month (2GB RAM, 1 vCPU, 50GB SSD) |
| **Operating System** | Ubuntu 24.04 LTS x64 |
| **Docker Engine** | 27.0+ |
| **Docker Compose** | 2.29+ |
| **Domain** | User-owned domain with DNS access |
| **SSL/TLS** | Let's Encrypt (free) |

### Software Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend Framework** | SvelteKit | 2.27+ |
| **UI Library** | Svelte 5 | 5.x (with runes) |
| **Styling** | TailwindCSS | 4.x |
| **Package Manager** | Bun | 1.x |
| **Adapter** | @sveltejs/adapter-node | Latest |
| **Content** | MDsveX | Latest |
| **Container Runtime** | Docker | 27+ |
| **Orchestration** | Docker Compose | 2.29+ |
| **Web Server** | Nginx | Alpine (latest) |
| **Database** | PostgreSQL | 16-alpine |
| **Analytics** | Umami | postgresql-latest |
| **SSL/TLS** | Let's Encrypt (Certbot) | Latest |

### Resource Allocation (2GB RAM Droplet)

| Component | RAM | CPU | Storage |
|-----------|-----|-----|---------|
| Docker Engine | ~150MB | <5% | - |
| Blog Container | ~200MB | <10% | - |
| Umami Container | ~250MB | <10% | - |
| PostgreSQL | ~150MB | <5% | 1GB |
| Nginx | ~50MB | <5% | - |
| Ubuntu System | ~200MB | <5% | 10GB |
| **Buffer** | ~1000MB | ~60% | 39GB |

### Network Requirements

| Port | Protocol | Purpose |
|------|----------|---------|
| 22 | SSH | Server administration |
| 80 | HTTP | Redirect to HTTPS |
| 443 | HTTPS | Blog and analytics traffic |

### Security Requirements

- SSH key-based authentication only (no passwords)
- Root login disabled
- Firewall (UFW) configured with minimal open ports
- Fail2ban configured for intrusion prevention
- SSL/TLS certificates (Let's Encrypt)
- Security headers in Nginx configuration
- Container isolation via Docker networks
- Non-root users in containers
- Automatic security updates enabled
- Secrets not stored in version control

---

## Non-Functional Requirements

### Performance

- **Page Load Time:** < 3 seconds (first contentful paint)
- **Time to Interactive:** < 5 seconds
- **Lighthouse Score:** > 90 (Performance)
- **Container Start Time:** < 30 seconds (cold start)
- **Deployment Time:** < 5 minutes
- **Database Query Time:** < 100ms (95th percentile)

### Reliability

- **Uptime:** 99.9% (excluding planned maintenance)
- **Recovery Time Objective (RTO):** < 1 hour
- **Recovery Point Objective (RPO):** < 24 hours
- **Automatic Restart:** Containers restart on failure
- **Health Checks:** All services monitored
- **Backup Frequency:** Daily (database), Weekly (volumes)

### Scalability

- **Initial Load:** Support 100 concurrent users
- **Storage Growth:** 10GB/year estimated
- **Database Growth:** 1GB/year estimated
- **Horizontal Scaling:** Not required for initial deployment
- **Vertical Scaling:** Can upgrade to 4GB droplet if needed

### Security

- **SSL/TLS:** TLS 1.2 minimum, TLS 1.3 preferred
- **Certificate Rotation:** Automatic (every 60 days)
- **Secret Rotation:** Quarterly (manual)
- **Security Updates:** Automatic (daily check)
- **Vulnerability Scanning:** Docker images scanned
- **Access Control:** SSH key authentication only
- **Intrusion Detection:** Fail2ban configured

### Maintainability

- **Documentation:** Comprehensive guides for all procedures
- **Logging:** Centralized in Docker logs
- **Monitoring:** Health checks + manual scripts
- **Backup Verification:** Monthly restore tests
- **Update Process:** Zero-downtime deployments
- **Rollback Time:** < 15 minutes

### Usability

- **Admin Interface:** Umami dashboard (web-based)
- **Deployment:** Single command (`./deploy.sh`)
- **Monitoring:** Simple scripts with clear output
- **Alerts:** Email or webhook notifications
- **Documentation:** Step-by-step guides with examples

---

## Assumptions & Dependencies

### Assumptions

1. Blog content is stored in Git repository (MDsveX files)
2. Blog does not require user authentication or database
3. Traffic volume is low-to-moderate (< 10k visitors/month initially)
4. Developer has basic Linux/Docker knowledge
5. DigitalOcean account already exists
6. Domain will be purchased separately
7. SMTP service will be third-party (not self-hosted)
8. Umami analytics is sufficient (no Google Analytics needed)
9. Content updates via Git (no CMS required)
10. Single-server deployment (no load balancing)

### Dependencies

**External Services:**
- DigitalOcean (VPS hosting)
- Domain registrar (DNS)
- Let's Encrypt (SSL certificates)
- GitHub (code repository)
- SMTP provider (email delivery) - TBD

**Software Dependencies:**
- Ubuntu 24.04 LTS support lifecycle
- Docker engine compatibility
- SvelteKit stability
- Bun package manager
- PostgreSQL 16 support

**Deployment Dependencies:**
- DNS propagation (can take 24-48 hours)
- SSL certificate issuance (< 5 minutes typically)
- Docker image builds (depends on network speed)
- Initial database setup (< 1 minute)

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **DNS propagation delay** | High | Medium | Set up DNS early, wait 48h before SSL cert |
| **SSL certificate renewal failure** | High | Low | Monitor expiry, test dry-run renewals, alerts configured |
| **Out of memory (OOM)** | High | Medium | Configure swap, set resource limits, monitor usage |
| **Docker daemon crash** | High | Low | Auto-restart configured, monitoring alerts |
| **Database corruption** | High | Low | Daily backups, monthly restore tests |
| **Disk space exhaustion** | Medium | Medium | Monitor disk usage, log rotation, cleanup scripts |
| **Security breach** | High | Low | Firewall, Fail2ban, security updates, minimal attack surface |
| **Deployment failure** | Medium | Medium | Automated testing, health checks, rollback procedure |
| **SMTP service issues** | Low | Medium | Use reliable provider, implement retry logic, monitoring |
| **Traffic spike (DDoS)** | Medium | Low | Cloudflare integration (future), rate limiting in Nginx |
| **GitHub Actions outage** | Low | Low | Manual deployment script as fallback |
| **Let's Encrypt downtime** | Low | Low | Certificate valid 90 days, renews at 60 days |

---

## Success Metrics & KPIs

### Deployment Success Metrics

- [ ] All 16 epics completed
- [ ] All P0 stories completed (13 stories)
- [ ] All P1 stories completed (14 stories)
- [ ] Blog accessible via HTTPS
- [ ] SSL certificate valid
- [ ] All 4 containers running
- [ ] All health checks passing
- [ ] Deployment tests passing (10/10)
- [ ] Backup procedures tested
- [ ] Documentation complete
- [ ] Emergency procedures documented
- [ ] Performance optimizations applied
- [ ] Security hardening completed

### Performance Metrics

- **Page Load Time:** < 3s (target)
- **Lighthouse Score:** > 90
- **Container Start Time:** < 30s
- **Deployment Time:** < 5min
- **Uptime:** > 99.9%

### Operational Metrics

- **Backup Success Rate:** 100%
- **Deployment Success Rate:** > 95%
- **Mean Time to Recovery (MTTR):** < 1 hour
- **Security Update Lag:** < 7 days
- **SSL Certificate Expiry Buffer:** > 30 days

### User Metrics (Post-Launch)

- **Page Views:** Tracked via Umami
- **Unique Visitors:** Tracked via Umami
- **Bounce Rate:** Tracked via Umami
- **Average Session Duration:** Tracked via Umami
- **Feedback Submissions:** Email count

---

## Timeline & Milestones

### Phase 0: Pre-Deployment Preparation (Week 0 - Local Development)

- **Day -2 to -1:** Epic 12 (Application Pre-Deployment Preparation)
  - Story 12.1: Remove database dependencies
  - Story 12.2: Configure Umami tracking
  - Story 12.3: Create Dockerfiles and config files
  - **Deliverable:** Application ready for containerization

### Phase 1: Infrastructure Setup (Week 1)

- **Day 1-2:** Epic 1 (Infrastructure Setup)
  - Story 1.1: Provision VPS
  - Story 1.2: Configure firewall
  - Story 1.3: Install Docker
  - Story 1.4: Configure DNS

- **Day 3-4:** Epic 2 (Repository & Version Control)
  - Story 2.1: GitHub repository
  - Story 2.2: Deploy keys

### Phase 2: Application Containerization (Week 1-2)

- **Day 5-7:** Epic 3 (Docker Configuration)
  - Story 3.1: Blog Dockerfile (uses files from Epic 12)
  - Story 3.2: Docker Compose
  - Story 3.3: Nginx configuration

- **Day 8-9:** Epic 4 (SSL/TLS)
  - Story 4.1: Obtain certificates
  - Story 4.2: Auto-renewal

### Phase 3: Deployment Automation (Week 2)

- **Day 10-12:** Epic 5 (Deployment Automation)
  - Story 5.1: Environment config
  - Story 5.2: Deployment script
  - Story 5.3: GitHub Actions

### Phase 4: Reliability & Monitoring (Week 2-3)

- **Day 13-14:** Epic 6 (Backup & Recovery)
  - Story 6.1: Database backup
  - Story 6.2: Volume backup
  - Story 6.3: Restore procedures

- **Day 15-16:** Epic 7 (Monitoring)
  - Story 7.1: Health checks
  - Story 7.2: Alerts
  - Story 7.3: Deployment testing

- **Day 16:** Epic 15 (Operational Excellence) - Part 1
  - Story 15.1: Backup verification script

### Phase 5: Post-Deployment Configuration (Week 3)

- **Day 17-18:** Epic 8 (Post-Deployment Config)
  - Story 8.1: Umami analytics setup

- **Day 19-20:** Epic 9 (Email Service)
  - Story 9.1: SMTP setup
  - Story 9.2: Feedback widget

- **Day 21:** Epic 10 (Performance & Optimization)
  - Story 10.1: Image optimization
  - Story 10.2: Resource limits
  - Story 10.3: Swap space

### Phase 6: Documentation & Security (Week 3-4)

- **Day 22-23:** Epic 11 (Documentation & Maintenance)
  - Story 11.1: Deployment docs
  - Story 11.2: Troubleshooting guide
  - Story 11.3: Operations runbook

- **Day 23:** Epic 15 (Operational Excellence) - Part 2
  - Story 15.2: File structure and commands
  - Story 15.3: Cost breakdown and resources

- **Day 24-25:** Epic 16 (Security Hardening)
  - Story 16.1: Docker security
  - Story 16.2: Auto updates
  - Story 16.3: Secret rotation

- **Day 25:** Epic 13 (Emergency Response)
  - Story 13.1: Data corruption recovery
  - Story 13.2: Security breach response

### Phase 7: Optimization & Launch (Week 4)

- **Day 26:** Epic 14 (Performance Optimization)
  - Story 14.1: Optimize Docker builds
  - Story 14.2: Database optimization
  - Story 14.3: Nginx caching

- **Day 27:** Final testing and pre-launch checks
  - Run all deployment tests
  - Verify all acceptance criteria
  - Test emergency procedures

- **Day 28:** Launch and post-launch monitoring
  - Go-live
  - Monitor all metrics
  - Verify Umami tracking
  - Confirm email delivery

**Total Estimated Time:** 4 weeks (with 1 developer)

**Note:** Phase 0 should be completed locally before starting Phase 1 on the server.

---

## Out of Scope

The following items are explicitly **not** included in this deployment:

1. **Content Creation:** Writing blog posts is out of scope
2. **Custom Domain Purchase:** User must purchase domain separately
3. **Email Hosting:** Using self-hosted email server
4. **CDN Integration:** Cloudflare or other CDN setup
5. **Database-Driven Features:** User accounts, comments, likes
6. **Payment Processing:** E-commerce or donation features
7. **Advanced Analytics:** Beyond Umami (e.g., heatmaps, A/B testing)
8. **Social Media Integration:** Auto-posting to Twitter/LinkedIn
9. **Search Functionality:** Full-text search across blog posts
10. **Multi-Server Deployment:** Load balancing, database replication
11. **Mobile App:** Native iOS/Android applications
12. **Advanced Caching:** Redis or Memcached integration
13. **Image Processing Pipeline:** Automated optimization/CDN upload
14. **Newsletter System:** Email list management (use third-party)
15. **Custom Monitoring:** Prometheus, Grafana, or similar
16. **Container Registry:** Private Docker registry
17. **Kubernetes:** K8s orchestration (overkill for single server)
18. **Database Migrations:** Complex schema changes (Umami is pre-packaged)
19. **Multi-Tenancy:** Hosting multiple blogs on same infrastructure
20. **Advanced Security:** WAF, DDoS protection beyond basic rate limiting

---

## Future Enhancements

Potential features for future iterations:

### Phase 2 Enhancements (Post-Launch)

1. **CDN Integration**
   - Cloudflare setup for static assets
   - Edge caching for improved performance
   - DDoS protection

2. **Advanced Monitoring**
   - Grafana dashboards
   - Prometheus metrics collection
   - Uptime monitoring (UptimeRobot)

3. **Newsletter System**
   - Email subscription widget
   - Integration with Mailchimp/ConvertKit
   - Automated new post notifications

4. **Search Functionality**
   - Client-side search with Fuse.js
   - Or server-side with MeiliSearch container

5. **Comments System**
   - Self-hosted (Isso, Commento)
   - Or third-party (Disqus, Giscus)

6. **RSS Feed**
   - Automated RSS generation
   - Podcast RSS support

### Phase 3 Enhancements (Future)

1. **Multi-Region Deployment**
   - Additional droplets in other regions
   - GeoDNS routing

2. **Advanced Caching**
   - Redis container for caching
   - Service worker for offline support

3. **Image Optimization Pipeline**
   - Automated image processing
   - WebP conversion
   - Lazy loading

4. **Advanced Security**
   - Web Application Firewall (WAF)
   - Security scanning (OWASP ZAP)
   - Penetration testing

5. **CI/CD Enhancements**
   - Staging environment
   - Blue-green deployments
   - Canary deployments

---

## Appendix

### A. Glossary

- **Adapter:** SvelteKit plugin that transforms app for deployment
- **Certbot:** Tool for obtaining Let's Encrypt SSL certificates
- **Docker Compose:** Tool for defining multi-container Docker applications
- **Droplet:** DigitalOcean's term for a VPS
- **Health Check:** Automated test to verify service is functioning
- **Let's Encrypt:** Free, automated certificate authority
- **MDsveX:** Markdown preprocessor for Svelte
- **Nginx:** Web server and reverse proxy
- **Reverse Proxy:** Server that forwards requests to other servers
- **SvelteKit:** Framework for building web applications
- **SSL/TLS:** Protocols for encrypted network communication
- **UFW:** Uncomplicated Firewall (Ubuntu firewall tool)
- **Umami:** Privacy-focused, open-source analytics platform
- **VPS:** Virtual Private Server

### B. Reference Links

**Official Documentation:**
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Docs](https://letsencrypt.org/docs/)
- [Umami Documentation](https://umami.is/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [DigitalOcean Docs](https://docs.digitalocean.com/)

**Guides & Tutorials:**
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Let's Encrypt Certbot Guide](https://certbot.eff.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### C. Contact & Support

**Product Owner:** [Your Name]
**Technical Lead:** [Your Name]
**Repository:** https://github.com/[username]/[blog-repo] (to be created)
**Support:** Create issue in GitHub repository

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-09 | Product Management | Initial PRD creation with 12 epics |
| 1.1 | 2025-10-09 | Product Management | Added 5 new epics (12-16) covering pre-deployment preparation, emergency response, performance optimization, operational excellence, and expanded security hardening. Updated timeline and success metrics. Total: 16 epics, 47 user stories |

---

**Approval:**

- [ ] Product Owner
- [ ] Technical Lead
- [ ] Stakeholder

**Status:** Ready for Implementation
