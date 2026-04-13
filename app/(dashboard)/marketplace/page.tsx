import { Suspense } from "react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen, Download, Plus, Search, Star, Filter,
} from "lucide-react";
import { MATERIAL_CATEGORIES, getInitials, timeAgo } from "@/lib/utils";
import type { MaterialStatus } from "@prisma/client";

interface SearchParams {
  category?: string;
  search?: string;
  sort?: string;
  page?: string;
}

async function MaterialsList({ searchParams }: { searchParams: SearchParams }) {
  const category = searchParams.category;
  const search = searchParams.search;
  const sort = searchParams.sort ?? "newest";
  const page = parseInt(searchParams.page ?? "1");
  const limit = 12;

  const where = {
    status: "APPROVED" as MaterialStatus,
    ...(category && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { tags: { has: search } },
      ],
    }),
  };

  const orderBy =
    sort === "popular"
      ? { downloadCount: "desc" as const }
      : sort === "rating"
      ? { avgRating: "desc" as const }
      : { createdAt: "desc" as const };

  const [materials, total] = await Promise.all([
    db.material.findMany({
      where,
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        author: { select: { name: true, image: true, university: true } },
        _count: { select: { reviews: true } },
      },
    }),
    db.material.count({ where }),
  ]);

  if (materials.length === 0) {
    return (
      <div className="col-span-full text-center py-16">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">Niciun material găsit</h3>
        <p className="text-muted-foreground">Fii primul care uploadează în această categorie!</p>
        <Button variant="gradient" className="mt-4" asChild>
          <Link href="/dashboard/marketplace/upload">
            <Plus className="w-4 h-4" /> Upload Material
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {materials.map((m) => (
        <Link key={m.id} href={`/dashboard/marketplace/${m.id}`}>
          <Card className="card-hover border-0 shadow-sm h-full">
            <CardContent className="p-5">
              {/* File type icon */}
              <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-violet-600" />
              </div>

              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary" className="text-xs">{m.category}</Badge>
                {m.isPremium && <Badge variant="warning" className="text-xs">Premium</Badge>}
              </div>

              <h3 className="font-semibold mb-1 line-clamp-2">{m.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{m.description}</p>

              {/* Author */}
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={m.author.image ?? ""} />
                  <AvatarFallback className="text-xs">{getInitials(m.author.name ?? "U")}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{m.author.name}</span>
                {m.author.university && (
                  <span className="text-xs text-muted-foreground">• {m.author.university}</span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" /> {m.downloadCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {m.avgRating > 0 ? m.avgRating.toFixed(1) : "N/A"}
                  </span>
                </div>
                <div className="font-semibold text-sm">
                  {m.creditCost === 0 ? (
                    <Badge variant="success">Gratuit</Badge>
                  ) : (
                    <span className="text-violet-600">{m.creditCost} credite</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}

      {/* Pagination */}
      {total > limit && (
        <div className="col-span-full flex justify-center gap-2 mt-4">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`?page=${page - 1}&category=${category ?? ""}&sort=${sort}`}>← Anterior</Link>
            </Button>
          )}
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            {page} / {Math.ceil(total / limit)}
          </span>
          {page < Math.ceil(total / limit) && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`?page=${page + 1}&category=${category ?? ""}&sort=${sort}`}>Următor →</Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketplace Materiale</h1>
          <p className="text-muted-foreground">Descoperă mii de materiale de la studenți</p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/dashboard/marketplace/upload" className="gap-2">
            <Plus className="w-4 h-4" /> Upload Material
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Caută materiale..."
              defaultValue={searchParams.search}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">Caută</Button>
        </form>
        <div className="flex gap-2">
          <Link href={`?sort=newest&category=${searchParams.category ?? ""}`}>
            <Button variant={!searchParams.sort || searchParams.sort === "newest" ? "default" : "outline"} size="sm">
              Noi
            </Button>
          </Link>
          <Link href={`?sort=popular&category=${searchParams.category ?? ""}`}>
            <Button variant={searchParams.sort === "popular" ? "default" : "outline"} size="sm">
              Populare
            </Button>
          </Link>
          <Link href={`?sort=rating&category=${searchParams.category ?? ""}`}>
            <Button variant={searchParams.sort === "rating" ? "default" : "outline"} size="sm">
              Top rated
            </Button>
          </Link>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        <Link href={`?sort=${searchParams.sort ?? "newest"}`}>
          <Badge variant={!searchParams.category ? "default" : "outline"} className="cursor-pointer px-3 py-1">
            Toate
          </Badge>
        </Link>
        {MATERIAL_CATEGORIES.slice(0, 10).map((cat) => (
          <Link key={cat} href={`?category=${encodeURIComponent(cat)}&sort=${searchParams.sort ?? "newest"}`}>
            <Badge
              variant={searchParams.category === cat ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
            >
              {cat}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Materials grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Suspense
          fallback={Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <Skeleton className="w-12 h-12 rounded-xl mb-3" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        >
          <MaterialsList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
