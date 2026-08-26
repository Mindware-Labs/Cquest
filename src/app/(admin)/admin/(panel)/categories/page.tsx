import type { Metadata } from "next";
import { listCategories } from "@/server/categories";
import CategoriesView from "./CategoriesView";

export const metadata: Metadata = {
  title: "Categorías · Panel Center Quest",
  robots: { index: false, follow: false },
};

export default async function CategoriesPage() {
  const categories = await listCategories();
  return <CategoriesView categories={categories} />;
}
