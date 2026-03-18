import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: `${
    import.meta.env.VITE_ENV === "production"
      ? import.meta.env.VITE_API_URL_PROD
      : import.meta.env.VITE_API_URL_DEV
  }/auth`,
  plugins: [
    inferAdditionalFields({
      user: {
        tag: {
          type: "string",
          required: true,
          defaultValue: "0001",
          input: false, // don't allow user to set role
        },
      },
    }),
    emailOTPClient(),
  ],
});
