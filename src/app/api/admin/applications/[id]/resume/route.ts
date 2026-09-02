import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { application } from "@/db/schema/careers";
import { adminSessionOrNull } from "@/lib/auth-guard";
import { requireEnv } from "@/lib/env";

/* El CV vive en un blob privado: esta ruta es la única puerta, y solo abre
   con sesión de admin. /api queda fuera del proxy, así que se comprueba aquí. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await adminSessionOrNull();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new NextResponse("Not found", { status: 404 });

  const rows = await db
    .select({ url: application.resumeUrl, name: application.resumeName, type: application.resumeType })
    .from(application)
    .where(eq(application.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return new NextResponse("Not found", { status: 404 });

  let result;
  try {
    result = await get(row.url, { access: "private", useCache: false, token: requireEnv("VACANCIES_READ_WRITE_TOKEN") });
  } catch (error) {
    console.error("[applications] could not read resume:", error);
    return new NextResponse("Resume unavailable", { status: 502 });
  }
  if (!result || !result.stream) return new NextResponse("Not found", { status: 404 });

  const download = new URL(request.url).searchParams.get("download") === "1";
  const ascii = row.name.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": row.type || "application/octet-stream",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(row.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
