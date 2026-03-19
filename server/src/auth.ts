import { betterAuth, HookEndpointContext } from "better-auth";
import { fromNodeHeaders } from "better-auth/node";
import { emailOTP } from "better-auth/plugins";
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
    changeEmail: {
      enabled: true,
    },
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
  plugins: [
    emailOTP({
      expiresIn: 10 * 60, // 10 minutes
      disableSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          // Send the OTP for sign in
          await sendEmail({
            to: email,
            subject: "Your sign-in OTP",
            text: `Your one-time password (OTP) for sign-in is: ${otp}. It will expire in 10 minutes.`,
          });
        } else if (type === "email-verification") {
          // Send the OTP for email verification
          await sendEmail({
            to: email,
            subject: "Your email verification OTP",
            text: `Your one-time password (OTP) for email verification is: ${otp}. It will expire in 10 minutes.`,
          });
        } else {
          // Send the OTP for password reset
          await sendEmail({
            to: email,
            subject: "Your password reset OTP",
            text: `Your one-time password (OTP) for password reset is: ${otp}. It will expire in 10 minutes.`,
          });
        }
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 12, // 12 hours
    disableSessionRefresh: true,
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
    sendVerificationEmail: async ({ user, url, token }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Sending verification email to:", user.email);
      }
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
      if (process.env.NODE_ENV === "development") {
        console.log(`${user.email} has verified their email.`);
      }
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
      return { context: ctx };
    }),
  },
  trustedOrigins: [
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL_PROD || "http://localhost:5173"
      : process.env.CLIENT_URL_DEV || "http://localhost:5173", // Example for local development
  ],
});

export async function getCurrentSession(reqHeaders: IncomingHttpHeaders) {
  // const headers = new Headers();
  // Object.entries(reqHeaders).forEach(([key, value]) => {
  //   if (value) {
  //     headers.set(key, Array.isArray(value) ? value[0] : value);
  //   }
  // });
  const headers = fromNodeHeaders(reqHeaders);

  return await auth.api.getSession({
    headers: headers,
  });
}
