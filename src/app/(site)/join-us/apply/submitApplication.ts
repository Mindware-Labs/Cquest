"use server";

import { del, put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { application, applicationStatusHistory } from "@/db/schema/careers";
import { department } from "@/db/schema/department";
import { sendEmail } from "@/lib/emails/send";
import { requireEnv, siteUrl } from "@/lib/env";
import { getPublishedVacancy } from "@/lib/vacancies";
import { APPLICATION_FIELDS, CV_MIME_BY_EXT, RECAPTCHA_ACTION, applicationSchema, checkCvFile, fieldErrors } from "./data";
import { buildCandidateEmail } from "./emails/candidate";
import { buildHrEmail } from "./emails/hr";

/* Mismo seam anti-spam que quote/submitQuote.ts: honeypot + tiempo mínimo +
   reCAPTCHA v3 opcional, y revalidación en servidor con el MISMO esquema que
   usa el formulario. */
const MIN_SUBMIT_MS = 1500;
const RECAPTCHA_MIN_SCORE = 0.5;

export type ApplicationResult =
  | { ok: true }
  /* Devuelve el error en vez de lanzarlo: un candidato cuyo CV fue rechazado
     necesita saber qué corregir, no un fallo genérico. */
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

// Un nombre que viene del navegador no se usa nunca tal cual en el store.
function safeFileName(name: string, ext: string): string {
  const base = name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 60);
  return `${base || "resume"}.${ext}`;
}

async function departmentIdBySlug(slug: string | null | undefined): Promise<string | null> {
  if (!slug) return null;
  const rows = await db.select({ id: department.id }).from(department).where(eq(department.slug, slug)).limit(1);
  return rows[0]?.id ?? null;
}

// Solo utm_source (o "ref" como alias corto): un candidato nunca lo escribe
// a mano, así que basta con acotar el charset y el largo.
function readSource(raw: string): string {
  return raw.trim().slice(0, 60).replace(/[^a-zA-Z0-9._-]/g, "");
}

export async function submitApplication(form: FormData): Promise<ApplicationResult> {
  /* El bot recibe un ok: decirle qué lo delató es enseñarle a pasar. */
  const startedAt = Number(readString(form, "startedAt"));
  const tooFast = Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_SUBMIT_MS;
  const flagged = await isFlaggedByRecaptcha(readString(form, "recaptchaToken") || undefined);
  if (readString(form, "company_website") || tooFast || flagged) return { ok: true };

  const raw = Object.fromEntries(APPLICATION_FIELDS.map((field) => [field, readString(form, field)]));
  const parsed = applicationSchema.safeParse(raw);
  const fields = parsed.success ? {} : fieldErrors(parsed.error);

  const cvValue = form.get("cv");
  const cv = cvValue instanceof File ? cvValue : null;
  const cvCheck = checkCvFile(cv);
  if (!cvCheck.ok) fields.cv = cvCheck.message;

  if (!parsed.success || !cvCheck.ok || !cv) {
    return { ok: false, message: "Check the highlighted fields.", fields };
  }
  const data = parsed.data;

  const vacancySlug = readString(form, "vacancySlug");
  const vacancy = vacancySlug ? await getPublishedVacancy(vacancySlug) : null;
  if (vacancySlug && !vacancy) {
    return { ok: false, message: "That position just closed. You can still send an open application." };
  }

  const departmentId = await departmentIdBySlug(vacancy ? vacancy.departmentSlug : data.departmentSlug);
  const departmentLabel = vacancy?.departmentShortLabel ?? null;
  const source = readSource(readString(form, "source"));

  const id = crypto.randomUUID();
  const resumeName = safeFileName(cv.name, cvCheck.ext);
  const contentType = CV_MIME_BY_EXT[cvCheck.ext];
  const bytes = Buffer.from(await cv.arrayBuffer());

  let blob;
  try {
    // Privado: un CV es dato personal y no debe servirse por URL pública.
    // Store dedicado (no el de imágenes del blog): ese es público, este no puede serlo.
    blob = await put(`resumes/${id}/${resumeName}`, bytes, {
      access: "private",
      contentType,
      addRandomSuffix: true,
      token: requireEnv("VACANCIES_READ_WRITE_TOKEN"),
    });
  } catch (error) {
    console.error("[apply] blob upload failed:", error);
    return { ok: false, message: "We could not store your resume. Please try again in a moment." };
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(application).values({
        id,
        vacancyId: vacancy?.id ?? null,
        vacancyTitle: vacancy?.title ?? null,
        departmentId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        experience: data.experience,
        english: data.english,
        availability: data.availability,
        message: data.message,
        source,
        resumeUrl: blob.url,
        resumePathname: blob.pathname,
        resumeName,
        resumeSize: cv.size,
        resumeType: contentType,
      });
      await tx.insert(applicationStatusHistory).values({ applicationId: id, fromStatus: null, toStatus: "new" });
    });
  } catch (error) {
    console.error("[apply] insert failed:", error);
    await del(blob.url, { token: requireEnv("VACANCIES_READ_WRITE_TOKEN") }).catch(() => undefined);
    return { ok: false, message: "We could not save your application. Please try again in a moment." };
  }

  /* Correos best-effort: la postulación ya está guardada y visible en el panel. */
  const target = vacancy?.title ?? "Talent pool";
  const isPool = !vacancy;
  const poolDepartment = isPool && departmentId
    ? (await db.select({ shortLabel: department.shortLabel }).from(department).where(eq(department.id, departmentId)).limit(1))[0]?.shortLabel ?? null
    : departmentLabel;

  const hrInbox = (process.env.RESEND_TO_HR ?? process.env.RESEND_TO ?? "labsmindware@gmail.com")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  const hr = buildHrEmail({
    id,
    target,
    isPool,
    departmentLabel: poolDepartment,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    city: data.city,
    experience: data.experience,
    english: data.english,
    availability: data.availability,
    message: data.message,
    resumeName,
    resumeSize: cv.size,
    adminUrl: `${siteUrl()}/admin/applications/${id}`,
  });
  const candidate = buildCandidateEmail({
    firstName: data.fullName.split(/\s+/)[0] ?? data.fullName,
    target,
    isPool,
    openingsUrl: `${siteUrl()}/join-us`,
  });

  const results = await Promise.allSettled([
    sendEmail({ ...hr, to: hrInbox, replyTo: data.email, attachments: [{ filename: resumeName, content: bytes }] }),
    sendEmail({ ...candidate, to: data.email }),
  ]);
  for (const result of results) {
    if (result.status === "rejected") console.error("[apply] email failed:", result.reason);
  }

  return { ok: true };
}
