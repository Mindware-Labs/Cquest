"use server";

import { Resend } from "resend";
import {
  QUESTIONNAIRES,
  contactSchema,
  detailsSchema,
  type QuoteSubmission,
} from "./data";
import { buildSalesEmail } from "./emails/sales";

/* Trampa temporal: un bot rellena y envía en menos de esto. */
const MIN_SUBMIT_MS = 1500;

const RECAPTCHA_MIN_SCORE = 0.5;
const RECAPTCHA_ACTION = "submit_quote";

async function isFlaggedByRecaptcha(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return false;

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const result = (await response.json()) as { success: boolean; score?: number; action?: string };
    return !result.success || result.action !== RECAPTCHA_ACTION || (result.score ?? 0) < RECAPTCHA_MIN_SCORE;
  } catch {
    return false;
  }
}

export async function submitQuote(submission: QuoteSubmission): Promise<void> {
  const tooFast = submission.startedAt !== undefined && Date.now() - submission.startedAt < MIN_SUBMIT_MS;
  if (submission.honeypot || tooFast || (await isFlaggedByRecaptcha(submission.recaptchaToken))) {
    return;
  }

  const apiKey = process.env.API_KEY_RESEND;
  if (!apiKey) {
    throw new Error("API_KEY_RESEND is not set");
  }

  const questionnaire = QUESTIONNAIRES[submission.service];
  /* Se revalida en servidor con los MISMOS esquemas que usa el wizard: el
     gate del cliente es comodidad, no seguridad. */
  const detailsValid =
    Boolean(questionnaire) &&
    detailsSchema(questionnaire, submission.locale).safeParse(submission.details).success;
  const contactValid = contactSchema(submission.locale).safeParse(submission.contact).success;
  if (!detailsValid || !contactValid) {
    throw new Error("Invalid quote submission");
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM ?? "Center Quest <no-reply@cquest.do>";
  const salesInbox = (process.env.RESEND_TO ?? "labsmindware@gmail.com")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  const prospectEmail = ((submission.contact.email as string) ?? "").trim();

  const sales = buildSalesEmail(submission);
  const { error: salesError } = await resend.emails.send({
    from,
    to: salesInbox,
    replyTo: prospectEmail || undefined,
    subject: sales.subject,
    html: sales.html,
    text: sales.text,
  });
  if (salesError) {
    throw new Error(salesError.message ?? "Email delivery failed");
  }
}
