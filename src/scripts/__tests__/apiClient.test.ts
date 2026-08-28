import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock authClient before importing ApiClient.
vi.mock("../authClient", () => ({
  authClient: {
    signUp: {
      email: vi.fn().mockResolvedValue({ data: { user: { id: "1" } } }),
    },
    emailOtp: {
      sendVerificationOtp: vi.fn().mockResolvedValue({ data: {} }),
    },
    signIn: {
      emailOtp: vi.fn().mockResolvedValue({ data: { session: {} } }),
      email: vi.fn().mockResolvedValue({ data: { session: {} } }),
    },
  },
}));

// Provide the env variable that ApiClient reads at module init.
vi.stubEnv("VITE_ENV", "development");
vi.stubEnv("VITE_API_URL_DEV", "http://localhost:3000/api");

import ApiClient from "../apiClient";
import { authClient } from "../authClient";

beforeEach(() => {
  vi.restoreAllMocks();
  // Re-stub after restoreAllMocks clears stubs.
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    }),
  );
});

describe("ApiClient", () => {
  describe("getSettings", () => {
    it("calls correct URL with credentials", async () => {
      const mockResponse = {
        ok: true,
        json: vi
          .fn()
          .mockResolvedValue({ musicVolume: 0.5, sfxVolume: 0.5 }),
      };
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

      const result = await ApiClient.getSettings();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/settings/"),
        expect.objectContaining({ credentials: "include" }),
      );
      expect(result).toEqual({ musicVolume: 0.5, sfxVolume: 0.5 });
    });

    it("throws on non-ok response", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500 }),
      );

      await expect(ApiClient.getSettings()).rejects.toThrow(
        "Failed to fetch settings",
      );
    });
  });

  describe("updateSettings", () => {
    it("sends PUT with correct body", async () => {
      const mockResponse = {
        ok: true,
        json: vi
          .fn()
          .mockResolvedValue({ musicVolume: 0.8, sfxVolume: 0.3 }),
      };
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

      const result = await ApiClient.updateSettings(0.8, 0.3);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/settings/"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ musicVolume: 0.8, sfxVolume: 0.3 }),
        }),
      );
      expect(result).toEqual({ musicVolume: 0.8, sfxVolume: 0.3 });
    });

    it("throws on non-ok response", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 400 }),
      );

      await expect(ApiClient.updateSettings(0.5, 0.5)).rejects.toThrow(
        "Failed to update settings",
      );
    });
  });

  describe("getGameData", () => {
    it("calls correct URL and returns parsed array", async () => {
      const gameData = [
        {
          id: "base1",
          completedLevels: 3,
          levels: 5,
          highScore: 10,
          completed: false,
        },
      ];
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(gameData),
      };
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

      const result = await ApiClient.getGameData();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/gamedata/"),
        expect.objectContaining({ credentials: "include" }),
      );
      expect(result).toEqual(gameData);
    });

    it("throws on non-ok response", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 401 }),
      );

      await expect(ApiClient.getGameData()).rejects.toThrow(
        "Failed to fetch game data",
      );
    });
  });

  describe("saveGameData", () => {
    it("sends POST with game data and returns success", async () => {
      const gameData = {
        id: "base1",
        completedLevels: 3,
        levels: 5,
        highScore: 10,
        completed: false,
      };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      };
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

      const result = await ApiClient.saveGameData(gameData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/gamedata"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        }),
      );
      expect(result).toEqual({ success: true });
    });

    it("throws on non-ok response", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500 }),
      );

      await expect(
        ApiClient.saveGameData({
          id: "x",
          completedLevels: 0,
          levels: 1,
          highScore: 0,
          completed: false,
        }),
      ).rejects.toThrow("Failed to save game data");
    });
  });

  describe("signInWithOTP", () => {
    it("calls authClient.emailOtp.sendVerificationOtp with correct args", async () => {
      await ApiClient.signInWithOTP({ email: "user@test.com" });

      expect(authClient.emailOtp.sendVerificationOtp).toHaveBeenCalledWith({
        email: "user@test.com",
        type: "sign-in",
      });
    });
  });

  describe("verifyOTP", () => {
    it("calls authClient.signIn.emailOtp with correct args", async () => {
      await ApiClient.verifyOTP({ email: "user@test.com", otp: "123456" });

      expect(authClient.signIn.emailOtp).toHaveBeenCalledWith({
        email: "user@test.com",
        otp: "123456",
      });
    });
  });

  describe("signInWithPassword", () => {
    it("calls authClient.signIn.email with correct args", async () => {
      await ApiClient.signInWithPassword({
        email: "user@test.com",
        password: "Pass1@",
      });

      expect(authClient.signIn.email).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "Pass1@",
        rememberMe: true,
      });
    });
  });
});
