// src/scripts/apiClient.ts (client-side)
import { authClient } from "./authClient";
import type { ISignInWithPasswordFormData, SetDataType } from "./types";

import { ISignInFormData, ISignUpFormData } from "./validationSchemas";

const API_BASE =
  import.meta.env.VITE_ENV === "production"
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL_DEV;

export default class ApiClient {
  static async signUp(formData: ISignUpFormData) {
    return await authClient.signUp.email({
      name: formData.username,
      email: formData.email,
      password: formData.password,
      image: formData.image[0]?.name || "",
      callbackURL: `${
        import.meta.env.VITE_ENV === "production"
          ? import.meta.env.VITE_CLIENT_URL
          : import.meta.env.VITE_CLIENT_URL_DEV
      }verify`,
    });
  }

  static async signInWithOTP(formData: ISignInFormData) {
    return await authClient.emailOtp.sendVerificationOtp({
      email: formData.email, // required
      type: "sign-in",
    });
  }

  static async verifyOTP(formData: { email: string; otp: string }) {
    return authClient.signIn.emailOtp({
      email: formData.email, // required
      otp: formData.otp, // required
    });
  }

  static async signInWithPassword(
    formData: ISignInWithPasswordFormData,
    callbacks: {
      onSuccess?: () => void;
      onError?: (error: any) => void;
      isPending?: (pending: boolean) => void;
    },
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
      },
    );
  }

  static async getSettings() {
    const response = await fetch(`${API_BASE}/settings/`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch settings");
    return response.json();
  }

  static async updateSettings(musicVolume: number, sfxVolume: number) {
    const response = await fetch(`${API_BASE}/settings/`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ musicVolume, sfxVolume }),
    });
    if (!response.ok) throw new Error("Failed to update settings");
    return response.json();
  }

  static async getAllGameData(userId: string): Promise<SetDataType[]> {
    const response = await fetch(`${API_BASE}/gamedata/`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch game data");
    return response.json();
  }

  static async saveGameData(userId: string, gameData: SetDataType) {
    const response = await fetch(`${API_BASE}/gamedata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...gameData }),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to save game data");
    return response.json();
  }
}
