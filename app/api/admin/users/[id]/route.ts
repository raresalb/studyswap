import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ message: "Neautorizat" }, { status: 401 });
  }

  const { action, banReason } = await req.json() as { action: "ban" | "unban"; banReason?: string };

  const user = await db.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ message: "Utilizator negăsit" }, { status: 404 });

  const updated = await db.user.update({
    where: { id: params.id },
    data: {
      isBanned: action === "ban",
      banReason: action === "ban" ? (banReason ?? "Încălcarea termenilor") : null,
    },
  });

  // Notify user
  await db.notification.create({
    data: {
      userId: params.id,
      type: action === "ban" ? "account_banned" : "account_unbanned",
      title: action === "ban" ? "Cont suspendat" : "Cont reactivat",
      message: action === "ban"
        ? `Contul tău a fost suspendat. Motiv: ${banReason ?? "Încălcarea termenilor"}`
        : "Contul tău a fost reactivat.",
      link: "/",
    },
  });

  return NextResponse.json({ success: true, isBanned: updated.isBanned });
}
