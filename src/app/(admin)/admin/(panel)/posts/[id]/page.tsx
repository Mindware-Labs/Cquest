import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listCategories } from "@/server/categories";
import { getPost } from "@/server/posts";
import PostEditor from "./PostEditor";

export const metadata: Metadata = {
  title: "Editar artículo · Panel Center Quest",
  robots: { index: false, follow: false },
};

export default async function PostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getPost(id), listCategories()]);
  if (!post) notFound();

  return <PostEditor post={post} categories={categories} />;
}
