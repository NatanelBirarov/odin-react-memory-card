import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock DatabaseService
vi.mock("../databaseService.js", () => ({
  default: {
    getOrCreateSettings: vi.fn(),
    updateSettings: vi.fn(),
    getAllGameData: vi.fn(),
    upsertLevelData: vi.fn(),
  },
}));

// Mock auth
vi.mock("../auth.js", () => ({
  getCurrentSession: vi.fn(),
  auth: {},
}));

// Mock better-auth/node toNodeHandler
vi.mock("better-auth/node", () => ({
  toNodeHandler: () => (_req: any, res: any, next: any) => next ? next() : res.end(),
}));

import { createApp } from "../../index";
import DatabaseService from "../databaseService.js";
import { getCurrentSession } from "../auth.js";

describe("Server REST Routes", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  describe("GET /api/settings/", () => {
    it("returns settings for authenticated user", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        session: { id: "s1" } as any,
        user: { id: "user-123" } as any,
      });
      vi.mocked(DatabaseService.getOrCreateSettings).mockResolvedValue({
        id: "setting-1",
        userId: "user-123",
        musicVolume: 0.7,
        sfxVolume: 0.4,
      } as any);

      const response = await request(app).get("/api/settings/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: "setting-1",
        userId: "user-123",
        musicVolume: 0.7,
        sfxVolume: 0.4,
      });
      expect(DatabaseService.getOrCreateSettings).toHaveBeenCalledWith("user-123");
    });

    it("returns 401 when not authenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);

      const response = await request(app).get("/api/settings/");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Unauthorized" });
    });
  });

  describe("PUT /api/settings/", () => {
    it("updates settings when body is valid", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        session: { id: "s1" } as any,
        user: { id: "user-123" } as any,
      });
      vi.mocked(DatabaseService.updateSettings).mockResolvedValue({
        id: "setting-1",
        userId: "user-123",
        musicVolume: 0.9,
        sfxVolume: 0.1,
      } as any);

      const response = await request(app)
        .put("/api/settings/")
        .send({ musicVolume: 0.9, sfxVolume: 0.1 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: "setting-1",
        userId: "user-123",
        musicVolume: 0.9,
        sfxVolume: 0.1,
      });
      expect(DatabaseService.updateSettings).toHaveBeenCalledWith(
        "user-123",
        0.9,
        0.1,
      );
    });

    it("returns 400 when volume is invalid", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        session: { id: "s1" } as any,
        user: { id: "user-123" } as any,
      });

      const response = await request(app)
        .put("/api/settings/")
        .send({ musicVolume: 1.5, sfxVolume: 0.1 });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/gamedata/", () => {
    it("returns game data for authenticated user", async () => {
      const mockData = [
        {
          id: "base1",
          completedLevels: 2,
          levels: 5,
          highScore: 20,
          completed: false,
        },
      ];
      vi.mocked(getCurrentSession).mockResolvedValue({
        session: { id: "s1" } as any,
        user: { id: "user-123" } as any,
      });
      vi.mocked(DatabaseService.getAllGameData).mockResolvedValue(mockData);

      const response = await request(app).get("/api/gamedata/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(DatabaseService.getAllGameData).toHaveBeenCalledWith("user-123");
    });
  });

  describe("POST /api/gamedata", () => {
    it("saves game data when body is valid", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        session: { id: "s1" } as any,
        user: { id: "user-123" } as any,
      });
      vi.mocked(DatabaseService.upsertLevelData).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/gamedata")
        .send({
          setId: "base1",
          completedLevels: 3,
          levels: 5,
          highScore: 30,
          completed: false,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(DatabaseService.upsertLevelData).toHaveBeenCalledWith("user-123", {
        id: "base1",
        completedLevels: 3,
        levels: 5,
        highScore: 30,
        completed: false,
      });
    });

    it("returns 500 when database throws", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        session: { id: "s1" } as any,
        user: { id: "user-123" } as any,
      });
      vi.mocked(DatabaseService.upsertLevelData).mockRejectedValue(
        new Error("Database connection lost"),
      );

      const response = await request(app)
        .post("/api/gamedata")
        .send({
          setId: "base1",
          completedLevels: 3,
          levels: 5,
          highScore: 30,
          completed: false,
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database connection lost" });
    });
  });
});
