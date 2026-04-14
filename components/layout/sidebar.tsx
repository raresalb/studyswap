"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/logo";
import {
  BookOpen,
  Briefcase,
  Home,
  MessageSquare,
  Users,
  Wallet,
  GraduationCap,
  Sparkles,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { useState } from "react";

const studentNav = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/marketplace", label: "Materiale", icon: BookOpen },
  { href: "/tutoring", label: "Tutoriat", icon: GraduationCap },
  { href: "/jobs", label: "Joburi", icon: Briefcase },
  { href: "/wallet", label: "Portofel", icon: Wallet },
  { href: "/community", label: "Comunitate", icon: Users },
  { href: "/messages", label: "Mesaje", icon: MessageSquare },
  { href: "/ai", label: "AI Asistent", icon: Sparkles },
];

const companyNav = [
  { href: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/company/jobs", label: "Oferte de muncă", icon: Briefcase },
  { href: "/company/messages", label: "Mesaje", icon: MessageSquare },
];

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/materials", label: "Materiale", icon: BookOpen },
  { href: "/admin/users", label: "Utilizatori", icon: Users },
  { href: "/admin/withdrawals", label: "Retrageri", icon: Wallet },
  { href: "/admin/jobs", label: "Joburi", icon: Briefcase },
];

interface SidebarProps {
  unreadMessages?: number;
  unreadNotifications?: number;
}

export function Sidebar({ unreadMessages = 0, unreadNotifications = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const role = (session?.user as { role?: string })?.role ?? "STUDENT";

  const navItems =
    role === "ADMIN" ? adminNav : role === "COMPANY" ? companyNav : studentNav;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-card border-r border-border overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center px-4 py-5 border-b border-border">
        <Logo
          iconSize={30}
          showText={!collapsed}
          textClassName="text-base whitespace-nowrap"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const showBadge =
            (item.href.includes("messages") && unreadMessages > 0) ||
            (item.href.includes("notifications") && unreadNotifications > 0);

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {showBadge && (
                  <Badge
                    variant="destructive"
                    className="ml-auto text-xs px-1.5 py-0.5 h-5"
                  >
                    {item.href.includes("messages") ? unreadMessages : unreadNotifications}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-border px-2 py-3">
        <Link href={session?.user?.id ? `/profile/${session.user.id}` : "/feed"}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={session?.user?.image ?? ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(session?.user?.name ?? "U")}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">
                    {session?.user?.name ?? "Utilizator"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-accent transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
}
