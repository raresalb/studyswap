import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// ─── GET: list available sessions ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject") ?? undefined;
  const page = Math.max(parseInt(searchParams.get("page") ?? "1"), 1);
  const limit = 20;

  const sessions = await db.tutoringSession.findMany({
    where: {
      status: "PENDING",
      studentId: null,
      ...(subject && { subject }),
    },
    orderBy: { scheduledAt: "asc" },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      tutor: {
        select: {
          id: true,
          name: true,
          image: true,
          university: true,
          faculty: true,
          reputationPoints: true,
        },
      },
    },
  });

  return NextResponse.json({ sessions });
}

// ─── POST: create a new session ───────────────────────────────────────────────

const createSessionSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  subject: z.string().min(2),
  scheduledAt: z.string().datetime(),
  durationMin: z.coerce.number().min(30).max(240).default(60),
  creditCost: z.coerce.number().min(1).max(500),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, subject, scheduledAt, durationMin, creditCost } = parsed.data;

    const tutoringSession = await db.tutoringSession.create({
      data: {
        title,
        description,
        subject,
        scheduledAt: new Date(scheduledAt),
        durationMin,
        creditCost,
        tutorId: session.user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({ session: tutoringSession }, { status: 201 });
  } catch (error) {
    console.error("[TUTORING_SESSIONS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
