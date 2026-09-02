import "server-only";
import { Resend } from "resend";
import { requireEnv } from "@/lib/env";

// Un cliente por proceso: `new Resend()` por llamada rehace la config cada vez.
let client: Resend | null = null;

function resend(): Resend {
  client ??= new Resend(requireEnv("API_KEY_RESEND"));
  return client;
}

const FROM = process.env.RESEND_FROM ?? "Center Quest <no-reply@cquest.do>";

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
}): Promise<void> {
  const { error } = await resend().emails.send({
    from: FROM,
    to: opts.to,
    replyTo: opts.replyTo,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    attachments: opts.attachments,
  });
  if (error) throw new Error(error.message);
}
