import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, MessageSquare, Building,
} from "lucide-react";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SessionProvider } from "@/components/layout/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { CompanySidebar } from "@/components/layout/company-sidebar";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "COMPANY" && role !== "ADMIN") redirect("/dashboard/feed");

  return (
    <html lang="ro" suppressHydrationWarning>
      <body>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <div className="flex h-screen overflow-hidden bg-muted/30">
              <CompanySidebar />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
