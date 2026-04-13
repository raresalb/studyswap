import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// ─── GET: fetch messages with a specific partner ───────────────────────────────

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get("partnerId");

  if (!partnerId) {
    return NextResponse.json({ error: "partnerId is required" }, { status: 400 });
  }

  const userId = session.user.id;

  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  // Mark unread messages as read
  await db.message.updateMany({
    where: { senderId: partnerId, receiverId: userId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ messages });
}

// ─── POST: send a message ─────────────────────────────────────────────────────

const sendSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { receiverId, content } = parsed.data;
    const senderId = session.user.id;

    if (senderId === receiverId) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    // Check receiver exists
    const receiver = await db.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    const message = await db.message.create({
      data: { senderId, receiverId, content },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: receiverId,
        type: "new_message",
        title: "Mesaj nou",
        message: `Ai primit un mesaj nou`,
        link: `/dashboard/messages`,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
