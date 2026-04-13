import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ApplicationStatus } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Neautorizat" }, { status: 401 });

  const { status } = await req.json() as { status: ApplicationStatus };

  // Verify the application belongs to a job by this company
  const application = await db.jobApplication.findUnique({
    where: { id: params.id },
    include: { job: { select: { companyId: true, title: true } } },
  });

  if (!application || application.job.companyId !== session.user.id) {
    return NextResponse.json({ message: "Acces interzis" }, { status: 403 });
  }

  const updated = await db.jobApplication.update({
    where: { id: params.id },
    data: { status },
  });

  // Notify student about status change
  const statusMessages: Record<ApplicationStatus, string> = {
    APPLIED: "Aplicarea ta a fost primită",
    REVIEWING: "Aplicarea ta este în revizuire",
    INTERVIEW: "Felicitări! Ești invitat la interviu",
    ACCEPTED: "Felicitări! Aplicarea ta a fost acceptată",
    REJECTED: "Aplicarea ta nu a fost selectată de această dată",
  };

  await db.notification.create({
    data: {
      userId: application.studentId,
      type: "application_update",
      title: "Update aplicare",
      message: `${statusMessages[status]} pentru "${application.job.title}"`,
      link: "/dashboard/jobs",
    },
  });

  return NextResponse.json({ success: true, status: updated.status });
}
