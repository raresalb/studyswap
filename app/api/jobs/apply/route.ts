import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/cloudinary";
import { z } from "zod";

const schema = z.object({
  jobId: z.string(),
  coverLetter: z.string().min(50),
  phone: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Neautorizat" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const formData = await req.formData();
    const dataStr = formData.get("data") as string;
    const cvFile = formData.get("cv") as File | null;

    const data = schema.parse(JSON.parse(dataStr));

    // Check if already applied
    const existing = await db.jobApplication.findUnique({
      where: { studentId_jobId: { studentId: userId, jobId: data.jobId } },
    });

    if (existing) {
      return NextResponse.json({ message: "Ai aplicat deja la acest job" }, { status: 400 });
    }

    // Upload CV if provided
    let cvUrl: string | undefined;
    if (cvFile) {
      const buffer = Buffer.from(await cvFile.arrayBuffer());
      const { url } = await uploadFile(buffer, { folder: "cvs", resourceType: "raw" });
      cvUrl = url;
    }

    const application = await db.jobApplication.create({
      data: {
        studentId: userId,
        jobId: data.jobId,
        coverLetter: data.coverLetter,
        phone: data.phone,
        cvUrl,
        additionalInfo: data.additionalInfo,
      },
      include: { job: { include: { company: { select: { id: true } } } } },
    });

    // Notify company
    await db.notification.create({
      data: {
        userId: application.job.company.id,
        type: "new_application",
        title: "Nouă aplicare",
        message: `Ai primit o nouă aplicare pentru "${application.job.title}"`,
        link: `/company/jobs/${data.jobId}/applications`,
      },
    });

    return NextResponse.json({ success: true, applicationId: application.id });
  } catch (error) {
    console.error("Apply error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Date invalide" }, { status: 422 });
    }
    return NextResponse.json({ message: "Eroare internă" }, { status: 500 });
  }
}
