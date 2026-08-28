import { describe, it, expect, vi, beforeEach } from "vitest";
import type express from "express";
import type { AuthRequest } from "../types";

vi.mock("../auth.js", () => ({
  getCurrentSession: vi.fn(),
  auth: {},
}));

import { getCurrentSession } from "../auth.js";
import {
  authMiddleware,
  validateSettingsMiddleware,
  validateGameDataMiddleware,
} from "../middlewares";

describe("Server Middlewares", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<express.Response>;
  let next: express.NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      headers: {},
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe("authMiddleware", () => {
    it("calls next() and sets userId when valid session exists", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        session: { id: "s1" } as any,
        user: { id: "u123", email: "test@example.com" } as any,
      });

      await authMiddleware(req as AuthRequest, res as express.Response, next);

      expect(req.userId).toBe("u123");
      expect(req.session).toEqual({ id: "s1" });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("returns 401 Unauthorized when session is null", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);

      await authMiddleware(req as AuthRequest, res as express.Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 Authentication failed when getCurrentSession throws", async () => {
      vi.mocked(getCurrentSession).mockRejectedValue(new Error("DB error"));

      await authMiddleware(req as AuthRequest, res as express.Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Authentication failed" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("validateSettingsMiddleware", () => {
    it("calls next() for valid settings body", () => {
      req.body = { musicVolume: 0.8, sfxVolume: 0.2 };

      validateSettingsMiddleware(
        req as AuthRequest,
        res as express.Response,
        next,
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("returns 400 when settings validation fails", () => {
      req.body = { musicVolume: 2.0, sfxVolume: -0.5 };

      validateSettingsMiddleware(
        req as AuthRequest,
        res as express.Response,
        next,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.anything() }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("validateGameDataMiddleware", () => {
    it("calls next() for valid game data body", () => {
      req.body = {
        setId: "base1",
        completedLevels: 2,
        levels: 5,
        highScore: 50,
        completed: false,
      };

      validateGameDataMiddleware(
        req as AuthRequest,
        res as express.Response,
        next,
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("returns 400 when game data validation fails", () => {
      req.body = {
        setId: "",
        completedLevels: -1,
      };

      validateGameDataMiddleware(
        req as AuthRequest,
        res as express.Response,
        next,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.anything() }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
