import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import { listAdminUsers } from "@/server/admin-users";
import UsersView from "./UsersView";

export const metadata: Metadata = {
  title: "Users · Center Quest Admin",
  robots: { index: false, follow: false },
};

/* Búsqueda, orden y página viajan en la URL: es lo que permite resolverlos en
   la consulta en vez de recortar en el cliente una lista ya completa. */
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string; sort?: string; dir?: string; q?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;

  const sortKey = params.sort === "name" ? "name" : "createdAt";
  const sortDir = params.dir === "asc" ? "asc" : "desc";
  const query = params.q ?? "";

  const { rows, total, page, perPage } = await listAdminUsers({
    page: Number(params.page) || 1,
    perPage: Number(params.perPage) || 10,
    sortKey,
    sortDir,
    query,
  });

  return (
    <UsersView
      users={rows}
      currentUserId={session.user.id}
      total={total}
      page={page}
      perPage={perPage}
      sortKey={sortKey}
      sortDir={sortDir}
      query={query}
    />
  );
}
