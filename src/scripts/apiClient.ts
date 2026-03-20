// src/scripts/apiClient.ts (client-side)
import { authClient } from "./authClient";
import type { ISignInWithPasswordFormData, SetDataType } from "./types";

import { ISignInFormData, ISignUpFormData } from "./validationSchemas";

type SettingsResponse = {
  musicVolume: number;
  sfxVolume: number;
};

// Centralizes typed JSON parsing so each endpoint can declare its expected response shape.
function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

// Resolve API base URL from environment once and reuse for all requests.
const API_BASE =
  import.meta.env.VITE_ENV === "production"
    ? (import.meta.env.VITE_API_URL_PROD as string)
    : (import.meta.env.VITE_API_URL_DEV as string);

const ApiClient = {
  async signUp(formData: ISignUpFormData) {
    // The image field can come from different form adapters; normalize before reading file name.
    const imageFiles = formData.image as FileList | File[] | undefined;
    const imageName = imageFiles?.[0]?.name || "";

    return await authClient.signUp.email({
      name: formData.username,
      email: formData.email,
      password: formData.password,
      image: imageName,
      callbackURL: `${
        import.meta.env.VITE_ENV === "production"
          ? import.meta.env.VITE_CLIENT_URL
          : import.meta.env.VITE_CLIENT_URL_DEV
      }verify`,
    });
  },

  async signInWithOTP(formData: ISignInFormData) {
    return await authClient.emailOtp.sendVerificationOtp({
      email: formData.email, // required
      type: "sign-in",
    });
  },

  async verifyOTP(formData: { email: string; otp: string }) {
    return authClient.signIn.emailOtp({
      email: formData.email, // required
      otp: formData.otp, // required
    });
  },

  async signInWithPassword(formData: ISignInWithPasswordFormData) {
    return await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
      rememberMe: true,
      // callbackURL: "https://example.com/callback",
    });
  },

  async getSettings(): Promise<SettingsResponse> {
    const response = await fetch(`${API_BASE}/api/settings/`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch settings");
    // Parse and type the payload at the boundary.
    return parseJson<SettingsResponse>(response);
  },

  async updateSettings(
    musicVolume: number,
    sfxVolume: number,
  ): Promise<SettingsResponse> {
    const response = await fetch(`${API_BASE}/api/settings/`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ musicVolume, sfxVolume }),
    });
    if (!response.ok) throw new Error("Failed to update settings");
    return parseJson<SettingsResponse>(response);
  },

  async getGameData(): Promise<SetDataType[]> {
    const response = await fetch(`${API_BASE}/api/gamedata/`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch game data");
    return parseJson<SetDataType[]>(response);
  },

  async saveGameData(gameData: SetDataType): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/api/gamedata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...gameData }),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to save game data");
    return parseJson<{ success: boolean }>(response);
  },
};

export default ApiClient;
