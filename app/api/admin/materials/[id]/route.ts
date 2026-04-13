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
  const { status, reason } = body as {
    status: "APPROVED" | "REJECTED";
    reason?: string;
  };

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const material = await db.material.findUnique({
    where: { id },
    select: { id: true, title: true, authorId: true },
  });

  if (!material) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  await db.material.update({
    where: { id },
    data: { status },
  });

  // Create notification for material author
  if (status === "APPROVED") {
    await db.notification.create({
      data: {
        type: "material_approved",
        title: "Material aprobat",
        message: `Materialul tău "${material.title}" a fost aprobat și este acum disponibil pe platformă.`,
        link: `/materials/${material.id}`,
        userId: material.authorId,
      },
    });
  } else if (status === "REJECTED") {
    await db.notification.create({
      data: {
        type: "material_rejected",
        title: "Material respins",
        message: `Materialul tău "${material.title}" a fost respins.${reason ? ` Motiv: ${reason}` : ""}`,
        userId: material.authorId,
      },
    });
  }

  return NextResponse.json({ success: true, status });
}
