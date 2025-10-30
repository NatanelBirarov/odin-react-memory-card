import express from "express";
import { ZodError } from "zod";
import { AnyZodObject } from "zod/v3";
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
