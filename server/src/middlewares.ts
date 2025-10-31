import express from "express";
import z from "zod";
import AuthService from "./authService";
import { AuthRequest } from "./types";

// Data Validation Middleware

// Auth Middleware
export const authMiddleware = async (
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded || typeof decoded === "string") {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  req.userId = decoded.userId as string;
  next();
};

export const validationMiddleware =
  (schema: z.ZodType) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid input",
          details: z.treeifyError(error),
        });
      }
      next(error);
    }
  };
