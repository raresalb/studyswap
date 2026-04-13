import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DownloadButton } from "@/components/marketplace/download-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Download, Eye, BookOpen, Calendar, Globe } from "lucide-react";
import { getInitials, formatDate, timeAgo } from "@/lib/utils";
import Link from "next/link";

export default async function MaterialDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = session?.user?.id;

  const material = await db.material.findUnique({
    where: { id: params.id, status: "APPROVED" },
    include: {
      author: {
        select: { id: true, name: true, image: true, university: true, faculty: true },
      },
      reviews: {
        include: { author: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { reviews: true, downloads: true } },
    },
  });

  if (!material) notFound();

  // Check if already downloaded
  const hasDownloaded = userId
    ? !!(await db.download.findUnique({
        where: { userId_materialId: { userId, materialId: params.id } },
      }))
    : false;

  // Increment view count
  await db.material.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-violet-600" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary">{material.category}</Badge>
                    {material.isPremium && <Badge variant="warning">Premium</Badge>}
                    <Badge variant="outline">{material.fileType}</Badge>
                    {material.language && <Badge variant="outline"><Globe className="w-3 h-3" /> {material.language.toUpperCase()}</Badge>}
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{material.title}</h1>
                  <p className="text-muted-foreground">{material.description}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4" /> {material.downloadCount} descărcări
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> {material.viewCount} vizualizări
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {material.avgRating > 0 ? material.avgRating.toFixed(1) : "N/A"} ({material._count.reviews} recenzii)
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> {formatDate(material.createdAt)}
                </span>
              </div>

              {material.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {material.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                Recenzii ({material._count.reviews})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {material.reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Fii primul care lasă o recenzie!
                </p>
              ) : (
                material.reviews.map((review) => (
                  <div key={review.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={review.author.image ?? ""} />
                      <AvatarFallback className="text-xs">
                        {getInitials(review.author.name ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{review.author.name}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{timeAgo(review.createdAt)}</span>
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Download card */}
          <Card className="border-0 shadow-sm sticky top-4">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                {material.creditCost === 0 ? (
                  <>
                    <p className="text-3xl font-bold text-green-600">Gratuit</p>
                    <p className="text-sm text-muted-foreground">Fără costuri</p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-violet-600">{material.creditCost}</p>
                    <p className="text-sm text-muted-foreground">credite</p>
                  </>
                )}
              </div>

              <DownloadButton
                materialId={material.id}
                materialTitle={material.title}
                creditCost={material.creditCost}
                fileUrl={material.fileUrl}
                hasDownloaded={hasDownloaded}
                isOwnMaterial={material.authorId === userId}
              />

              {material.creditCost > 0 && !hasDownloaded && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Nu ai suficiente credite?{" "}
                  <Link href="/dashboard/wallet" className="text-primary hover:underline">
                    Cumpără credite
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Author card */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">Autor</p>
              <Link href={`/dashboard/profile/${material.author.id}`}>
                <div className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={material.author.image ?? ""} />
                    <AvatarFallback>{getInitials(material.author.name ?? "U")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{material.author.name}</p>
                    {material.author.university && (
                      <p className="text-xs text-muted-foreground">{material.author.university}</p>
                    )}
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
