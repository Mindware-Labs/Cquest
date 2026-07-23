"use server";

import { Resend } from "resend";
import {
  QUESTIONNAIRES,
  contactSchema,
  detailsSchema,
  type QuoteSubmission,
} from "./data";
import { buildSalesEmail } from "./emails/sales";

/* ── SEAM · Phase 4 — the one place the quote form "sends" ──
   Every mount of the wizard funnels its submission through this Server Action.
   It runs server-side only, so the Resend key (API_KEY_RESEND) never reaches the
   client. Two emails go out: an internal sales notification (critical) and a
   confirmation to the prospect (best-effort — Resend's test domain only delivers
   to the account owner, so a restricted recipient must not fail the flow; once a
   domain is verified it just works). On a critical failure it throws — the wizard
   catches, keeps the prospect's answers, and lets them retry. No database or CRM.

   Email templates live in ./emails (shared shell + per-message builders).

   Env overrides: RESEND_FROM (default "Center Quest <onboarding@resend.dev>"),
   RESEND_TO (sales inbox, default "labsmindware@gmail.com", comma-separated). */
// Below this, a real prospect can't have finished all 3 steps — reading and
// answering even the shortest questionnaire takes longer than this in practice.
const MIN_SUBMIT_MS = 1500;

// Google's own recommended default (see the reCAPTCHA v3 docs) — 1.0 is very
// likely human, 0.0 is very likely a bot.
const RECAPTCHA_MIN_SCORE = 0.5;
const RECAPTCHA_ACTION = "submit_quote";

// No token isn't itself suspicious — it means the client's grecaptcha script
// never loaded (ad-blocker, privacy extension, network hiccup), which real
// prospects trigger too. Only an explicit failure (bad token, wrong action,
// low score) counts as a bot signal; a verify-request failure (Google's API
// down) fails open rather than blocking real leads on Google's outage.
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
  // Anti-spam, layered: a filled honeypot, an implausibly fast submission, or
  // a low reCAPTCHA score all resolve as if it succeeded (the wizard shows
  // the normal confirmation) but nothing is sent — tipping off a bot that it
  // was caught only teaches it to adapt.
  const tooFast = submission.startedAt !== undefined && Date.now() - submission.startedAt < MIN_SUBMIT_MS;
  if (submission.honeypot || tooFast || (await isFlaggedByRecaptcha(submission.recaptchaToken))) {
    return;
  }

  const apiKey = process.env.API_KEY_RESEND;
  if (!apiKey) {
    throw new Error("API_KEY_RESEND is not set");
  }

  // Never trust the client: re-validate with the same schemas the form uses.
  const questionnaire = QUESTIONNAIRES[submission.service];
  const detailsValid =
    Boolean(questionnaire) &&
    detailsSchema(questionnaire, submission.locale).safeParse(submission.details).success;
  const contactValid = contactSchema(submission.locale).safeParse(submission.contact).success;
  if (!detailsValid || !contactValid) {
    throw new Error("Invalid quote submission");
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM ?? "Center Quest <onboarding@resend.dev>";
  const salesInbox = (process.env.RESEND_TO ?? "labsmindware@gmail.com")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  const prospectEmail = ((submission.contact.email as string) ?? "").trim();

  // 1 · Internal sales notification — must succeed.
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

  // 2 · Prospect confirmation — DISABLED for now.
  // Resend's shared test sender (onboarding@resend.dev) only delivers to the
  // account owner, so real prospects never receive it. To re-enable: verify a
  // domain in Resend, set RESEND_FROM to an address on it, then uncomment this
  // block AND the builder in ./emails/prospect.ts.
  //
  // if (prospectEmail) {
  //   const confirmation = buildProspectEmail(submission);
  //   try {
  //     const { error } = await resend.emails.send({
  //       from,
  //       to: prospectEmail,
  //       replyTo: salesInbox[0],
  //       subject: confirmation.subject,
  //       html: confirmation.html,
  //       text: confirmation.text,
  //     });
  //     if (error) {
  //       console.warn(
  //         `Prospect confirmation to ${prospectEmail} not sent: ${error.message}.`,
  //       );
  //     }
  //   } catch (error) {
  //     console.warn(`Prospect confirmation to ${prospectEmail} failed:`, error);
  //   }
  // }
}
