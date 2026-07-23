import { getService, type QuoteSubmission } from "../data";
import {
  C,
  EMAIL_LANG,
  contactRows,
  detailRows,
  emailShell,
  escapeHtml,
  rowsTable,
  sectionLabel,
  type Row,
} from "./shared";

/* The internal sales notification — the critical email of the pair. */
export function buildSalesEmail(submission: QuoteSubmission): {
  subject: string;
  html: string;
  text: string;
} {
  const service = getService(submission.service);
  const serviceLabel = service?.label[EMAIL_LANG] ?? submission.service;
  const accent = service?.color ?? C.strong;
  const name = ((submission.contact.name as string) ?? "").trim();
  const company = ((submission.contact.company as string) ?? "").trim();

  const contact = contactRows(submission);
  const details = detailRows(submission);
  const tag = company || name;

  const body = `
        <tr>
          <td style="padding:28px 32px 6px;">
            ${sectionLabel("Nueva solicitud de cotización", accent)}
            <div style="margin-top:10px;font-size:23px;font-weight:700;color:${C.strong};line-height:1.2;letter-spacing:-0.01em;">${escapeHtml(serviceLabel)}</div>
            <div style="margin-top:5px;font-size:14px;color:${C.muted};">${escapeHtml(company || name || "—")}${company && name ? ` &middot; ${escapeHtml(name)}` : ""}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 6px;">
            ${sectionLabel("Contacto", accent)}
            ${rowsTable(contact)}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 8px;">
            ${sectionLabel("Detalles de la solicitud", accent)}
            ${rowsTable(details)}
          </td>
        </tr>
        <tr>
          <td style="padding:10px 32px 28px;">
            <div style="padding:14px 16px;background:${C.panel};border-left:3px solid ${accent};font-size:13px;color:${C.body};line-height:1.55;">Responde este correo para contactar directamente a <strong style="color:${C.strong};">${escapeHtml(name || "el prospecto")}</strong>.</div>
          </td>
        </tr>`;

  const html = emailShell({
    preheader: `Nueva solicitud de cotización — ${serviceLabel}${tag ? ` de ${tag}` : ""}`,
    accent,
    body,
  });

  const line = (rows: Row[]) =>
    rows.map((row) => `  ${row.label}: ${row.value}`).join("\n");
  const text = [
    `NUEVA SOLICITUD DE COTIZACIÓN — ${serviceLabel}`,
    tag ? tag : "",
    "",
    "CONTACTO",
    line(contact),
    "",
    "DETALLES DE LA SOLICITUD",
    line(details),
  ]
    .filter((part) => part !== "")
    .join("\n");

  return {
    subject: `Nueva solicitud de cotización — ${serviceLabel}${tag ? ` · ${tag}` : ""}`,
    html,
    text,
  };
}
