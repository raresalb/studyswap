import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase, MapPin, Clock, DollarSign, Search,
  Bookmark, BookmarkCheck, TrendingUp,
} from "lucide-react";
import { JOB_DOMAINS, getInitials, timeAgo } from "@/lib/utils";
import type { JobType } from "@prisma/client";

interface SearchParams {
  domain?: string;
  type?: string;
  search?: string;
  remote?: string;
}

const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const JOB_TYPE_COLORS: Record<JobType, string> = {
  FULL_TIME: "info",
  PART_TIME: "secondary",
  INTERNSHIP: "warning",
  FREELANCE: "outline",
  REMOTE: "success",
  HYBRID: "secondary",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  const where = {
    status: "ACTIVE" as const,
    ...(searchParams.domain && { domain: searchParams.domain }),
    ...(searchParams.type && { type: searchParams.type as JobType }),
    ...(searchParams.remote === "true" && { isRemote: true }),
    ...(searchParams.search && {
      OR: [
        { title: { contains: searchParams.search, mode: "insensitive" as const } },
        { description: { contains: searchParams.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [jobs, savedJobIds] = await Promise.all([
    db.job.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 20,
      include: {
        company: { select: { name: true, companyLogo: true, companyDescription: true } },
        _count: { select: { applications: true } },
      },
    }),
    userId
      ? db.savedJob.findMany({
          where: { userId },
          select: { jobId: true },
        })
      : [],
  ]);

  const savedSet = new Set(savedJobIds.map((s) => s.jobId));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Joburi & Internshipuri</h1>
          <p className="text-muted-foreground">{jobs.length} oportunități disponibile</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <form>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="search"
                    placeholder="Caută joburi..."
                    defaultValue={searchParams.search}
                    className="pl-9"
                  />
                </div>
                <Button type="submit" className="w-full" size="sm">Caută</Button>
              </form>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Tip Contract</p>
                <div className="space-y-1">
                  {(["INTERNSHIP", "PART_TIME", "FULL_TIME", "FREELANCE", "REMOTE"] as JobType[]).map((type) => (
                    <Link
                      key={type}
                      href={`?type=${type}&domain=${searchParams.domain ?? ""}`}
                    >
                      <div className={`px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                        searchParams.type === type
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}>
                        {JOB_TYPE_LABELS[type]}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Domeniu</p>
                <div className="space-y-1">
                  {JOB_DOMAINS.slice(0, 8).map((domain) => (
                    <Link
                      key={domain}
                      href={`?domain=${encodeURIComponent(domain)}&type=${searchParams.type ?? ""}`}
                    >
                      <div className={`px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                        searchParams.domain === domain
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}>
                        {domain}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <Separator />

              <Link href={`?remote=true&type=${searchParams.type ?? ""}`}>
                <div className={`px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                  searchParams.remote === "true" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}>
                  <TrendingUp className="w-4 h-4" /> Remote only
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Jobs list */}
        <div className="lg:col-span-3 space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">Niciun job găsit</h3>
              <p className="text-muted-foreground">Încearcă alte filtre sau revino mai târziu.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className={`card-hover border-0 shadow-sm ${job.isFeatured ? "ring-2 ring-primary/20" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 rounded-xl flex-shrink-0">
                      <AvatarImage src={job.company.companyLogo ?? ""} />
                      <AvatarFallback className="rounded-xl bg-blue-50 text-blue-600">
                        {getInitials(job.company.name ?? "C")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {job.isFeatured && (
                              <Badge className="bg-gradient-to-r from-violet-600 to-blue-500 text-white border-0 text-xs">
                                Featured
                              </Badge>
                            )}
                            <Badge variant={JOB_TYPE_COLORS[job.type] as "info"}>
                              {JOB_TYPE_LABELS[job.type]}
                            </Badge>
                          </div>
                          <Link href={`/dashboard/jobs/${job.id}`}>
                            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                              {job.title}
                            </h3>
                          </Link>
                          <p className="text-muted-foreground">{job.company.name}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <form action={`/api/jobs/${job.id}/save`} method="POST">
                            <button type="submit" className="p-2 rounded-lg hover:bg-muted transition-colors">
                              {savedSet.has(job.id) ? (
                                <BookmarkCheck className="w-4 h-4 text-primary" />
                              ) : (
                                <Bookmark className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </form>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {job.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                          </span>
                        )}
                        {job.isRemote && (
                          <Badge variant="success" className="text-xs">Remote</Badge>
                        )}
                        {job.salary && (
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {timeAgo(job.createdAt)}
                        </span>
                        <span>{job._count.applications} aplicanți</span>
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex items-center gap-3 mt-4">
                        <Button variant="gradient" size="sm" asChild>
                          <Link href={`/dashboard/jobs/${job.id}`}>Aplică acum</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/jobs/${job.id}`}>Vezi detalii</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
