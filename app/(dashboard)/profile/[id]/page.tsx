import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Download,
  Star,
  Users,
  GraduationCap,
  Trophy,
  FileText,
  ExternalLink,
} from "lucide-react";
import { formatDate, getInitials, timeAgo } from "@/lib/utils";
import { FollowButton } from "./follow-button";

interface ProfilePageProps {
  params: { id: string };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUserId = session.user.id;
  const profileId = params.id;

  // Fetch profile user with stats
  const profileUser = await db.user.findUnique({
    where: { id: profileId },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          materials: { where: { status: "APPROVED" } },
        },
      },
    },
  });

  if (!profileUser || profileUser.isBanned) {
    notFound();
  }

  // Fetch approved materials
  const materials = await db.material.findMany({
    where: { authorId: profileId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      title: true,
      category: true,
      creditCost: true,
      downloadCount: true,
      avgRating: true,
      createdAt: true,
      _count: { select: { reviews: true } },
    },
  });

  // Total downloads across all materials
  const downloadStats = await db.material.aggregate({
    where: { authorId: profileId, status: "APPROVED" },
    _sum: { downloadCount: true },
  });

  const totalDownloads = downloadStats._sum.downloadCount ?? 0;

  // Check if current user follows this profile
  const isOwnProfile = currentUserId === profileId;
  let isFollowing = false;

  if (!isOwnProfile) {
    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: profileId,
        },
      },
    });
    isFollowing = !!follow;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile header */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500" />

        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 -mt-14">
            {/* Avatar */}
            <Avatar className="w-24 h-24 border-4 border-background shadow-md">
              <AvatarImage src={profileUser.image ?? ""} />
              <AvatarFallback className="text-2xl bg-violet-100 text-violet-700">
                {getInitials(profileUser.name ?? "U")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 sm:mt-12">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                  {(profileUser.university || profileUser.faculty) && (
                    <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                      <GraduationCap className="w-4 h-4" />
                      {[profileUser.university, profileUser.faculty]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {profileUser.specialization && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {profileUser.specialization}
                      {profileUser.studyYear ? `, Anul ${profileUser.studyYear}` : ""}
                    </p>
                  )}
                </div>

                {!isOwnProfile && (
                  <FollowButton
                    profileId={profileId}
                    initialIsFollowing={isFollowing}
                  />
                )}
                {isOwnProfile && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/settings">Editează profilul</Link>
                  </Button>
                )}
              </div>

              {profileUser.bio && (
                <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
                  {profileUser.bio}
                </p>
              )}

              {/* Interests */}
              {profileUser.interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {profileUser.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}

              {/* External links */}
              <div className="flex gap-3 mt-3">
                {profileUser.linkedinUrl && (
                  <a
                    href={profileUser.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                {profileUser.githubUrl && (
                  <a
                    href={profileUser.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
                {profileUser.portfolioUrl && (
                  <a
                    href={profileUser.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <FileText className="w-4 h-4 text-violet-500" />
              <span className="text-2xl font-bold">{profileUser._count.materials}</span>
            </div>
            <p className="text-xs text-muted-foreground">Materiale</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Download className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-bold">{totalDownloads}</span>
            </div>
            <p className="text-xs text-muted-foreground">Descărcări totale</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-2xl font-bold">{profileUser.reputationPoints}</span>
            </div>
            <p className="text-xs text-muted-foreground">Reputație</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold">{profileUser._count.followers}</span>
            </div>
            <p className="text-xs text-muted-foreground">Urmăritori</p>
          </CardContent>
        </Card>
      </div>

      {/* Materials */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-600" />
            Materiale publicate
          </CardTitle>
          {profileUser._count.materials > 6 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/marketplace?authorId=${profileId}`}>
                Vezi toate ({profileUser._count.materials})
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-sm">Niciun material publicat încă</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {materials.map((material) => (
                <Link
                  key={material.id}
                  href={`/dashboard/marketplace/${material.id}`}
                  className="block"
                >
                  <div className="border rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {material.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs">
                          {material.avgRating > 0
                            ? material.avgRating.toFixed(1)
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-medium text-sm line-clamp-2">
                      {material.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" /> {material.downloadCount}
                      </span>
                      <span>
                        {material.creditCost === 0 ? (
                          <span className="text-green-600 font-medium">Gratuit</span>
                        ) : (
                          <span className="text-violet-600 font-medium">
                            {material.creditCost} cr.
                          </span>
                        )}
                      </span>
                    </div>

                    <Separator />

                    <p className="text-xs text-muted-foreground">
                      {timeAgo(material.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
