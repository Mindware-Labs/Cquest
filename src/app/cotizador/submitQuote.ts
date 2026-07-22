"use server";

import { Resend } from "resend";
import {
  CONTACT_FIELDS,
  CONTACT_METHODS,
  QUESTIONNAIRES,
  contactSchema,
  detailsSchema,
  getService,
  type Answers,
  type Question,
  type QuoteSubmission,
} from "./data";

/* ── SEAM · Phase 4 — the one place the quote form "sends" ──
   Every mount of the wizard funnels its submission through this Server Action.
   It runs server-side only, so the Resend key (API_KEY_RESEND) never reaches the
   client. Two emails go out: an internal sales notification (critical) and a
   confirmation to the prospect (best-effort — Resend's test domain only delivers
   to the account owner, so a restricted recipient must not fail the flow; once a
   domain is verified it just works). On a critical failure it throws — the wizard
   catches, keeps the prospect's answers, and lets them retry. No database or CRM.

   Env overrides: RESEND_FROM (default "Center Quest <onboarding@resend.dev>"),
   RESEND_TO (sales inbox, default "labsmindware@gmail.com", comma-separated). */
export async function submitQuote(submission: QuoteSubmission): Promise<void> {
  const apiKey = process.env.API_KEY_RESEND;
  if (!apiKey) {
    throw new Error("API_KEY_RESEND is not set");
  }

  // Never trust the client: re-validate with the same schemas the form uses.
  const questionnaire = QUESTIONNAIRES[submission.service];
  const detailsValid =
    Boolean(questionnaire) &&
    detailsSchema(questionnaire).safeParse(submission.details).success;
  const contactValid = contactSchema.safeParse(submission.contact).success;
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
  // block AND the `buildProspectEmail` / `stepsTable` helpers below.
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

/* ── Email design system (server-only helpers, not exported) ──────────────
   Table-based, inline-styled, self-contained — the way email clients want it.
   A shared branded shell (wordmark header, service-tinted accent, footer) wraps
   each message; brand colours and sharp 2px geometry echo the site. */

const C = {
  ink: "#0a1116",
  celeste: "#74c3d5",
  surface: "#f0ede8",
  panel: "#f7f6f3",
  line: "#e7e4de",
  strong: "#0a1116",
  body: "#45535b",
  muted: "#5b6b73",
  faint: "#8a959b",
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'Switzer','Segoe UI',Roboto,Helvetica,Arial,sans-serif";

type Row = { label: string; value: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Map a stored answer back to its human label(s).
function answerText(
  question: Question,
  answer: Answers[string] | undefined,
): string {
  if (answer == null) return "—";
  const values = Array.isArray(answer) ? answer : [answer];
  const labels = values
    .filter((value) => value !== "")
    .map(
      (value) =>
        question.choices?.find((choice) => choice.value === value)?.label ??
        value,
    );
  return labels.length > 0 ? labels.join(", ") : "—";
}

function contactRows(submission: QuoteSubmission): Row[] {
  const rows: Row[] = CONTACT_FIELDS.map((field) => ({
    label: field.label,
    value: ((submission.contact[field.id] as string) ?? "").trim() || "—",
  }));
  const preferred = submission.contact.preferred as string | undefined;
  rows.push({
    label: "Preferred channel",
    value:
      CONTACT_METHODS.find((method) => method.value === preferred)?.label ?? "—",
  });
  return rows;
}

function detailRows(submission: QuoteSubmission): Row[] {
  return QUESTIONNAIRES[submission.service].questions.map((question) => ({
    label: question.label,
    value: answerText(question, submission.details[question.id]),
  }));
}

function sectionLabel(text: string, accent: string): string {
  return `<div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${accent};">${escapeHtml(text)}</div>`;
}

function rowsTable(rows: Row[]): string {
  const body = rows
    .map(
      (row) => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid ${C.line};color:${C.muted};font-size:13px;line-height:1.45;vertical-align:top;width:44%;">${escapeHtml(row.label)}</td>
              <td style="padding:10px 0 10px 18px;border-bottom:1px solid ${C.line};color:${C.strong};font-size:14px;font-weight:600;line-height:1.5;">${escapeHtml(row.value)}</td>
            </tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:8px;border-collapse:collapse;">${body}</table>`;
}

/* Disabled with the prospect confirmation (see submitQuote) — re-enable together.
function stepsTable(steps: string[], accent: string): string {
  const body = steps
    .map(
      (step, index) => `
            <tr>
              <td style="width:24px;vertical-align:top;padding:5px 0;">
                <div style="width:22px;height:22px;border-radius:2px;background:${accent};color:#ffffff;font-size:12px;font-weight:700;text-align:center;line-height:22px;">${index + 1}</div>
              </td>
              <td style="padding:5px 0 5px 14px;color:${C.strong};font-size:14px;line-height:1.5;">${escapeHtml(step)}</td>
            </tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:12px;border-collapse:collapse;">${body}</table>`;
}
*/

function emailShell(opts: {
  preheader: string;
  accent: string;
  body: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
</head>
<body style="margin:0;padding:0;background:${C.surface};">
<span style="display:none!important;visibility:hidden;opacity:0;color:${C.surface};height:0;width:0;font-size:1px;line-height:1px;overflow:hidden;">${escapeHtml(opts.preheader)}</span>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${C.surface};">
  <tr>
    <td align="center" style="padding:30px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:100%;background:#ffffff;border-radius:2px;overflow:hidden;box-shadow:0 14px 44px -24px rgba(10,17,22,0.5);font-family:${FONT};">
        <tr>
          <td style="background:${C.ink};padding:24px 32px;">
            <div style="font-size:15px;font-weight:700;letter-spacing:0.3em;color:#ffffff;text-transform:uppercase;">Center&nbsp;Quest</div>
            <div style="margin-top:6px;font-size:10.5px;font-weight:600;letter-spacing:0.16em;color:${C.celeste};text-transform:uppercase;">Operations partner &middot; Rep&uacute;blica Dominicana</div>
          </td>
        </tr>
        <tr><td style="height:3px;background:${opts.accent};font-size:0;line-height:0;">&nbsp;</td></tr>
        ${opts.body}
        <tr>
          <td style="background:${C.panel};border-top:1px solid ${C.line};padding:22px 32px;">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.24em;color:${C.muted};text-transform:uppercase;">Center Quest</div>
            <div style="margin-top:6px;font-size:12px;color:${C.faint};letter-spacing:0.02em;">Call Center &middot; BPO &middot; Systems Development</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function buildSalesEmail(submission: QuoteSubmission): {
  subject: string;
  html: string;
  text: string;
} {
  const service = getService(submission.service);
  const serviceLabel = service?.label ?? submission.service;
  const accent = service?.color ?? C.strong;
  const name = ((submission.contact.name as string) ?? "").trim();
  const company = ((submission.contact.company as string) ?? "").trim();

  const contact = contactRows(submission);
  const details = detailRows(submission);
  const tag = company || name;

  const body = `
        <tr>
          <td style="padding:28px 32px 6px;">
            ${sectionLabel("New quote request", accent)}
            <div style="margin-top:10px;font-size:23px;font-weight:700;color:${C.strong};line-height:1.2;letter-spacing:-0.01em;">${escapeHtml(serviceLabel)}</div>
            <div style="margin-top:5px;font-size:14px;color:${C.muted};">${escapeHtml(company || name || "—")}${company && name ? ` &middot; ${escapeHtml(name)}` : ""}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 6px;">
            ${sectionLabel("Contact", accent)}
            ${rowsTable(contact)}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 8px;">
            ${sectionLabel("Requirement details", accent)}
            ${rowsTable(details)}
          </td>
        </tr>
        <tr>
          <td style="padding:10px 32px 28px;">
            <div style="padding:14px 16px;background:${C.panel};border-left:3px solid ${accent};font-size:13px;color:${C.body};line-height:1.55;">Reply to this email to reach <strong style="color:${C.strong};">${escapeHtml(name || "the prospect")}</strong> directly.</div>
          </td>
        </tr>`;

  const html = emailShell({
    preheader: `New quote request — ${serviceLabel}${tag ? ` from ${tag}` : ""}`,
    accent,
    body,
  });

  const line = (rows: Row[]) =>
    rows.map((row) => `  ${row.label}: ${row.value}`).join("\n");
  const text = [
    `NEW QUOTE REQUEST — ${serviceLabel}`,
    tag ? tag : "",
    "",
    "CONTACT",
    line(contact),
    "",
    "REQUIREMENT DETAILS",
    line(details),
  ]
    .filter((part) => part !== "")
    .join("\n");

  return {
    subject: `New quote request — ${serviceLabel}${tag ? ` · ${tag}` : ""}`,
    html,
    text,
  };
}

/* Disabled with the prospect confirmation (see submitQuote) — re-enable together.
function buildProspectEmail(submission: QuoteSubmission): {
  subject: string;
  html: string;
  text: string;
} {
  const service = getService(submission.service);
  const serviceLabel = service?.label ?? submission.service;
  const accent = service?.color ?? C.strong;
  const fullName = ((submission.contact.name as string) ?? "").trim();
  const firstName = fullName.split(/\s+/)[0] ?? "";

  const preferred = submission.contact.preferred as string | undefined;
  const preferredLabel = CONTACT_METHODS.find(
    (method) => method.value === preferred,
  )?.label;

  // A concise recap of what they submitted — service first, then answered items.
  const recap: Row[] = [{ label: "Service", value: serviceLabel }];
  for (const question of QUESTIONNAIRES[submission.service].questions) {
    const value = answerText(question, submission.details[question.id]);
    if (value !== "—") recap.push({ label: question.label, value });
  }

  const steps = [
    "We review the details of your request.",
    "We prepare a proposal tailored to your operation.",
    preferredLabel
      ? `We reach out via ${preferredLabel} within one business day.`
      : "We reach out within one business day.",
  ];

  const body = `
        <tr>
          <td style="padding:30px 32px 6px;">
            ${sectionLabel("Request received", accent)}
            <div style="margin-top:12px;font-size:23px;font-weight:700;color:${C.strong};line-height:1.25;letter-spacing:-0.01em;">Thanks${firstName ? `, ${escapeHtml(firstName)}` : ""} &mdash; we&rsquo;ve got your request.</div>
            <div style="margin-top:12px;font-size:15px;line-height:1.6;color:${C.body};">Our team is reviewing your <strong style="color:${C.strong};">${escapeHtml(serviceLabel)}</strong> request and will get back to you within one business day with a tailored proposal.</div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 6px;">
            ${sectionLabel("What you told us", accent)}
            ${rowsTable(recap)}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 6px;">
            ${sectionLabel("What happens next", accent)}
            ${stepsTable(steps, accent)}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 30px;">
            <div style="font-size:14px;color:${C.body};line-height:1.6;">Questions in the meantime? Just reply to this email &mdash; we&rsquo;re happy to help.</div>
            <div style="margin-top:16px;font-size:14px;font-weight:600;color:${C.strong};">&mdash; The Center Quest team</div>
          </td>
        </tr>`;

  const html = emailShell({
    preheader: `Thanks${firstName ? `, ${firstName}` : ""} — we'll reply within one business day.`,
    accent,
    body,
  });

  const text = [
    `Thanks${firstName ? `, ${firstName}` : ""} — we've got your request.`,
    "",
    `Our team is reviewing your ${serviceLabel} request and will get back to you within one business day with a tailored proposal.`,
    "",
    "WHAT YOU TOLD US",
    ...recap.map((row) => `  ${row.label}: ${row.value}`),
    "",
    "WHAT HAPPENS NEXT",
    ...steps.map((step, index) => `  ${index + 1}. ${step}`),
    "",
    "Questions? Just reply to this email.",
    "— The Center Quest team",
  ].join("\n");

  return {
    subject: `We’ve received your ${serviceLabel} request`,
    html,
    text,
  };
}
*/
