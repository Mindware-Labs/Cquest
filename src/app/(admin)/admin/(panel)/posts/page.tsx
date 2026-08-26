import type { Metadata } from "next";
import { listPosts } from "@/server/posts";
import PostsTable from "./PostsTable";
import PostsHeader from "./PostsHeader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Artículos · Panel Center Quest",
  robots: { index: false, follow: false },
};

export default async function PostsPage() {
  const rows = await listPosts();

  return (
    <div className={styles.page}>
      <PostsHeader />
      <PostsTable rows={rows} />
    </div>
  );
}
