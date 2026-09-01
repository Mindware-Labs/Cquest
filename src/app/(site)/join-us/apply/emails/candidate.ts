import { C, emailShell, escapeHtml, sectionLabel } from "@/lib/emails/shell";

const ACCENT = C.celeste;

export function buildCandidateEmail(input: {
  firstName: string;
  target: string;
  isPool: boolean;
  openingsUrl: string;
}): { subject: string; html: string; text: string } {
  const intro = input.isPool
    ? "Your resume is now in our talent pool. When a role that fits your profile opens up, we will reach out directly."
    : `We received your application for ${input.target}. Our team reads every application and gets back to you as soon as there is a decision.`;

  const body = `
        <tr>
          <td style="padding:28px 32px 6px;">
            ${sectionLabel("Application received", ACCENT)}
            <div style="margin-top:10px;font-size:23px;font-weight:700;color:${C.strong};line-height:1.2;letter-spacing:-0.01em;">Thanks, ${escapeHtml(input.firstName)}.</div>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 32px 6px;font-size:14px;line-height:1.65;color:${C.body};">
            ${escapeHtml(intro)}
          </td>
        </tr>
        <tr>
          <td style="padding:14px 32px 6px;font-size:14px;line-height:1.65;color:${C.body};">
            If we move forward, the next step is a short call by phone or WhatsApp. No need to reply to this email.
          </td>
        </tr>
        <tr>
          <td style="padding:22px 32px 30px;">
            <a href="${escapeHtml(input.openingsUrl)}" style="display:inline-block;padding:13px 22px;background:${C.ink};color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;border-radius:2px;">See open positions</a>
          </td>
        </tr>`;

  const text = [
    `Thanks, ${input.firstName}.`,
    "",
    intro,
    "",
    "If we move forward, the next step is a short call by phone or WhatsApp. No need to reply to this email.",
    "",
    `Open positions: ${input.openingsUrl}`,
  ].join("\n");

  return {
    subject: input.isPool ? "We received your resume — Center Quest" : `We received your application — ${input.target}`,
    html: emailShell({ preheader: intro, accent: ACCENT, body }),
    text,
  };
}
