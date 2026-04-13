import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { JobApplicationForm } from "@/components/jobs/job-application-form";
import {
  Briefcase, MapPin, Clock, DollarSign, Building,
  Calendar, Users, ExternalLink, ArrowLeft,
} from "lucide-react";
import { getInitials, formatDate, timeAgo } from "@/lib/utils";

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = session?.user?.id;

  const job = await db.job.findUnique({
    where: { id: params.id, status: "ACTIVE" },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          companyLogo: true,
          companyDescription: true,
          companyWebsite: true,
        },
      },
      _count: { select: { applications: true } },
    },
  });

  if (!job) notFound();

  // Check if already applied
  const existingApplication = userId
    ? await db.jobApplication.findUnique({
        where: { studentId_jobId: { studentId: userId, jobId: params.id } },
      })
    : null;

  // Increment view
  await db.job.update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Înapoi la joburi
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-16 h-16 rounded-2xl flex-shrink-0">
                  <AvatarImage src={job.company.companyLogo ?? ""} />
                  <AvatarFallback className="rounded-2xl bg-blue-50 text-blue-600 text-xl">
                    {getInitials(job.company.name ?? "C")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge>{JOB_TYPE_LABELS[job.type]}</Badge>
                    {job.isRemote && <Badge variant="success">Remote</Badge>}
                    {job.isFeatured && <Badge variant="default">Featured</Badge>}
                  </div>
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  <p className="text-muted-foreground text-lg">{job.company.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {job.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" /> {job.salary}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" /> {job._count.applications} aplicanți
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" /> {timeAgo(job.createdAt)}
                </div>
              </div>

              {job.deadline && (
                <div className="flex items-center gap-2 text-sm text-orange-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  Deadline: {formatDate(job.deadline)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Descrierea jobului</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap text-muted-foreground">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Cerințe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground text-sm">{job.requirements}</p>
            </CardContent>
          </Card>

          {job.benefits && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Beneficii</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground text-sm">{job.benefits}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Apply card */}
          <Card className="border-0 shadow-sm sticky top-4">
            <CardContent className="p-6">
              {existingApplication ? (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-medium mb-1">Ai aplicat deja!</p>
                  <Badge variant="info">
                    Status: {existingApplication.status}
                  </Badge>
                </div>
              ) : (
                <JobApplicationForm jobId={params.id} jobTitle={job.title} />
              )}
            </CardContent>
          </Card>

          {/* Company card */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">Despre Companie</p>
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-10 h-10 rounded-xl">
                  <AvatarImage src={job.company.companyLogo ?? ""} />
                  <AvatarFallback className="rounded-xl">{getInitials(job.company.name ?? "C")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{job.company.name}</p>
                  <p className="text-xs text-muted-foreground">{job.domain}</p>
                </div>
              </div>
              {job.company.companyDescription && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {job.company.companyDescription}
                </p>
              )}
              {job.company.companyWebsite && (
                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                  <a href={job.company.companyWebsite} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" /> Website companie
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
