import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/render";
import ResetCodeEmail from "./ResetCodeEmail";
import PasswordChangedEmail from "./PasswordChangedEmail";

/* El envío de los dos correos de este flujo, en un solo lugar. Renderiza a
   mano con @react-email/render —html Y texto plano, la misma forma que ya
   manda src/app/[lang]/quote/submitQuote.ts— en vez de pasarle `react:`
   directo a Resend: ese prop de Resend sólo llena `.html` y nunca toca
   `.text`, así que usarlo tal cual rompería en silencio la convención de
   este proyecto de mandar siempre las dos versiones. */

function client(): Resend {
  const apiKey = process.env.API_KEY_RESEND;
  if (!apiKey) throw new Error("API_KEY_RESEND is not set");
  return new Resend(apiKey);
}

function fromAddress(): string {
  return process.env.RESEND_FROM ?? "Center Quest <onboarding@resend.dev>";
}

export async function sendResetCodeEmail(to: string, code: string, expiresInMinutes: number): Promise<void> {
  const element = <ResetCodeEmail code={code} expiresInMinutes={expiresInMinutes} />;
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);

  const { error } = await client().emails.send({
    from: fromAddress(),
    to,
    subject: "Tu código para restablecer la contraseña",
    html,
    text,
  });
  if (error) throw new Error(error.message ?? "No se pudo enviar el correo de reset");
}

/** Cortesía post-reset — de mejor esfuerzo a propósito: si este segundo
 *  correo falla, la contraseña YA cambió y el flujo ya terminó bien, así que
 *  el llamador registra el error pero no lo propaga (ver actions.ts). */
export async function sendPasswordChangedEmail(to: string, changedAt: string): Promise<void> {
  const element = <PasswordChangedEmail changedAt={changedAt} />;
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);

  const { error } = await client().emails.send({
    from: fromAddress(),
    to,
    subject: "Tu contraseña del panel de Center Quest se actualizó",
    html,
    text,
  });
  if (error) throw new Error(error.message ?? "No se pudo enviar el aviso de contraseña actualizada");
}
