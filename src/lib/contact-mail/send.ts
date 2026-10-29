import "server-only";
import nodemailer from "nodemailer";
import type { ContactMessage } from "./schema";
import { buildContactEmail } from "./template";

/** No SMTP credentials or destination addresses are ever exposed to the browser or CMS. */
export function smtpReady(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM &&
    process.env.CONTACT_TO_EMAIL &&
    [465, 587].includes(Number(process.env.SMTP_PORT ?? 587)),
  );
}

export async function sendContactMail(data: ContactMessage): Promise<void> {
  if (!smtpReady()) throw new Error("SMTP_NOT_CONFIGURED");
  const port = Number(process.env.SMTP_PORT ?? 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 18000,
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  });

  const { html, text } = buildContactEmail(data);
  const sent = await transport.sendMail({
    from: { name: "Janczak i Synowie — Formularz kontaktowy", address: process.env.SMTP_FROM! },
    to: process.env.CONTACT_TO_EMAIL!,
    replyTo: { name: data.name, address: data.email },
    subject: `Nowe zapytanie — ${data.topic}`,
    text,
    html,
  });
  if (!sent.accepted?.length) throw new Error("SMTP_NOT_ACCEPTED");
}
