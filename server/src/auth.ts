import { betterAuth, HookEndpointContext } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prismaClient.js";
import { IncomingHttpHeaders } from "http";
import { sendEmail } from "./emailService.js";

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
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Pokemon Memory Game!</h2>
          <p>Hi ${user.name || "there"},</p>
          <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
          <a href="${url}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${url}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't sign up for this account, you can safely ignore this email.</p>
        </div>
      `,
      });
    },
    afterEmailVerification: async (user, request) => {
      // Additional actions after email verification can be added here
      console.log(`${user.email} has verified their email.`);
    },
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
      if (ctx.path === "/verify-email") {
        const token = ctx.query?.token as string;
        const parts = token.split(".");
        if (parts.length === 3) {
          // Decode the payload (second part)
          const payload = JSON.parse(
            Buffer.from(
              parts[1].replace(/-/g, "+").replace(/_/g, "/"),
              "base64"
            ).toString()
          );

          console.log("Decoded token payload:", payload);
          const email = payload.email;
          const user = await prisma.user.findUnique({
            where: { email },
          });
          if (user?.emailVerified) {
            const callbackURL = ctx.query?.callbackURL as string;
            console.log("Email alrerady verified, " + callbackURL);
            return {
              context: {
                ...ctx,
                query: {
                  ...ctx.query,
                  callbackURL: callbackURL + "?token-invalid=true",
                },
              },
            };
          }
        }
      }
      return { context: ctx };
    }),
  },
  trustedOrigins: [
    "http://localhost:5173", // Example for local development
    process.env.CLIENT_URL || "", // Example for production
  ],
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
