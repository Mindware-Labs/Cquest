/* ── Prospect confirmation — DISABLED for now ─────────────────────────────
   Resend's shared test sender (onboarding@resend.dev) only delivers to the
   account owner, so real prospects never receive it. To re-enable:
   1. Verify a domain in Resend and set RESEND_FROM to an address on it.
   2. Uncomment everything below.
   3. Uncomment the prospect-confirmation block in ../submitQuote.ts and import
      `buildProspectEmail` from here.

import { CONTACT_METHODS, QUESTIONNAIRES, getService, type QuoteSubmission } from "../data";
import { C, answerText, emailShell, escapeHtml, rowsTable, sectionLabel, type Row } from "./shared";

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

export function buildProspectEmail(submission: QuoteSubmission): {
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

export {};
