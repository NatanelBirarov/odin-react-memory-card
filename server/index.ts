// server/index.js
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./src/auth.js";
import cors from "cors";
import DatabaseService from "./src/databaseService.js";
import cookieParser from "cookie-parser";
import {
  authMiddleware,
  validateGameDataMiddleware,
  validateSettingsMiddleware,
} from "./src/middlewares.js";

import { AuthRequest } from "./src/types.js";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174", // Backup local port
  process.env.CLIENT_URL, // Production frontend URL
].filter(Boolean); // Filter out any undefined values

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

// Auth Routes
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());

// // Settings Routes
app.get("/api/settings/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      throw new Error("User ID is required");
    }
    const settings = await DatabaseService.getOrCreateSettings(req.userId);
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put(
  "/api/settings/",
  authMiddleware,
  validateSettingsMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        throw new Error("User ID is required");
      }
      const { musicVolume, sfxVolume } = req.body;
      const settings = await DatabaseService.updateSettings(
        req.userId,
        musicVolume,
        sfxVolume
      );
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// // Game Data Routes
app.get("/api/gamedata/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      throw new Error("User ID is required");
    }
    const data = await DatabaseService.getAllGameData(req.userId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post(
  "/api/gamedata",
  authMiddleware,
  validateGameDataMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        throw new Error("User ID is required");
      }
      const { setId, completedLevels, levels, highScore, completed } = req.body;
      await DatabaseService.upsertLevelData(req.userId, {
        id: setId,
        completedLevels,
        levels,
        highScore,
        completed,
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.listen(process.env.PORT, () => console.log("Server running on port 3001"));
