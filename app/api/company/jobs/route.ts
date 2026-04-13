import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { JobType } from "@prisma/client";

const schema = z.object({
  title: z.string().min(5),
  description: z.string().min(50),
  requirements: z.string().min(20),
  benefits: z.string().optional(),
  salary: z.string().optional(),
  type: z.nativeEnum(JobType),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  domain: z.string().min(1),
  deadline: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Neautorizat" }, { status: 401 });

  const jobs = await db.job.findMany({
    where: { companyId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Neautorizat" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "COMPANY" && role !== "ADMIN") {
    return NextResponse.json({ message: "Doar companiile pot posta joburi" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const job = await db.job.create({
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        companyId: session.user.id,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Date invalide", errors: error.errors }, { status: 422 });
    }
    console.error("Post job error:", error);
    return NextResponse.json({ message: "Eroare internă" }, { status: 500 });
  }
}
