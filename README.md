# Pokémon Memory Card Game

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

A full-stack Pokémon TCG memory card game built with React, Express, and Prisma. The game features real Pokémon cards fetched from the Pokémon TCG API, user authentication via `better-auth`, and persistent game progression across sessions.

> **Live Demo:** [Insert Deployment Link Here]

## 📋 Features

- **Core Gameplay:** Classic memory matching game using high-quality images from the Pokémon TCG API.
- **Multiple Sets:** Choose from various authentic Pokémon Trading Card Game sets (e.g., Base Set, Jungle, Fossil).
- **Persistent Progression:** Player progress (completed levels, high scores) is saved to the database.
- **Authentication:** Secure sign-up, sign-in, email verification, and password reset flows using `better-auth`.
- **Audio & Settings:** Engaging sound effects and background music, with volume preferences saved per user.

## 🏗️ Architecture & Tech Stack

```mermaid
graph LR
    subgraph Client["React SPA (Vite)"]
        Router["React Router v7"]
        RQ["TanStack Query"]
        Auth["better-auth/react"]
    end

    subgraph Server["Express 5 API"]
        BA["better-auth (server)"]
        MW["Auth Middleware"]
        DB["Prisma Client"]
    end

    subgraph External["External Services"]
        PokemonAPI["Pokémon TCG API"]
        Postgres["PostgreSQL"]
        ResendAPI["Resend Email API"]
    end

    Client -->|"/api/auth/*"| BA
    Client -->|"/api/settings, /api/gamedata"| MW --> DB
    Client -->|"Direct fetch"| PokemonAPI
    DB --> Postgres
    BA --> Postgres
    BA --> ResendAPI
```

### Why these technologies?
- **React + Vite:** Fast development experience and optimized production builds.
- **TanStack Query:** Simplifies data fetching, caching, and state management for API data.
- **Express + Prisma:** A robust and type-safe backend for handling user data and authentication.
- **better-auth:** A modern, flexible authentication framework that provides built-in email/password, OTP, and session management.

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (e.g., Neon, Supabase, or local instance)
- Resend API key (for email verification and password resets)
- Pokémon TCG API key (optional, but recommended to avoid rate limits)

### 2. Clone the repository
```bash
git clone https://github.com/yourusername/react-memory-card.git
cd react-memory-card
```

### 3. Install dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env` file in the root directory based on the `.env.example` file (you will need to create one if it doesn't exist):

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (Prisma)
DATABASE_URL="postgresql://user:password@localhost:5432/memorycard?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/memorycard?schema=public"

# Auth & API Secrets
BETTER_AUTH_SECRET="your-super-secret-key"
RESEND_API_KEY="re_..."
VITE_POKEMONTCG_API_KEY="your-tcg-api-key"

# URLs
BETTER_AUTH_URL="http://localhost:3000"
CLIENT_URL_DEV="http://localhost:5173"
CLIENT_URL_PROD="https://your-production-url.com"
VITE_API_URL="http://localhost:3000"
```

### 5. Database Setup
Run the Prisma migrations to set up the database schema:
```bash
npx prisma migrate dev
```

### 6. Start the Development Servers
You will need two terminal windows.

**Terminal 1: Start the Express backend**
```bash
npm run server
```

**Terminal 2: Start the Vite frontend**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📚 Documentation

For more detailed information, please refer to the specific documentation files:
- **[API Documentation](./docs/api.md)** - Details on the backend REST API endpoints.
- **[Deployment Guide](./docs/deployment.md)** - Instructions for deploying the frontend and backend.

## 🛡️ Rate Limiting Approach

This project uses in-memory rate limiting for auth endpoints using `express-rate-limit`. That choice is intentional for a personal/portfolio app: fewer moving parts, easier setup, and clear security baseline.

Current approach:
- 100 requests per 15-minute window for auth routes.
- Structured 429 responses with retry metadata.

Production scaling path:
- Replace in-memory storage with a shared store (e.g., Redis) to support multiple server instances.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
