import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { adminSessionOrNull } from "@/lib/auth-guard";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      /* Sin onUploadCompleted: Vercel no puede llamar de vuelta a localhost y la
         subida se queda esperando. El artículo ya guarda la URL al guardarse. */
      // Se firma el token solo con sesión de admin: sin esto cualquiera sube.
      onBeforeGenerateToken: async () => {
        const session = await adminSessionOrNull();
        if (!session) throw new Error("Sin permiso para subir archivos.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo subir el archivo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
