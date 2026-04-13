import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UpdateApplicationStatus } from "@/components/company/update-application-status";
import {
  Briefcase, Users, Eye, Plus, TrendingUp,
} from "lucide-react";
import { getInitials, timeAgo, formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Aplicat",
  REVIEWING: "În revizuire",
  INTERVIEW: "Interviu",
  ACCEPTED: "Acceptat",
  REJECTED: "Respins",
};

const STATUS_VARIANT: Record<string, string> = {
  APPLIED: "secondary",
  REVIEWING: "info",
  INTERVIEW: "warning",
  ACCEPTED: "success",
  REJECTED: "destructive",
};

export default async function CompanyDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [activeJobsCount, totalApplications, totalViews, recentApplications] =
    await Promise.all([
      db.job.count({ where: { companyId: userId, status: "ACTIVE" } }),
      db.jobApplication.count({ where: { job: { companyId: userId } } }),
      db.job
        .aggregate({ where: { companyId: userId }, _sum: { viewCount: true } })
        .then((r) => r._sum.viewCount ?? 0),
      db.jobApplication.findMany({
        where: { job: { companyId: userId } },
        orderBy: { createdAt: "desc" },
        take: 15,
        include: {
          student: { select: { id: true, name: true, image: true, university: true } },
          job: { select: { id: true, title: true } },
        },
      }),
    ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Companie</h1>
          <p className="text-muted-foreground">Gestionează ofertele și aplicările</p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/company/jobs/post" className="gap-2">
            <Plus className="w-4 h-4" /> Postează Job
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Joburi active", value: activeJobsCount, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Total aplicări", value: totalApplications, icon: Users, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
          { label: "Vizualizări totale", value: totalViews, icon: Eye, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent applications */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Aplicări Recente</CardTitle>
          <CardDescription>Candidații care au aplicat la ofertele tale</CardDescription>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nicio aplicare încă</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href="/company/jobs/post">Postează primul tău job</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center gap-4 p-3 rounded-xl border bg-muted/30">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={app.student.image ?? ""} />
                    <AvatarFallback className="text-xs">
                      {getInitials(app.student.name ?? "S")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{app.student.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {app.job.title}
                      {app.student.university ? ` • ${app.student.university}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{timeAgo(app.createdAt)}</span>
                    <UpdateApplicationStatus
                      applicationId={app.id}
                      currentStatus={app.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
