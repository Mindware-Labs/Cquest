/* Paleta de marca para los emails de "olvidé mi contraseña". Mismos valores
   que documenta DISENIO.md y ya usa src/app/styles/tokens.css (--ink,
   --brand-celeste, --brand-petroleo) — declarados acá, no importados de
   src/app/[lang]/quote/emails/shared.ts: son constantes de MARCA, no algo
   específico del flujo de cotización, y cruzar ese import acoplaría el panel
   admin al sitio público por un objeto de color. */

export const BRAND = {
  ink: "#0a1116",
  celeste: "#74c3d5",
  petroleo: "#3f738d",
  surface: "#f8f7f4",
  panel: "#f7f6f3",
  line: "#e7e4de",
  body: "#3f4b52",
  muted: "#5b6b73",
  faint: "#8a959b",
  danger: "#a32020",
} as const;

/* Sin @font-face: los clientes de correo no lo soportan de forma confiable
   —el mismo motivo por el que src/app/[lang]/quote/emails/shared.ts tampoco
   lo intenta—, así que Josefin Sans queda como preferencia aspiracional al
   principio de la pila y el resto son equivalentes geométricos del sistema. */
export const EMAIL_FONT =
  "-apple-system,BlinkMacSystemFont,'Josefin Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export const EMAIL_MONO_FONT =
  "'SF Mono',SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace";
