import { NextResponse } from "next/server";
import { getCurrentAdminId } from "@/lib/auth";
import { UploadValidationError, uploadCoverImage } from "@/lib/blob";

/* Endpoint público que escribe (y cuesta) storage — nunca se atiende un
   upload sin sesión válida, sin excepción. */
export async function POST(request: Request) {
  try {
    await getCurrentAdminId();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  }

  try {
    const url = await uploadCoverImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "No se pudo subir el archivo." }, { status: 500 });
  }
}
