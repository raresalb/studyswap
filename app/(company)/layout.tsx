import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CompanySidebar } from "@/components/layout/company-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-nav";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "COMPANY" && role !== "ADMIN") redirect("/feed");

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <CompanySidebar />
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}
