import express from "express";
import { rateLimit } from "express-rate-limit";
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
import { gameDataSchema, settingsSchema } from "./src/schemas.js";

import { AuthRequest } from "./src/types.js";

const allowedOrigins = [
  process.env.CLIENT_URL_PROD, // Production frontend URL
  process.env.CLIENT_URL_DEV, // Development frontend URL
].filter(Boolean); // Filter out any undefined values

const app = express();
const port = process.env.PORT ?? "3000";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal server error";
}

if (process.env.NODE_ENV === "production") {
  // If behind one reverse proxy (Nginx,Render,etc.)
  app.set("trust proxy", 1);
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
  statusCode: 429, // HTTP status code for "Too Many Requests"
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      // if (!origin) return callback(null, true);

      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
);

app.use("/api/auth/*splat", limiter); // Apply rate limiting to auth routes
// Auth Routes
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());

// Settings Routes
app.get("/api/settings/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      throw new Error("User ID is required");
    }
    res.json(await DatabaseService.getOrCreateSettings(req.userId));
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
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
      res.json(
        await DatabaseService.updateSettings(
          req.userId,
          musicVolume,
          sfxVolume,
        ),
      );
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  },
);

// // Game Data Routes
app.get("/api/gamedata/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      throw new Error("User ID is required");
    }
    const data = await DatabaseService.getAllGameData(req.userId);
    res.json(data);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
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
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  },
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
