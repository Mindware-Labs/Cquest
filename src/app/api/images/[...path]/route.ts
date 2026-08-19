import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

/* El store de Blob es privado — esta Function es la única pieza con el
   token, y retransmite el archivo al navegador. A propósito sin auth aquí:
   una portada de artículo es contenido público, es el endpoint de SUBIDA
   (/api/admin/upload) el que necesita sesión, no el de lectura. */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.join("/");

  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: "Imagen no encontrada." }, { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      /* El nombre del archivo ya lleva timestamp + sufijo aleatorio de Blob:
         nunca se reescribe, así que cachear "para siempre" es seguro. */
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
