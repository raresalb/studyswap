import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deductCredits, awardCredits } from "@/lib/credits";
import { TransactionType, PLATFORM_COMMISSION } from "@prisma/client";
import { PLATFORM_COMMISSION as COMMISSION } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Neautorizat" }, { status: 401 });

  const studentId = session.user.id;
  const sessionId = params.id;

  const tutoringSession = await db.tutoringSession.findUnique({
    where: { id: sessionId },
    include: { tutor: { select: { id: true, name: true } } },
  });

  if (!tutoringSession) return NextResponse.json({ message: "Sesiune negăsită" }, { status: 404 });
  if (tutoringSession.studentId) return NextResponse.json({ message: "Sesiunea este deja rezervată" }, { status: 400 });
  if (tutoringSession.tutorId === studentId) return NextResponse.json({ message: "Nu poți rezerva propria sesiune" }, { status: 400 });

  const commission = Math.floor(tutoringSession.creditCost * COMMISSION);
  const tutorEarnings = tutoringSession.creditCost - commission;

  try {
    await db.$transaction(async (tx) => {
      const student = await tx.user.findUnique({ where: { id: studentId } });
      if (!student || student.credits < tutoringSession.creditCost) {
        throw new Error("Credite insuficiente");
      }

      // Deduct from student
      await tx.user.update({
        where: { id: studentId },
        data: {
          credits: { decrement: tutoringSession.creditCost },
          totalSpent: { increment: tutoringSession.creditCost },
        },
      });

      // Award tutor
      await tx.user.update({
        where: { id: tutoringSession.tutorId },
        data: {
          credits: { increment: tutorEarnings },
          totalEarned: { increment: tutorEarnings },
        },
      });

      // Book the session
      await tx.tutoringSession.update({
        where: { id: sessionId },
        data: { studentId, status: "CONFIRMED" },
      });

      // Transactions
      await tx.transaction.create({
        data: {
          userId: studentId,
          type: TransactionType.SPEND_TUTORING,
          status: "COMPLETED",
          amount: -tutoringSession.creditCost,
          description: `Sesiune tutoriat: ${tutoringSession.title}`,
          metadata: { sessionId, tutorId: tutoringSession.tutorId },
        },
      });

      await tx.transaction.create({
        data: {
          userId: tutoringSession.tutorId,
          type: TransactionType.EARN_TUTORING,
          status: "COMPLETED",
          amount: tutorEarnings,
          description: `Sesiune tutoriat rezervată: ${tutoringSession.title}`,
          metadata: { sessionId, studentId, commission },
        },
      });

      // Notify tutor
      await tx.notification.create({
        data: {
          userId: tutoringSession.tutorId,
          type: "tutoring_booked",
          title: "Sesiune rezervată!",
          message: `${student.name} a rezervat sesiunea ta "${tutoringSession.title}"`,
          link: "/dashboard/tutoring",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Eroare la rezervare";
    return NextResponse.json({ message }, { status: 400 });
  }
}
