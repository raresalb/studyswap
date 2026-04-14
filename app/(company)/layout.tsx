import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CompanySidebar } from "@/components/layout/company-sidebar";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "COMPANY" && role !== "ADMIN") redirect("/feed");

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <CompanySidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
