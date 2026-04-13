import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/cloudinary";
import { creditsToEur, MIN_WITHDRAWAL_CREDITS } from "@/lib/utils";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  credits: z.number().min(MIN_WITHDRAWAL_CREDITS).max(10000),
  method: z.enum(["IBAN", "PAYPAL"]),
  accountInfo: z.string().min(5),
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
    const kycFile = formData.get("kycDocument") as File | null;

    const data = schema.parse(JSON.parse(dataStr));

    // Check user credits
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { credits: true, kycStatus: true },
    });

    if (!user) return NextResponse.json({ message: "Utilizator negăsit" }, { status: 404 });
    if (user.credits < data.credits) {
      return NextResponse.json({ message: "Credite insuficiente" }, { status: 400 });
    }
    if (user.kycStatus === "REJECTED") {
      return NextResponse.json({ message: "KYC respins. Contactează support." }, { status: 400 });
    }

    // Handle KYC document upload
    let kycDocumentUrl: string | undefined;
    if (kycFile && user.kycStatus === "NOT_SUBMITTED") {
      const buffer = Buffer.from(await kycFile.arrayBuffer());
      const { url } = await uploadFile(buffer, { folder: "kyc", resourceType: "image" });
      kycDocumentUrl = url;
    }

    const amountEur = creditsToEur(data.credits);

    // Process withdrawal
    await db.$transaction(async (tx) => {
      // Deduct credits
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: data.credits },
          totalSpent: { increment: data.credits },
          ...(kycDocumentUrl && { kycDocumentUrl, kycStatus: "PENDING" }),
        },
      });

      // Create withdrawal record
      await tx.withdrawal.create({
        data: {
          userId,
          credits: data.credits,
          amountEur,
          method: data.method,
          accountInfo: data.accountInfo,
          status: "PENDING",
        },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.WITHDRAW,
          status: TransactionStatus.PENDING,
          amount: -data.credits,
          description: `Retragere ${data.credits} credite → ${amountEur.toFixed(2)}€`,
        },
      });

      // Notify admin (create notification for admin)
      await tx.notification.create({
        data: {
          userId,
          type: "withdrawal_requested",
          title: "Retragere în procesare",
          message: `Cererea ta de retragere de ${data.credits} credite (${amountEur.toFixed(2)}€) a fost primită. Vei fi notificat când este procesată.`,
          link: "/dashboard/wallet",
        },
      });
    });

    return NextResponse.json({ success: true, amountEur });
  } catch (error) {
    console.error("Withdrawal error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Date invalide" }, { status: 422 });
    }
    return NextResponse.json({ message: "Eroare la procesare" }, { status: 500 });
  }
}
