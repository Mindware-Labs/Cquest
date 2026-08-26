import "server-only";
import { C, emailShell, escapeHtml, sectionLabel } from "@/lib/emails/shell";
import { siteUrl } from "@/lib/env";
import { sendEmail } from "@/lib/emails/send";

const ACCENT = C.celeste;
const OTP_MINUTES = 10;

// Partido en dos grupos: seis dígitos seguidos se vuelven enlace de teléfono.
function otpBlock(otp: string): string {
  const grouped = `${otp.slice(0, 3)} ${otp.slice(3)}`;
  return `<div style="margin-top:14px;padding:18px 20px;background:${C.panel};border:1px solid ${C.line};border-radius:2px;text-align:center;">
            <div style="font-size:32px;font-weight:700;letter-spacing:0.22em;color:${C.strong};font-variant-numeric:tabular-nums;">${escapeHtml(grouped)}</div>
            <div style="margin-top:8px;font-size:12px;color:${C.faint};">Caduca en ${OTP_MINUTES} minutos</div>
          </div>`;
}

function panel(inner: string): string {
  return `<tr><td style="padding:30px 32px 34px;">${inner}</td></tr>`;
}

function heading(text: string): string {
  return `<div style="margin-top:10px;font-size:22px;font-weight:600;line-height:1.3;color:${C.strong};">${escapeHtml(text)}</div>`;
}

function paragraph(text: string): string {
  return `<p style="margin:14px 0 0;font-size:14px;line-height:1.65;color:${C.body};">${escapeHtml(text)}</p>`;
}

function footNote(text: string): string {
  return `<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid ${C.line};font-size:12px;line-height:1.6;color:${C.faint};">${escapeHtml(text)}</p>`;
}

export type BuiltEmail = { subject: string; html: string; text: string };

// Construir y enviar separados: permite revisar la plantilla sin enviar nada.
export function buildWelcomeOtpEmail(opts: {
  to: string;
  name: string;
  otp: string;
}): BuiltEmail {
  const link = `${siteUrl()}/admin/reset-password?email=${encodeURIComponent(opts.to)}`;
  const html = emailShell({
    preheader: `Tu código para activar el acceso al panel: ${opts.otp}`,
    accent: ACCENT,
    body: panel(
      sectionLabel("Acceso al panel", ACCENT) +
        heading(`Bienvenido, ${opts.name}`) +
        paragraph(
          "Se creó tu cuenta en el panel de Center Quest. Define tu contraseña con este código de un solo uso.",
        ) +
        otpBlock(opts.otp) +
        `<div style="margin-top:22px;"><a href="${escapeHtml(link)}" style="display:inline-block;padding:13px 24px;background:${C.ink};color:#ffffff;text-decoration:none;border-radius:2px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Definir contraseña</a></div>` +
        footNote(
          "Si no esperabas este correo, ignóralo: sin el código nadie puede activar la cuenta.",
        ),
    ),
  });

  const text = [
    `Bienvenido, ${opts.name}.`,
    "",
    "Se creó tu cuenta en el panel de Center Quest.",
    `Código de un solo uso: ${opts.otp} (caduca en ${OTP_MINUTES} minutos)`,
    "",
    `Define tu contraseña: ${link}`,
    "",
    "Si no esperabas este correo, ignóralo.",
  ].join("\n");

  return { subject: "Activa tu acceso al panel de Center Quest", html, text };
}

export async function sendWelcomeOtpEmail(opts: {
  to: string;
  name: string;
  otp: string;
}): Promise<void> {
  await sendEmail({ to: opts.to, ...buildWelcomeOtpEmail(opts) });
}

export function buildPasswordResetOtpEmail(opts: {
  to: string;
  otp: string;
}): BuiltEmail {
  const link = `${siteUrl()}/admin/reset-password?email=${encodeURIComponent(opts.to)}`;
  const html = emailShell({
    preheader: `Tu código para restablecer la contraseña: ${opts.otp}`,
    accent: ACCENT,
    body: panel(
      sectionLabel("Restablecer contraseña", ACCENT) +
        heading("Código de verificación") +
        paragraph("Usa este código para definir una contraseña nueva en el panel de Center Quest.") +
        otpBlock(opts.otp) +
        `<div style="margin-top:22px;"><a href="${escapeHtml(link)}" style="display:inline-block;padding:13px 24px;background:${C.ink};color:#ffffff;text-decoration:none;border-radius:2px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Restablecer contraseña</a></div>` +
        footNote(
          "Si no pediste este cambio, ignora el correo: tu contraseña actual sigue siendo válida.",
        ),
    ),
  });

  const text = [
    "Código para restablecer tu contraseña en el panel de Center Quest.",
    "",
    `Código: ${opts.otp} (caduca en ${OTP_MINUTES} minutos)`,
    "",
    `Restablecer: ${link}`,
    "",
    "Si no pediste este cambio, ignora el correo.",
  ].join("\n");

  return { subject: "Código para restablecer tu contraseña", html, text };
}

export async function sendPasswordResetOtpEmail(opts: {
  to: string;
  otp: string;
}): Promise<void> {
  await sendEmail({ to: opts.to, ...buildPasswordResetOtpEmail(opts) });
}
