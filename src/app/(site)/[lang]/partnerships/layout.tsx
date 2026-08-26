import Navbar from "@/components/Navbar";

export default function PartnershipsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
