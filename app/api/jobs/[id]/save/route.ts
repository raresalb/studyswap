import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Neautorizat" }, { status: 401 });

  const userId = session.user.id;
  const jobId = params.id;

  const existing = await db.savedJob.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });

  if (existing) {
    await db.savedJob.delete({ where: { userId_jobId: { userId, jobId } } });
    return NextResponse.json({ saved: false });
  } else {
    await db.savedJob.create({ data: { userId, jobId } });
    return NextResponse.json({ saved: true });
  }
}
