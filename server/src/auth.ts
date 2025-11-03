import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prismaClient.ts";
import { IncomingHttpHeaders } from "http";

// Generate a random 4-digit tag for user identification
function generateTag() {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    fields: {
      name: "username",
    },
    additionalFields: {
      tag: {
        type: "string",
        required: true,
        defaultValue: "0001",
        input: false, // don't allow user to set role
      },
      username: {
        type: "string",
        required: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 12,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Only run on sign-up
      if (ctx.path === "/sign-up/email") {
        const password = ctx.body?.password;
        if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
          throw new Error(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
          );
        }
        // Validate username length
        const username = ctx.body?.name;
        if (username.length < 3 || username.length > 20) {
          throw new Error("Username must be between 3 and 20 characters");
        }

        // Get count of users with this username
        const count = await prisma.user.count({
          where: { username },
        });

        // Assign next sequential tag
        ctx.body.tag = String(count + 1).padStart(4, "0");

        return ctx;
      }
    }),
  },
});

export async function getCurrentSession(reqHeaders: IncomingHttpHeaders) {
  const headers = new Headers();
  Object.entries(reqHeaders).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value[0] : value);
    }
  });

  return await auth.api.getSession({
    headers: headers,
  });
}
