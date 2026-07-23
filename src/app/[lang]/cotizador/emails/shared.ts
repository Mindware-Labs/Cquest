import {
  CONTACT_FIELDS,
  CONTACT_METHODS,
  QUESTIONNAIRES,
  resolveChoice,
  resolveQuestion,
  type Answers,
  type Question,
  type QuoteSubmission,
} from "../data";

// This is Center Quest's own internal sales-notification email — for RD
// staff, not the prospect — so it stays fixed-Spanish regardless of which
// language the prospect used on the site. See submitQuote.ts's own note.
export const EMAIL_LANG = "es" as const;

/* ── Email design system (server-only helpers) ────────────────────────────
   Table-based, inline-styled, self-contained — the way email clients want it.
   A shared branded shell (wordmark header, service-tinted accent, footer) wraps
   each message; brand colours and sharp 2px geometry echo the site. */

export const C = {
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

export const FONT =
  "-apple-system,BlinkMacSystemFont,'Switzer','Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export type Row = { label: string; value: string };

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Map a stored answer back to its human label(s).
export function answerText(
  question: Question,
  answer: Answers[string] | undefined,
): string {
  if (answer == null) return "—";
  const resolved = resolveQuestion(question, EMAIL_LANG);
  const values = Array.isArray(answer) ? answer : [answer];
  const labels = values
    .filter((value) => value !== "")
    .map((value) => resolved.choices?.find((choice) => choice.value === value)?.label ?? value);
  return labels.length > 0 ? labels.join(", ") : "—";
}

export function contactRows(submission: QuoteSubmission): Row[] {
  const rows: Row[] = CONTACT_FIELDS.map((field) => ({
    label: resolveQuestion(field, EMAIL_LANG).label,
    value: ((submission.contact[field.id] as string) ?? "").trim() || "—",
  }));
  const preferred = submission.contact.preferred as string | undefined;
  const preferredChoice = CONTACT_METHODS.find((method) => method.value === preferred);
  rows.push({
    label: "Canal preferido",
    value: preferredChoice ? resolveChoice(preferredChoice, EMAIL_LANG).label : "—",
  });
  return rows;
}

export function detailRows(submission: QuoteSubmission): Row[] {
  return QUESTIONNAIRES[submission.service].questions.map((question) => ({
    label: resolveQuestion(question, EMAIL_LANG).label,
    value: answerText(question, submission.details[question.id]),
  }));
}

export function sectionLabel(text: string, accent: string): string {
  return `<div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${accent};">${escapeHtml(text)}</div>`;
}

export function rowsTable(rows: Row[]): string {
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

export function emailShell(opts: {
  preheader: string;
  accent: string;
  body: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
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
            <div style="margin-top:6px;font-size:10.5px;font-weight:600;letter-spacing:0.16em;color:${C.celeste};text-transform:uppercase;">Aliado de operaciones &middot; Rep&uacute;blica Dominicana</div>
          </td>
        </tr>
        <tr><td style="height:3px;background:${opts.accent};font-size:0;line-height:0;">&nbsp;</td></tr>
        ${opts.body}
        <tr>
          <td style="background:${C.panel};border-top:1px solid ${C.line};padding:22px 32px;">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.24em;color:${C.muted};text-transform:uppercase;">Center Quest</div>
            <div style="margin-top:6px;font-size:12px;color:${C.faint};letter-spacing:0.02em;">Call Center &middot; Operaciones &middot; Desarrollo de Sistemas</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
