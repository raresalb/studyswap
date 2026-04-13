import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { awardCredits } from "@/lib/credits";
import { TransactionType } from "@prisma/client";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ message: "Emailul este deja înregistrat" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Find referrer
    let referredById: string | undefined;
    if (data.referralCode) {
      const referrer = await db.user.findUnique({
        where: { referralCode: data.referralCode },
      });
      if (referrer) referredById = referrer.id;
    }

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        referralCode,
        referredBy: referredById,
        credits: 50, // welcome bonus
        totalEarned: 50,
      },
    });

    // Record welcome bonus transaction
    await db.transaction.create({
      data: {
        userId: user.id,
        type: TransactionType.EARN_REFERRAL,
        status: "COMPLETED",
        amount: 50,
        description: "Bonus de bun venit",
      },
    });

    // Award referral bonus to referrer
    if (referredById) {
      await awardCredits({
        userId: referredById,
        amount: 50,
        type: TransactionType.EARN_REFERRAL,
        description: `Bonus referral: ${data.name} s-a înregistrat`,
      });
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Date invalide", errors: error.errors }, { status: 422 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ message: "Eroare internă" }, { status: 500 });
  }
}
