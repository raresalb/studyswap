"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Bell, Moon, Sun, Settings, LogOut, User, Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  unreadNotifications?: number;
}

export function Header({ unreadNotifications = 0 }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const credits = (session?.user as { credits?: number })?.credits ?? 0;

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 flex-shrink-0">
      {/* Logo - mobile only */}
      <div className="md:hidden">
        <Logo iconSize={26} textClassName="text-sm" />
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Credits */}
        <Link href="/wallet">
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-2.5 py-1.5 rounded-lg text-sm font-semibold">
            <Coins className="w-3.5 h-3.5" />
            <span>{credits.toLocaleString()}</span>
          </div>
        </Link>

        {/* Dark mode */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="w-8 h-8 relative" asChild>
          <Link href="/settings">
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
              >
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </Badge>
            )}
          </Link>
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full p-0">
              <Avatar className="w-8 h-8">
                <AvatarImage src={session?.user?.image ?? ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(session?.user?.name ?? "U")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={session?.user?.id ? `/profile/${session.user.id}` : "/feed"} className="gap-2">
                <User className="w-4 h-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
