import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Neautorizat" }, { status: 401 });

  const job = await db.job.findUnique({ where: { id: params.id } });
  if (!job || job.companyId !== session.user.id) {
    return NextResponse.json({ message: "Job negăsit sau acces interzis" }, { status: 404 });
  }

  const { status } = await req.json();
  const updated = await db.job.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json({ success: true, job: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Neautorizat" }, { status: 401 });

  const job = await db.job.findUnique({ where: { id: params.id } });
  if (!job || job.companyId !== session.user.id) {
    return NextResponse.json({ message: "Acces interzis" }, { status: 403 });
  }

  await db.job.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
