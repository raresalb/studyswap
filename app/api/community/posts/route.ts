import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { awardCredits } from "@/lib/credits";
import { TransactionType } from "@prisma/client";

const schema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(20),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Neautorizat" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const post = await db.forumPost.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags ?? [],
        authorId: session.user.id,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, postId: post.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Date invalide" }, { status: 422 });
    }
    return NextResponse.json({ message: "Eroare internă" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const [posts, total] = await Promise.all([
    db.forumPost.findMany({
      where: {
        status: "ACTIVE",
        ...(category && { category }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        author: { select: { name: true, image: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    db.forumPost.count({ where: { status: "ACTIVE", ...(category && { category }) } }),
  ]);

  return NextResponse.json({ posts, total });
}
