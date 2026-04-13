import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).optional(),
  university: z.string().optional(),
  faculty: z.string().optional(),
  studyYear: z.string().optional(),
  specialization: z.string().optional(),
  bio: z.string().max(500).optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  emailNotifications: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Neautorizat" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...data,
        studyYear: data.studyYear ? parseInt(data.studyYear) || undefined : undefined,
      },
    });

    return NextResponse.json({ success: true, user: { name: updated.name, image: updated.image } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Date invalide" }, { status: 422 });
    }
    return NextResponse.json({ message: "Eroare internă" }, { status: 500 });
  }
}
