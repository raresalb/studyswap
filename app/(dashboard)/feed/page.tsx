import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Briefcase,
  Coins,
  Download,
  Star,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { getInitials, timeAgo, formatCredits } from "@/lib/utils";

export default async function FeedPage() {
  const session = await auth();
  const userId = session?.user?.id!;

  const [user, recentMaterials, recentJobs, transactions] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, credits: true, totalEarned: true, reputationPoints: true, level: true },
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Bună, {user?.name?.split(" ")[0]}! 👋</h1>
        <p className="text-violet-100 mb-4">Continuă să înveți și să câștigi credite astăzi.</p>
        <div className="flex gap-6">
          <div>
            <p className="text-3xl font-bold">{user?.credits?.toLocaleString()}</p>
            <p className="text-violet-200 text-sm">Credite disponibile</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{user?.totalEarned?.toLocaleString()}</p>
            <p className="text-violet-200 text-sm">Total câștigat</p>
          </div>
          <div>
            <p className="text-3xl font-bold">Niv. {user?.level}</p>
            <p className="text-violet-200 text-sm">Nivel reputație</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent materials */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-600" />
              Materiale Recente
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/marketplace" className="gap-1">
                Vezi toate <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {recentMaterials.map((m) => (
              <Link key={m.id} href={`/dashboard/marketplace/${m.id}`}>
                <Card className="card-hover border-0 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{m.title}</p>
                      <p className="text-sm text-muted-foreground">{m.category} • {timeAgo(m.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-sm">
                        {m.creditCost === 0 ? (
                          <Badge variant="success">Gratuit</Badge>
                        ) : (
                          <span className="text-violet-600">{m.creditCost} cr.</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Download className="w-3 h-3" /> {m.downloadCount}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Recent Jobs */}
          <div className="flex items-center justify-between mt-6">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Joburi Disponibile
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/jobs" className="gap-1">
                Vezi toate <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {recentJobs.map((job) => (
              <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                <Card className="card-hover border-0 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={job.company.companyLogo ?? ""} />
                      <AvatarFallback className="bg-blue-50 text-blue-600">
                        {getInitials(job.company.name ?? "C")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.company.name} • {job.location}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="info">{job.type.replace("_", " ")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-4">
          {/* Quick stats */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Activitate Recentă
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate">{tx.description}</span>
                  <span className={tx.amount > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount} cr.
                  </span>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Nicio activitate încă
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI tip */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-sm">AI Asistent</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Încearcă funcția de rezumat AI — uploadează un PDF și primești rezumatul în secunde!
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/ai">Încearcă acum</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Acțiuni Rapide</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { label: "Uploadează material", href: "/dashboard/marketplace/upload", icon: BookOpen, color: "text-violet-600" },
                { label: "Cumpără credite", href: "/dashboard/wallet", icon: Coins, color: "text-yellow-600" },
                { label: "Caută tutori", href: "/dashboard/tutoring", icon: Star, color: "text-blue-600" },
                { label: "Aplică la job", href: "/dashboard/jobs", icon: Briefcase, color: "text-green-600" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <div className="p-3 rounded-lg border bg-muted/30 hover:bg-muted transition-colors text-center cursor-pointer">
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${action.color}`} />
                      <p className="text-xs font-medium leading-tight">{action.label}</p>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
