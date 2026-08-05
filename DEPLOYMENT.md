# Mlinzi Deployment Guide

## Backend — Render

### 1. Create a PostgreSQL database on Render
1. Go to Render Dashboard → New → PostgreSQL
2. Note the internal database URL (format: `postgres://user:pass@host:5432/dbname`)

### 2. Deploy the backend
1. Render Dashboard → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<your Render PostgreSQL URL>
   GEMINI_API_KEY=<your Google Gemini API key>
   CLIENT_URL=https://your-app.vercel.app
   ```
5. Deploy

### 3. Note your backend URL
Once deployed, your backend will be at:
`https://mlinzi-api.onrender.com`

---

## Frontend — Vercel

### 1. Deploy the frontend
1. Go to Vercel Dashboard → New Project
2. Import your GitHub repo
3. Settings:
   - **Framework:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://mlinzi-api.onrender.com/api
   ```
5. Deploy

### 2. Update backend CORS
After Vercel deploys, update your Render env var:
```
CLIENT_URL=https://your-app.vercel.app
```

---

## Local Development

```bash
# Terminal 1 — Backend
cd server
cp .env.example .env  # fill in your values
npm install
npm run dev

# Terminal 2 — Frontend
cd client
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000
