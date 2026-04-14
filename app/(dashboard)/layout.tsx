import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { db } from "@/lib/db";
import { awardDailyBonus } from "@/lib/credits";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  if (userId) {
    awardDailyBonus(userId).catch(() => {});
  }

  const [unreadMessages, unreadNotifications] = await Promise.all([
    userId ? db.message.count({ where: { receiverId: userId, isRead: false } }) : 0,
    userId ? db.notification.count({ where: { userId, isRead: false } }) : 0,
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar
          unreadMessages={unreadMessages}
          unreadNotifications={unreadNotifications}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header unreadNotifications={unreadNotifications} />
        {/* Extra bottom padding on mobile for the bottom nav bar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}
