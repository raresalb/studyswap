import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MessagesClient } from "./messages-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConversationPartner {
  id: string;
  name: string | null;
  image: string | null;
  university: string | null;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface MessageData {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: Date;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function MessagesSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-0 border rounded-xl overflow-hidden h-[600px]">
      <div className="border-r p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
      <div className="md:col-span-2 p-4 flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    </div>
  );
}

// ─── Data fetcher ─────────────────────────────────────────────────────────────

async function MessagesData({ userId }: { userId: string }) {
  // Fetch all messages involving this user
  const allMessages = await db.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, image: true, university: true } },
      receiver: { select: { id: true, name: true, image: true, university: true } },
    },
    take: 500,
  });

  // Group by conversation partner
  const conversationMap = new Map<string, ConversationPartner>();

  for (const msg of allMessages) {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    const partner = msg.senderId === userId ? msg.receiver : msg.sender;

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        id: partnerId,
        name: partner.name,
        image: partner.image,
        university: partner.university,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        unreadCount: !msg.isRead && msg.receiverId === userId ? 1 : 0,
      });
    } else {
      const existing = conversationMap.get(partnerId)!;
      if (!msg.isRead && msg.receiverId === userId) {
        existing.unreadCount += 1;
      }
    }
  }

  const conversations = Array.from(conversationMap.values()).sort(
    (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
  );

  return (
    <MessagesClient
      conversations={conversations}
      currentUserId={userId}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Mesaje</h1>
        <p className="text-muted-foreground text-sm">Conversațiile tale private</p>
      </div>

      <Suspense fallback={<MessagesSkeleton />}>
        <MessagesData userId={session.user.id} />
      </Suspense>
    </div>
  );
}
