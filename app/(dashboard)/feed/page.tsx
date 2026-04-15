import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen, Briefcase, Coins, Download,
  Star, TrendingUp, Sparkles, ArrowRight, Wallet,
} from "lucide-react";
import { getInitials, timeAgo } from "@/lib/utils";


export default async function FeedPage() {
  const session = await auth();
  const userId = session?.user?.id!;

  const [user, recentMaterials, recentJobs, transactions] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, credits: true, totalEarned: true, level: true },
    }),
    db.material.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { author: { select: { name: true, image: true } } },
    }),
    db.job.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { company: { select: { name: true, companyLogo: true } } },
    }),
    db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-2xl p-5 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Hey, {firstName}! 👋</h1>
        <p className="text-violet-200 text-sm mb-4">Keep learning and earning credits today.</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: user?.credits?.toLocaleString() ?? "0", label: "Credits" },
            { value: user?.totalEarned?.toLocaleString() ?? "0", label: "Total earned" },
            { value: `Lvl ${user?.level ?? 1}`, label: "Level" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
              <p className="text-violet-200 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions — mobile only */}
      <div className="grid grid-cols-4 gap-2 sm:hidden">
        {[
          { label: "Upload", href: "/marketplace/upload", icon: BookOpen, color: "text-violet-600 bg-violet-50 dark:bg-violet-950/30" },
          { label: "Credits", href: "/wallet", icon: Wallet, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
          { label: "Tutoring", href: "/tutoring", icon: Star, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
          { label: "Jobs", href: "/jobs", icon: Briefcase, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href}>
              <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl ${a.color} transition-opacity active:opacity-70`}>
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{a.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Recent materials */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-600" />
                Recent Materials
              </h2>
              <Link href="/marketplace" className="text-xs text-violet-600 flex items-center gap-1 hover:underline">
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentMaterials.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No materials yet</p>
              )}
              {recentMaterials.map((m) => (
                <Link key={m.id} href={`/marketplace/${m.id}`}>
                  <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 active:opacity-70 transition-opacity hover:border-violet-200 dark:hover:border-violet-800">
                    <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.category} · {timeAgo(m.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {m.creditCost === 0 ? (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">Free</span>
                      ) : (
                        <span className="text-xs font-semibold text-violet-600">{m.creditCost} cr</span>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-0.5 justify-end mt-0.5">
                        <Download className="w-3 h-3" /> {m.downloadCount}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Jobs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Open Jobs
              </h2>
              <Link href="/jobs" className="text-xs text-violet-600 flex items-center gap-1 hover:underline">
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentJobs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No jobs yet</p>
              )}
              {recentJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 active:opacity-70 transition-opacity hover:border-blue-200 dark:hover:border-blue-800">
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarImage src={job.company.companyLogo ?? ""} />
                      <AvatarFallback className="bg-blue-50 text-blue-600 text-xs">
                        {getInitials(job.company.name ?? "C")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{job.company.name} · {job.location}</p>
                    </div>
                    <span className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                      {job.type.replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar widgets — hidden on mobile (accessed via nav) */}
        <div className="hidden lg:flex flex-col gap-4">

          {/* Recent activity */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Recent Activity
            </h3>
            <div className="space-y-2.5">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs truncate">{tx.description}</span>
                  <span className={`text-xs font-semibold flex-shrink-0 ml-2 ${tx.amount > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount} cr
                  </span>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No activity yet</p>
              )}
            </div>
          </div>

          {/* AI tip */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-100 dark:border-pink-900/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-sm">AI Assistant</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Upload a PDF and get an instant AI summary in seconds!
            </p>
            <Link href="/ai" className="block w-full py-2 rounded-lg bg-white dark:bg-white/10 text-center text-xs font-semibold hover:opacity-80 transition-opacity border border-purple-100 dark:border-purple-900/30">
              Try it now
            </Link>
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Upload material", href: "/marketplace/upload", icon: BookOpen, color: "text-violet-600" },
                { label: "Buy credits", href: "/wallet", icon: Coins, color: "text-amber-600" },
                { label: "Find tutors", href: "/tutoring", icon: Star, color: "text-blue-600" },
                { label: "Apply to job", href: "/jobs", icon: Briefcase, color: "text-emerald-600" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <div className="p-3 rounded-xl border bg-muted/30 hover:bg-muted transition-colors text-center cursor-pointer active:opacity-70">
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${action.color}`} />
                      <p className="text-xs font-medium leading-tight">{action.label}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
