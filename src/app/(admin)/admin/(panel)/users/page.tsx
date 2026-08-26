import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import { listAdminUsers } from "@/server/admin-users";
import UsersView, { type AdminUser } from "./UsersView";

export const metadata: Metadata = {
  title: "Usuarios · Panel Center Quest",
  robots: { index: false, follow: false },
};

export default async function UsersPage() {
  const session = await requireAdmin();
  const result = await listAdminUsers();

  // Solo lo que la vista pinta: el resto no tiene por qué cruzar al cliente.
  const users: AdminUser[] = (result.users ?? []).map((user) => ({
    id: user.id,
    name: user.name ?? "",
    email: user.email,
    banned: Boolean(user.banned),
    createdAt: new Date(user.createdAt).toISOString(),
  }));

  return <UsersView users={users} currentUserId={session.user.id} />;
}
