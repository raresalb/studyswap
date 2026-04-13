import { NextRequest, NextResponse } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";

// GDPR: Right to erasure
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Neautorizat" }, { status: 401 });

  const userId = session.user.id;

  // Check for pending withdrawals
  const pendingWithdrawal = await db.withdrawal.findFirst({
    where: { userId, status: "PENDING" },
  });

  if (pendingWithdrawal) {
    return NextResponse.json(
      { message: "Ai retrageri în așteptare. Așteptă procesarea lor înainte de a șterge contul." },
      { status: 400 }
    );
  }

  // Delete user and all related data (cascade handles most)
  await db.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
