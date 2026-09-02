import type { Metadata } from "next";
import { listDepartments } from "@/server/departments";
import DepartmentsView from "./DepartmentsView";

export const metadata: Metadata = {
  title: "Departments · Center Quest Admin",
  robots: { index: false, follow: false },
};

export default async function DepartmentsPage() {
  const departments = await listDepartments();
  return <DepartmentsView departments={departments} />;
}
