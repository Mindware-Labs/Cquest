"use server";

import { Resend } from "resend";
import { isLocale, type Locale } from "@/i18n/config";
import {
  APPLICATION_FIELDS,
  ACTIVE_POSITIONS,
  applicationMessages,
  applicationSchema,
  checkCvFile,
} from "../data";
import { buildHrEmail } from "./emails/hr";
import { storeApplication, type StoredApplication } from "./store";

/* Mismo seam anti-spam que quote/submitQuote.ts: honeypot + tiempo mínimo +
   reCAPTCHA v3 opcional, y revalidación en servidor con el MISMO esquema que
   usa el formulario. El gate del cliente es comodidad, no seguridad. */
const MIN_SUBMIT_MS = 1500;
const RECAPTCHA_MIN_SCORE = 0.5;
const RECAPTCHA_ACTION = "submit_application";

export type ApplicationResult =
  | { ok: true }
  /* A diferencia de /quote, esto DEVUELVE el error en vez de lanzarlo: un
     candidato cuyo CV fue rechazado necesita saber qué campo corregir, no un
     fallo genérico. `fields` mapea nombre de campo → mensaje. */
  | { ok: false; message: string; fields?: Record<string, string> };

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

function readString(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitApplication(form: FormData): Promise<ApplicationResult> {
  const langValue = readString(form, "locale");
  const lang: Locale = isLocale(langValue) ? langValue : "es";
  const t = applicationMessages(lang);

  /* El bot recibe un ok: decirle qué lo delató es enseñarle a pasar. */
  const startedAt = Number(readString(form, "startedAt"));
  const tooFast = Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_SUBMIT_MS;
  const flagged = await isFlaggedByRecaptcha(readString(form, "recaptchaToken") || undefined);
  if (readString(form, "company") || tooFast || flagged) {
    return { ok: true };
  }

  const raw = Object.fromEntries(
    APPLICATION_FIELDS.map((field) => [field, readString(form, field)]),
  );
  const parsed = applicationSchema(lang).safeParse(raw);

  const fields: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fields)) fields[key] = issue.message;
    }
  }

  const cvValue = form.get("cv");
  const cv = cvValue instanceof File ? cvValue : null;
  const cvCheck = checkCvFile(cv, lang);
  if (!cvCheck.ok) fields.cv = cvCheck.message;

  if (!parsed.success || !cvCheck.ok || !cv) {
    return { ok: false, message: t.generic, fields };
  }

  const apiKey = process.env.API_KEY_RESEND;
  if (!apiKey) {
    console.error("[careers] API_KEY_RESEND no está configurada");
    return { ok: false, message: t.generic };
  }

  const position = ACTIVE_POSITIONS.find((item) => item.slug === parsed.data.positionSlug);
  const record: StoredApplication = {
    receivedAt: new Date().toISOString(),
    positionSlug: position?.slug ?? "",
    positionTitle: position?.title.es ?? "Banco de talento",
    locale: lang,
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    city: parsed.data.city,
    experience: parsed.data.experience,
    english: parsed.data.english,
    availability: parsed.data.availability,
    message: parsed.data.message ?? "",
    cvFileName: cv.name,
  };

  const bytes = new Uint8Array(await cv.arrayBuffer());

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM ?? "Center Quest <onboarding@resend.dev>";
  const hrInbox = (process.env.RESEND_TO_HR ?? process.env.RESEND_TO ?? "labsmindware@gmail.com")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  const email = buildHrEmail(record);
  const { error } = await resend.emails.send({
    from,
    to: hrInbox,
    replyTo: record.email || undefined,
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: [{ filename: cv.name, content: Buffer.from(bytes) }],
  });
  if (error) {
    console.error("[careers] Resend rechazó el envío", error);
    return { ok: false, message: t.generic };
  }

  /* Después del correo y sin await sobre su resultado de error: el archivo es
     respaldo, la notificación es el canal real. Ver store.ts. */
  await storeApplication(record, { name: cv.name, bytes });

  return { ok: true };
}
