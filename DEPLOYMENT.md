# Mlinzi Deployment Guide

## Quick Start — Docker Compose (recommended for local dev)

```bash
# Clone and start everything
git clone <repo-url> && cd Mlinzi
cp server/.env.example server/.env  # fill in API keys
docker compose up
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5000
- Database: localhost:5432

---

## Production — Render (backend) + Vercel (frontend)

### Option A: Render Blueprint (one-click)

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Select your repo — Render reads `render.yaml` and creates everything
4. Fill in the secret env vars (ZEN_API_KEY, AFRICASTALKING_API_KEY, etc.)
5. After Vercel deploys, set `CLIENT_URL` on the Render service

### Option B: Manual Render setup

#### 1. Create PostgreSQL database
1. Render Dashboard → **New** → **PostgreSQL**
2. Plan: Free
3. Copy the Internal Database URL

#### 2. Deploy backend
1. Render Dashboard → **New** → **Web Service**
2. Connect GitHub repo
3. Settings:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

#### 3. Set environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | Render PostgreSQL connection string |
| `CLIENT_URL` | Yes | Frontend URL for CORS (set after Vercel deploy) |
| `JWT_SECRET` | Yes | Random 64-char hex string |
| `ZEN_API_KEY` | Yes | OpenCode Zen API key for AI analysis |
| `AFRICASTALKING_API_KEY` | Optional | SMS channel (sandbox or production) |
| `AFRICASTALKING_USERNAME` | Optional | `sandbox` or your AT username |
| `WHATSAPP_TOKEN` | Optional | Meta Business API token |
| `WHATSAPP_PHONE_NUMBER_ID` | Optional | WhatsApp business phone number |
| `BREVO_SMTP_KEY` | Optional | Brevo SMTP key for email OTP |
| `BREVO_SMTP_USER` | Optional | Brevo SMTP login |
| `SENDER_EMAIL` | Optional | From address for emails |
| `SENDER_NAME` | Optional | Sender display name |
| `RETENTION_DAYS` | Optional | Auto-delete after N days (default: 90) |
| `MAX_FILE_SIZE` | Optional | Max upload in bytes (default: 5MB) |

#### 4. Note your backend URL
Your API will be at: `https://mlinzi-api.onrender.com`

---

### Frontend — Vercel

1. Go to [Vercel Dashboard](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Settings:
   - **Framework:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://mlinzi-api.onrender.com/api
   ```
5. Deploy
6. Copy the Vercel URL → set as `CLIENT_URL` on Render

---

## Production — Docker on any VPS

```bash
# On your server
git clone <repo-url> && cd Mlinzi
cp server/.env.example server/.env  # edit with real values

# Build and start
docker compose -f docker-compose.prod.yml up -d
```

### Production Docker Compose

```yaml
# docker-compose.prod.yml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: mlinzi
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: ./server
    restart: unless-stopped
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy
    env_file: server/.env
    environment:
      DB_HOST: db
      NODE_ENV: production
    volumes:
      - uploads:/app/uploads

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./client/dist:/usr/share/nginx/html:ro
    depends_on:
      - api

volumes:
  pgdata:
  uploads:
```

---

## Environment Variables Reference

```bash
# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app

# Database (Render provides DATABASE_URL automatically)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mlinzi
DB_USER=postgres
DB_PASSWORD=your_password_here

# Authentication
JWT_SECRET=your_64_char_random_hex_string

# AI Analysis
ZEN_API_KEY=your_zen_api_key

# SMS (Africa's Talking)
AFRICASTALKING_API_KEY=your_key
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_SENDER_ID=Mlinzi

# WhatsApp (Meta Business API)
WHATSAPP_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=mlinzi_webhook_verify

# Email (Brevo)
BREVO_API_KEY=your_api_key
BREVO_SMTP_KEY=your_smtp_key
BREVO_SMTP_USER=your_login@smtp-brevo.com
SENDER_EMAIL=noreply@yourdomain.com
SENDER_NAME=Mlinzi

# Data Retention
RETENTION_DAYS=90
MAX_FILE_SIZE=5242880
```

---

## Local Development

```bash
# Option 1: Docker Compose (recommended)
docker compose up

# Option 2: Manual
# Terminal 1 — Backend
cd server
cp .env.example .env  # fill in your values
npm install
npm run dev

# Terminal 2 — Frontend
cd client
npm install
npm run dev

# Terminal 3 — Tests
cd server
npm test
```

Frontend: http://localhost:5173
Backend: http://localhost:5000
