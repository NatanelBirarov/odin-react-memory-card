import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  await resend.emails.send({
    from:
      process.env.NODE_ENV === "production"
        ? "no-reply@pokemonmem.netlify.app"
        : "onboarding@resend.dev",
    to,
    subject,
    html: html || `<p>${text}</p>`,
  });
}
