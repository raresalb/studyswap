import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Users, MapPin, Clock } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { CloseJobButton } from "@/components/company/close-job-button";

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time", PART_TIME: "Part-time", INTERNSHIP: "Internship",
  FREELANCE: "Freelance", REMOTE: "Remote", HYBRID: "Hybrid",
};

export default async function CompanyJobsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jobs = await db.job.findMany({
    where: { companyId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ofertele Mele</h1>
          <p className="text-muted-foreground">{jobs.length} oferte postate</p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/company/jobs/post" className="gap-2">
            <Plus className="w-4 h-4" /> Postează Job
          </Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Nu ai nicio ofertă postată încă.</p>
          <Button variant="gradient" asChild>
            <Link href="/company/jobs/post">Postează primul job</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={job.status === "ACTIVE" ? "success" : "secondary"}>
                        {job.status === "ACTIVE" ? "Activ" : job.status === "CLOSED" ? "Închis" : "Draft"}
                      </Badge>
                      <Badge variant="outline">{JOB_TYPE_LABELS[job.type]}</Badge>
                      {job.isFeatured && <Badge>Featured</Badge>}
                    </div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {job.viewCount} vizualizări
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {job._count.applications} aplicanți
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {timeAgo(job.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/jobs/${job.id}`}>Previzualizare</Link>
                    </Button>
                    {job.status === "ACTIVE" && (
                      <CloseJobButton jobId={job.id} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
