import express from "express";
import { AuthRequest } from "./types.js";
import { getCurrentSession } from "./auth.js";
import { gameDataSchema, settingsSchema } from "./schemas.js";

// Data Validation Middleware

// Auth Middleware
export const authMiddleware = async (
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction,
): Promise<void> => {
  try {
    const session = await getCurrentSession(req.headers);
    if (process.env.NODE_ENV === "development") {
      console.log("Auth middleware session user:", session?.user.id);
    }
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    req.session = session.session;
    req.userId = session.user.id;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Settings Validation Middleware
export const validateSettingsMiddleware = (
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction,
): void => {
  const validation = settingsSchema.safeParse(req.body as unknown);

  if (!validation.success) {
    res.status(400).json({ error: validation.error });
    return;
  }

  next();
};

/** Generate middleware for validating game data */
export const validateGameDataMiddleware = (
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction,
): void => {
  const validation = gameDataSchema.safeParse(req.body as unknown);

  if (!validation.success) {
    res.status(400).json({ error: validation.error });
    return;
  }

  next();
};
