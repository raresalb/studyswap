import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleMaterialPurchase, awardCredits } from "@/lib/credits";
import { TransactionType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Neautorizat" }, { status: 401 });
  }

  const { materialId } = await req.json();
  const userId = session.user.id;

  const material = await db.material.findUnique({
    where: { id: materialId, status: "APPROVED" },
  });

  if (!material) {
    return NextResponse.json({ message: "Material negăsit" }, { status: 404 });
  }

  // Check if already downloaded
  const existing = await db.download.findUnique({
    where: { userId_materialId: { userId, materialId } },
  });

  if (existing) {
    return NextResponse.json({ downloadUrl: material.fileUrl });
  }

  // Own material — free access
  if (material.authorId === userId) {
    return NextResponse.json({ downloadUrl: material.fileUrl });
  }

  try {
    if (material.creditCost === 0) {
      // Free material — record download, award author 5 credits
      await db.download.create({ data: { userId, materialId } });
      await db.material.update({
        where: { id: materialId },
        data: { downloadCount: { increment: 1 } },
      });

      // Award author for free material download
      if (material.authorId) {
        await awardCredits({
          userId: material.authorId,
          amount: 5,
          type: TransactionType.EARN_UPLOAD,
          description: `Descărcare material gratuit: ${material.title}`,
          metadata: { materialId, downloaderId: userId },
        });
      }
    } else {
      // Paid material — transfer credits
      await handleMaterialPurchase({
        buyerId: userId,
        sellerId: material.authorId,
        materialId,
        creditCost: material.creditCost,
        materialTitle: material.title,
      });
    }

    return NextResponse.json({ downloadUrl: material.fileUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Eroare la descărcare";
    return NextResponse.json({ message }, { status: 400 });
  }
}
