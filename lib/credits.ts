import { db } from "@/lib/db";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { PLATFORM_COMMISSION } from "@/lib/utils";

/** Award credits to a user and record transaction */
export async function awardCredits({
  userId,
  amount,
  type,
  description,
  metadata,
}: {
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  return db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        credits: { increment: amount },
        totalEarned: { increment: amount },
      },
    });

    return tx.transaction.create({
      data: {
        userId,
        type,
        status: TransactionStatus.COMPLETED,
        amount,
        description,
        metadata: metadata ?? {},
      },
    });
  });
}

/** Deduct credits from a user */
export async function deductCredits({
  userId,
  amount,
  type,
  description,
  metadata,
}: {
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user || user.credits < amount) {
      throw new Error("Credite insuficiente");
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: amount },
        totalSpent: { increment: amount },
      },
    });

    return tx.transaction.create({
      data: {
        userId,
        type,
        status: TransactionStatus.COMPLETED,
        amount: -amount,
        description,
        metadata: metadata ?? {},
      },
    });
  });
}

/** Handle material download: deduct from buyer, award seller */
export async function handleMaterialPurchase({
  buyerId,
  sellerId,
  materialId,
  creditCost,
  materialTitle,
}: {
  buyerId: string;
  sellerId: string;
  materialId: string;
  creditCost: number;
  materialTitle: string;
}) {
  const commission = Math.floor(creditCost * PLATFORM_COMMISSION);
  const sellerEarnings = creditCost - commission;

  return db.$transaction(async (tx) => {
    // Check buyer has enough credits
    const buyer = await tx.user.findUnique({ where: { id: buyerId } });
    if (!buyer || buyer.credits < creditCost) {
      throw new Error("Credite insuficiente");
    }

    // Deduct from buyer
    await tx.user.update({
      where: { id: buyerId },
      data: {
        credits: { decrement: creditCost },
        totalSpent: { increment: creditCost },
      },
    });

    // Award seller (minus commission)
    await tx.user.update({
      where: { id: sellerId },
      data: {
        credits: { increment: sellerEarnings },
        totalEarned: { increment: sellerEarnings },
      },
    });

    // Record buyer transaction
    await tx.transaction.create({
      data: {
        userId: buyerId,
        type: TransactionType.SPEND_MATERIAL,
        status: TransactionStatus.COMPLETED,
        amount: -creditCost,
        description: `Descărcare: ${materialTitle}`,
        metadata: { materialId, sellerId },
      },
    });

    // Record seller transaction
    await tx.transaction.create({
      data: {
        userId: sellerId,
        type: TransactionType.EARN_UPLOAD,
        status: TransactionStatus.COMPLETED,
        amount: sellerEarnings,
        description: `Vânzare material: ${materialTitle}`,
        metadata: { materialId, buyerId, commission },
      },
    });

    // Record download
    await tx.download.upsert({
      where: { userId_materialId: { userId: buyerId, materialId } },
      create: { userId: buyerId, materialId },
      update: {},
    });

    // Increment download count
    await tx.material.update({
      where: { id: materialId },
      data: { downloadCount: { increment: 1 } },
    });

    return { sellerEarnings, commission };
  });
}

/** Award daily activity bonus */
export async function awardDailyBonus(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already received today
  const existing = await db.transaction.findFirst({
    where: {
      userId,
      type: TransactionType.EARN_DAILY,
      createdAt: { gte: today },
    },
  });

  if (existing) return null;

  return awardCredits({
    userId,
    amount: 5,
    type: TransactionType.EARN_DAILY,
    description: "Bonus activitate zilnică",
  });
}
