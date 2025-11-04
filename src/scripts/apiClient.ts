// src/scripts/apiClient.ts (client-side)
import { authClient } from "./authClient";
import type { ISignInFormData, ISignUpFormData, SetDataType } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export default class ApiClient {
  static async signUp(
    formData: ISignUpFormData,
    callbacks: {
      onSuccess?: () => void;
      onError?: (error: any) => void;
      isPending?: (pending: boolean) => void;
    }
  ) {
    return await authClient.signUp.email(
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        image: formData.image || "",
        // callbackURL: `${
        //   import.meta.env.VITE_CLIENT_URL || "http://localhost:5173"
        // }/titlescreen`,
      },
      {
        onSuccess: (data) => {
          callbacks.onSuccess?.();
        },
        onError: (error) => {
          callbacks.onError?.(error);
        },
        onRequest: () => {
          callbacks.isPending?.(true);
        },
        onResponse: () => {
          callbacks.isPending?.(false);
        },
      }
    );
  }

  static async signIn(
    formData: ISignInFormData,
    callbacks: {
      onSuccess?: () => void;
      onError?: (error: any) => void;
      isPending?: (pending: boolean) => void;
    }
  ) {
    return await authClient.signIn.email(
      {
        email: formData.email,
        password: formData.password,
        rememberMe: true,
        // callbackURL: "https://example.com/callback",
      },
      {
        onSuccess: (data) => {
          callbacks.onSuccess?.();
        },
        onError: (error) => {
          callbacks.onError?.(error);
        },
        onRequest: () => {
          callbacks.isPending?.(true);
        },
        onResponse: () => {
          callbacks.isPending?.(false);
        },
      }
    );
  }

  static async getSettings() {
    const response = await fetch(`${API_BASE}/api/settings/`);
    if (!response.ok) throw new Error("Failed to fetch settings");
    return response.json();
  }

  static async updateSettings(musicVolume: number, sfxVolume: number) {
    const response = await fetch(`${API_BASE}/api/settings/`, {
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
}
