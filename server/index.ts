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

import { AuthRequest } from "./src/types.js";

const port = process.env.PORT ?? "3000";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal server error";
}

/**
 * Creates and configures the Express application.
 * Sets up CORS, rate limiting, authentication routes via better-auth, and API endpoints.
 * @returns The configured Express application instance.
 */
export function createApp() {
  const allowedOrigins = [
    process.env.CLIENT_URL_PROD, // Production frontend URL
    process.env.CLIENT_URL_DEV, // Development frontend URL
  ].filter(Boolean); // Filter out any undefined values

  const app = express();

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
        console.log("ORIGIN:", origin, allowedOrigins);
        if (!origin) {
          callback(null, true);
          return;
        }

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
        const { musicVolume, sfxVolume } = req.body as {
          musicVolume: number;
          sfxVolume: number;
        };
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
        const { setId, completedLevels, levels, highScore, completed } =
          req.body as {
            setId: string;
            completedLevels: number;
            levels: number;
            highScore: number;
            completed: boolean;
          };
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

  return app;
}

// Only start listening when not in test mode
if (process.env.NODE_ENV !== "test") {
  const app = createApp();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

