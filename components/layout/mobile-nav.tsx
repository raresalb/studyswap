"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home, BookOpen, Briefcase, MessageSquare,
  Wallet, Sparkles, LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const studentNav = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/marketplace", icon: BookOpen, label: "Materiale" },
  { href: "/jobs", icon: Briefcase, label: "Joburi" },
  { href: "/messages", icon: MessageSquare, label: "Mesaje" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
];

const companyNav = [
  { href: "/company/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/company/jobs", icon: Briefcase, label: "Joburi" },
  { href: "/company/messages", icon: MessageSquare, label: "Mesaje" },
];

const adminNav = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/materials", icon: BookOpen, label: "Materiale" },
  { href: "/admin/users", icon: Home, label: "Utilizatori" },
  { href: "/admin/jobs", icon: Briefcase, label: "Joburi" },
  { href: "/ai", icon: Sparkles, label: "AI" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? "STUDENT";

  const nav = role === "ADMIN" ? adminNav : role === "COMPANY" ? companyNav : studentNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[56px]",
                isActive
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                isActive ? "bg-violet-100 dark:bg-violet-900/40" : ""
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
