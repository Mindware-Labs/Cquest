import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 12;

// Sin formulario de alta a propósito: las cuentas admin se crean por seed/consola, nunca por un endpoint público.
export async function createAdminUser(input: { email: string; password: string; name: string }) {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  return prisma.adminUser.create({
    data: { email: input.email, passwordHash, name: input.name },
  });
}

export async function verifyAdminPassword(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return null;

  const valid = await bcrypt.compare(password, admin.passwordHash);
  return valid ? admin : null;
}

// Devuelve el hash, no hace el update: prisma.$transaction([...]) necesita promesas de Prisma ya construidas, no una función async que espera a bcrypt en el medio.
export async function hashAdminPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}
