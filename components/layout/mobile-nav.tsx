"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home, BookOpen, Briefcase, MessageSquare,
  GraduationCap, LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const studentNav = [
  { href: "/feed",        icon: Home,           label: "Feed" },
  { href: "/marketplace", icon: BookOpen,        label: "Materials" },
  { href: "/tutoring",    icon: GraduationCap,   label: "Tutoring" },
  { href: "/jobs",        icon: Briefcase,       label: "Jobs" },
  { href: "/messages",    icon: MessageSquare,   label: "Messages" },
];

const companyNav = [
  { href: "/company/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/company/jobs",      icon: Briefcase,       label: "Jobs" },
  { href: "/company/messages",  icon: MessageSquare,   label: "Messages" },
];

const adminNav = [
  { href: "/admin/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/materials",   icon: BookOpen,        label: "Materials" },
  { href: "/admin/users",       icon: Home,            label: "Users" },
  { href: "/admin/jobs",        icon: Briefcase,       label: "Jobs" },
  { href: "/admin/withdrawals", icon: MessageSquare,   label: "Withdrawals" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? "STUDENT";

  const nav = role === "ADMIN" ? adminNav : role === "COMPANY" ? companyNav : studentNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around px-2 py-1.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 flex-1 py-1.5 min-w-0"
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-br from-violet-600 to-blue-500 shadow-md shadow-violet-500/30"
                    : "hover:bg-muted"
                )}>
                  <Icon className={cn("w-4.5 h-4.5", isActive ? "text-white" : "text-muted-foreground")} style={{ width: 18, height: 18 }} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium truncate w-full text-center",
                  isActive ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
