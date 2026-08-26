import "server-only";
import { Resend } from "resend";
import { requireEnv } from "@/lib/env";

/* Un cliente por proceso: el resto del sitio hace `new Resend()` por llamada y
   eso rehace la config en cada envío. */
let client: Resend | null = null;

function resend(): Resend {
  client ??= new Resend(requireEnv("API_KEY_RESEND"));
  return client;
}

const FROM = process.env.RESEND_FROM ?? "Center Quest <no-reply@cquest.do>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const { error } = await resend().emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
  if (error) throw new Error(error.message);
}
