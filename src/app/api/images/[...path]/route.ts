import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

// Sin auth a propósito: una portada es contenido público; es /api/admin/upload el que necesita sesión, no la lectura.
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.join("/");

  // Acota a la carpeta donde escribe blob.ts; sin esto sería un lector genérico del store privado si algún día se guarda ahí algo no público. Se comprueba sobre el pathname UNIDO, la cadena que realmente recibe get().
  if (!pathname.startsWith("posts/") || pathname.includes("..")) {
    return NextResponse.json({ error: "Imagen no encontrada." }, { status: 404 });
  }

  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: "Imagen no encontrada." }, { status: 404 });
  }

  // next/image consume esta ruta y rechaza el archivo si Content-Type no llega correcto; por eso blob.ts lo fija explícitamente al subir.
  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      // El nombre ya lleva timestamp + sufijo aleatorio de Blob y nunca se reescribe: cachear "para siempre" es seguro.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
