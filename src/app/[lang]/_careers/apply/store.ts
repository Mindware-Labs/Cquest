import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/* SEAM DE RETENCIÓN. Hoy es un driver de sistema de archivos; cambiar a Vercel
   Blob, S3 o Supabase toca este archivo y ningún otro.

   Todo aquí es best-effort por diseño: cuando esto corre, el correo a Capital
   Humano YA salió, así que un disco lleno o un filesystem de solo lectura
   (serverless) se registra y se traga. Nunca puede costar una postulación real. */

export type StoredApplication = {
  receivedAt: string;
  positionSlug: string;
  positionTitle: string;
  locale: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  experience: string;
  english: string;
  availability: string;
  message: string;
  cvFileName: string;
};

/* Fuera del árbol público a propósito: este directorio guarda datos personales
   (Ley 172-13) y NO debe ser servible por web. En producción, un volumen
   montado vía APPLICATIONS_DIR. */
export const APPLICATIONS_DIR =
  process.env.APPLICATIONS_DIR ?? path.join(process.cwd(), ".data", "applications");

/* Un nombre de archivo que venga del navegador no se usa nunca tal cual: es la
   entrada más directa a un path traversal (`../../`). */
function safeSegment(value: string, fallback: string): string {
  const cleaned = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 60);
  return cleaned || fallback;
}

export async function storeApplication(
  record: StoredApplication,
  cv: { name: string; bytes: Uint8Array },
): Promise<void> {
  try {
    const stamp = record.receivedAt.replace(/[:.]/g, "-");
    const folder = path.join(
      APPLICATIONS_DIR,
      `${stamp}-${safeSegment(record.fullName, "candidato")}`,
    );
    await mkdir(folder, { recursive: true });
    await writeFile(
      path.join(folder, "application.json"),
      JSON.stringify(record, null, 2),
      "utf8",
    );
    await writeFile(path.join(folder, safeSegment(cv.name, "cv.pdf")), cv.bytes);
  } catch (error) {
    console.error("[careers] no se pudo archivar la postulación", error);
  }
}
