import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MessagesClient } from "@/app/(dashboard)/messages/messages-client";

export default async function CompanyMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Fetch all messages for this company
  const messages = await db.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="h-[calc(100vh-2rem)]">
      <MessagesClient messages={messages} currentUserId={userId} />
    </div>
  );
}
