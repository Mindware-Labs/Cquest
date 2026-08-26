import type { Metadata } from "next";
import { listCategories } from "@/server/categories";
import CategoriesView from "./CategoriesView";

export const metadata: Metadata = {
  title: "Categories · Center Quest Admin",
  robots: { index: false, follow: false },
};

/* Búsqueda, orden y página viajan en la URL: es lo que permite resolverlos en
   la consulta en vez de recortar en el cliente una lista ya completa. */
export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string; sort?: string; dir?: string; q?: string }>;
}) {
  const params = await searchParams;

  const sortKey = params.sort === "createdAt" ? "createdAt" : "name";
  const sortDir = params.dir === "desc" ? "desc" : "asc";
  const query = params.q ?? "";

  const { rows, total, page, perPage } = await listCategories({
    page: Number(params.page) || 1,
    perPage: Number(params.perPage) || 10,
    sortKey,
    sortDir,
    query,
  });

  return (
    <CategoriesView
      categories={rows}
      total={total}
      page={page}
      perPage={perPage}
      sortKey={sortKey}
      sortDir={sortDir}
      query={query}
    />
  );
}
