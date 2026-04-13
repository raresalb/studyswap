import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface Params {
  params: { id: string };
}

// ─── POST: follow ─────────────────────────────────────────────────────────────

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const followerId = session.user.id;
  const followingId = params.id;

  if (followerId === followingId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  try {
    await db.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId },
      update: {},
    });

    // Notify the followed user
    await db.notification.create({
      data: {
        userId: followingId,
        type: "new_follower",
        title: "Urmăritor nou",
        message: "Cineva a început să te urmărească",
        link: `/dashboard/profile/${followerId}`,
      },
    });

    return NextResponse.json({ following: true });
  } catch (error) {
    console.error("[FOLLOW_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE: unfollow ─────────────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const followerId = session.user.id;
  const followingId = params.id;

  try {
    await db.follow.deleteMany({
      where: { followerId, followingId },
    });

    return NextResponse.json({ following: false });
  } catch (error) {
    console.error("[FOLLOW_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
