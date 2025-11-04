import { betterAuth, HookEndpointContext } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prismaClient.js";
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
    before: createAuthMiddleware(async (ctx: HookEndpointContext) => {
      // // Only run on sign-up
      if (ctx.path === "/sign-up/email") {
        //   // Get count of users with this username
        const username = ctx.body?.name;
        const count = await prisma.user.count({
          where: { username },
        });
        // // Assign next sequential tag
        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              tag: String(count + 1).padStart(4, "0"),
            },
          },
        };
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
