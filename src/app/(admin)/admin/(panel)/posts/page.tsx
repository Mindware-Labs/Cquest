import type { Metadata } from "next";
import { listPosts } from "@/server/posts";
import PostsTable from "./PostsTable";
import PostsHeader from "./PostsHeader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Artículos · Panel Center Quest",
  robots: { index: false, follow: false },
};

/* Página y orden viven en la URL, no en estado del cliente: es lo que permite
   que la consulta las reciba en el servidor, y de paso el atrás del navegador
   y un enlace compartido caen donde deben. */
export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;

  const sortKey = params.sort === "title" ? "title" : "updatedAt";
  const sortDir = params.dir === "asc" ? "asc" : "desc";

  const { rows, total, page, perPage } = await listPosts({
    page: Number(params.page) || 1,
    perPage: Number(params.perPage) || 10,
    sortKey,
    sortDir,
  });

  return (
    <div className={styles.page}>
      <PostsHeader />
      <PostsTable
        rows={rows}
        total={total}
        page={page}
        perPage={perPage}
        sortKey={sortKey}
        sortDir={sortDir}
      />
    </div>
  );
}
