import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Heart,
  Plus,
  Eye,
  TrendingUp,
  Users,
} from "lucide-react";
import { MATERIAL_CATEGORIES, getInitials, timeAgo } from "@/lib/utils";

interface SearchParams {
  category?: string;
}

// Category badge colors by index
const CATEGORY_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
];

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const category = searchParams.category;

  const posts = await db.forumPost.findMany({
    where: {
      status: "ACTIVE",
      ...(category && { category }),
    },
    orderBy: [{ likeCount: "desc" }, { createdAt: "desc" }],
    take: 30,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          university: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });

  // Top categories for filter
  const categories = MATERIAL_CATEGORIES.slice(0, 12);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comunitate</h1>
          <p className="text-muted-foreground">
            {posts.length} postări{category ? ` în ${category}` : ""}
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/dashboard/community/new" className="gap-2">
            <Plus className="w-4 h-4" /> Postează
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Categorii
              </p>
              <Link
                href="/dashboard/community"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  !category
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Toate
                </span>
              </Link>
              {categories.map((cat, i) => (
                <Link
                  key={cat}
                  href={`?category=${encodeURIComponent(cat)}`}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                      CATEGORY_COLORS[i % CATEGORY_COLORS.length]
                        .split(" ")[0]
                        .replace("bg-", "bg-")
                    }`}
                  />
                  {cat}
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Community stats */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Statistici
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-violet-500" />
                <span className="text-muted-foreground">Comunitate activă</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span className="text-muted-foreground">{posts.length} postări</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts list */}
        <div className="lg:col-span-3 space-y-3">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-40" />
              <h3 className="font-medium text-lg mb-2">Nicio postare găsită</h3>
              <p className="text-muted-foreground mb-4">
                {category
                  ? `Nu există postări în categoria "${category}" momentan.`
                  : "Fii primul care postează în comunitate!"}
              </p>
              <Button variant="gradient" asChild>
                <Link href="/dashboard/community/new" className="gap-2">
                  <Plus className="w-4 h-4" /> Creează prima postare
                </Link>
              </Button>
            </div>
          ) : (
            posts.map((post, i) => {
              const colorClass =
                CATEGORY_COLORS[
                  (MATERIAL_CATEGORIES.indexOf(post.category as typeof MATERIAL_CATEGORIES[number]) + MATERIAL_CATEGORIES.length) %
                    CATEGORY_COLORS.length
                ] ?? CATEGORY_COLORS[0];

              return (
                <Card key={post.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Author avatar */}
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarImage src={post.author.image ?? ""} />
                        <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                          {getInitials(post.author.name ?? "U")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        {/* Category + title */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}
                          >
                            {post.category}
                          </span>
                          {post.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <Link href={`/dashboard/community/${post.id}`}>
                          <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2 mb-1">
                            {post.title}
                          </h3>
                        </Link>

                        {/* Author + time */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <span className="font-medium text-foreground">
                            {post.author.name}
                          </span>
                          {post.author.university && (
                            <>
                              <span>·</span>
                              <span>{post.author.university}</span>
                            </>
                          )}
                          <span>·</span>
                          <span>{timeAgo(post.createdAt)}</span>
                        </div>

                        <Separator className="mb-3" />

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5" />
                            {post._count.likes} aprecieri
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {post._count.comments} comentarii
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            {post.viewCount} vizualizări
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
