// src/scripts/apiClient.ts (client-side)
import type { SetDataType } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export default class ApiClient {
  static async getSettings(userId: string) {
    const response = await fetch(`${API_BASE}/settings/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch settings");
    return response.json();
  }

  static async updateSettings(
    userId: string,
    musicVolume: number,
    sfxVolume: number
  ) {
    const response = await fetch(`${API_BASE}/settings/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ musicVolume, sfxVolume }),
    });
    if (!response.ok) throw new Error("Failed to update settings");
    return response.json();
  }

  static async getAllGameData(userId: string): Promise<SetDataType[]> {
    const response = await fetch(`${API_BASE}/gamedata/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch game data");
    return response.json();
  }

  static async saveGameData(userId: string, gameData: SetDataType) {
    const response = await fetch(`${API_BASE}/gamedata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...gameData }),
    });
    if (!response.ok) throw new Error("Failed to save game data");
    return response.json();
  }

  static async register(email: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Registration failed");
    return response.json();
  }

  static async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Login failed");
    return response.json();
  }

  static async createUsername(userId: string, username: string) {
    const response = await fetch(`${API_BASE}/auth/username`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, username }),
    });
    if (!response.ok) throw new Error("Failed to create username");
    return response.json();
  }
}
