# Deployment Guide

This guide outlines how to deploy the Pokémon Memory Card application. The architecture is split into a frontend (React/Vite) and a backend (Express), which can be deployed to separate hosting providers.

We recommend **Render** for the backend (Node.js) and **Netlify** or **Vercel** for the frontend (Static site).

## Prerequisites
- A PostgreSQL database (e.g., Neon, Supabase).
- A Resend API key.
- A GitHub repository containing the project.

---

## 1. Deploying the Backend (Render)

Render is great for hosting Node.js Express applications.

### Steps
1. Log in to [Render](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Environment:** Node
   - **Build Command:** `npm install && npx prisma generate && npx tsc -p tsconfig.server.json` (Ensure you have a build step for the server if you compile TS, or use `ts-node` directly for simpler setups. Based on current setup, ensure your start script handles TS compilation or runtime). 
   - **Start Command:** `npm run start` or `npm run server` (Make sure your `package.json` has the correct production start command).
4. Add the following **Environment Variables**:
   - `PORT`: (Render sets this automatically, but you can leave your default)
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `DIRECT_URL`: Your PostgreSQL direct connection string (if using Prisma Accelerate/PgBouncer).
   - `BETTER_AUTH_SECRET`: A secure random string for signing cookies.
   - `BETTER_AUTH_URL`: The URL of your Render web service (e.g., `https://my-memory-backend.onrender.com`).
   - `RESEND_API_KEY`: Your Resend API key.
   - `CLIENT_URL_PROD`: The URL of your frontend (e.g., `https://my-memory-game.netlify.app`). This is critical for CORS.

### Database Migrations on Render
To run Prisma migrations automatically on deployment, you can set the **Build Command** to:
`npm install && npx prisma generate && npx prisma migrate deploy`

---

## 2. Deploying the Frontend (Netlify / Vercel)

The frontend is a static React Single Page Application (SPA) built with Vite.

### Steps
1. Log in to [Netlify](https://netlify.com) or [Vercel](https://vercel.com) and create a new site from your GitHub repository.
2. Configure the build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Publish directory:** `dist`
3. Add the following **Environment Variables**:
   - `VITE_API_URL`: The URL of your backend on Render (e.g., `https://my-memory-backend.onrender.com`).
   - `VITE_POKEMONTCG_API_KEY`: (Optional) Your Pokémon TCG API Key.
4. Deploy the site.

### Handling Client-Side Routing
Since this is a React Router SPA, you need to ensure all routes fallback to `index.html`.

**For Netlify:**
Create a `public/_redirects` file with the following content:
```
/* /index.html 200
```
This tells Netlify to redirect all requests to your `index.html`.

**For Vercel:**
Create a `vercel.json` file in the root directory:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 3. Final Verification

1. Go to your frontend URL.
2. Open the browser console and network tab.
3. Try to sign up or sign in.
4. Ensure the API calls to `https://my-memory-backend.onrender.com/api/auth/...` succeed (Status 200).
5. If you get a CORS error, verify that `CLIENT_URL_PROD` in your Render backend exactly matches your frontend URL (no trailing slash).
