"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, MessageSquare, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/company/jobs", label: "Oferte de muncă", icon: Briefcase },
  { href: "/company/messages", label: "Mesaje", icon: MessageSquare },
];

export function CompanySidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex flex-col bg-card border-r border-border">
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">SS</span>
          </div>
          <div>
            <span className="font-bold text-sm gradient-text">StudySwap</span>
            <p className="text-xs text-muted-foreground">Cont Companie</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              )}>
                <Icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent w-full transition-colors"
        >
          <LogOut className="w-4 h-4" /> Deconectare
        </button>
      </div>
    </aside>
  );
}
