import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, adminNote } = body as {
    status: "COMPLETED" | "REJECTED";
    adminNote?: string;
  };

  if (!["COMPLETED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const withdrawal = await db.withdrawal.findUnique({
    where: { id },
    select: {
      id: true,
      credits: true,
      amountEur: true,
      userId: true,
      status: true,
    },
  });

  if (!withdrawal) {
    return NextResponse.json(
      { error: "Withdrawal not found" },
      { status: 404 }
    );
  }

  if (withdrawal.status === "COMPLETED" || withdrawal.status === "REJECTED") {
    return NextResponse.json(
      { error: "Withdrawal already processed" },
      { status: 409 }
    );
  }

  await db.$transaction(async (tx) => {
    await tx.withdrawal.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote ?? null,
        processedAt: new Date(),
      },
    });

    if (status === "REJECTED") {
      // Refund credits to user
      await tx.user.update({
        where: { id: withdrawal.userId },
        data: { credits: { increment: withdrawal.credits } },
      });

      // Create refund transaction record
      await tx.transaction.create({
        data: {
          type: "REFUND",
          status: "COMPLETED",
          amount: withdrawal.credits,
          description: `Rambursare retragere respinsă${adminNote ? `: ${adminNote}` : ""}`,
          userId: withdrawal.userId,
        },
      });
    }

    // Notify user
    const notifTitle =
      status === "COMPLETED" ? "Retragere finalizată" : "Retragere respinsă";
    const notifMessage =
      status === "COMPLETED"
        ? `Retragerea ta de ${withdrawal.credits} credite (${withdrawal.amountEur.toFixed(2)} €) a fost procesată cu succes.`
        : `Retragerea ta de ${withdrawal.credits} credite a fost respinsă și creditele au fost returnate în contul tău.${adminNote ? ` Motiv: ${adminNote}` : ""}`;

    await tx.notification.create({
      data: {
        type:
          status === "COMPLETED" ? "withdrawal_completed" : "withdrawal_rejected",
        title: notifTitle,
        message: notifMessage,
        link: "/dashboard/wallet",
        userId: withdrawal.userId,
      },
    });
  });

  return NextResponse.json({ success: true, status });
}
