import "dotenv/config";
import { z } from "zod";
import { prisma } from "../src/lib/prisma";
import { createAdminUser } from "../src/lib/adminUsers";

// Sin formulario de alta público a propósito: esta es la vía "por consola". Uso: npx tsx prisma/create-admin.ts --email=persona@centerquest.do --name="Nombre" --password="algo-seguro"

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const arg of argv) {
    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (match) out[match[1]] = match[2];
  }
  return out;
}

const inputSchema = z.object({
  email: z.string().trim().email("Email inválido."),
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres."),
});

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const parsed = inputSchema.safeParse(args);

  if (!parsed.success) {
    console.error("Uso: npx tsx prisma/create-admin.ts --email=... --name=... --password=...\n");
    for (const issue of parsed.error.issues) console.error(`- ${issue.path.join(".")}: ${issue.message}`);
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    console.error(`Ya existe un AdminUser con ese email (id ${existing.id}). No se creó ninguno nuevo.`);
    process.exit(1);
  }

  const admin = await createAdminUser(parsed.data);
  console.log(`AdminUser creado: id=${admin.id}, email=${admin.email}, name=${admin.name}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
