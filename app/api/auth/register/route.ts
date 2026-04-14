import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { TransactionType, UserRole } from "@prisma/client";

// Admin code — in production this should be an env variable
const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE ?? "STUDYSWAP_ADMIN_2024";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["STUDENT", "COMPANY", "ADMIN"]).default("STUDENT"),
  adminCode: z.string().optional(),
  university: z.string().optional(),
  companyName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Validate admin code
    if (data.role === "ADMIN") {
      if (!data.adminCode || data.adminCode !== ADMIN_SECRET_CODE) {
        return NextResponse.json({ message: "Invalid admin access code" }, { status: 403 });
      }
    }

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ message: "Email is already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Welcome credits: 50 for students, 0 for company/admin
    const welcomeCredits = data.role === "STUDENT" ? 50 : 0;

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as UserRole,
        referralCode,
        university: data.university,
        credits: welcomeCredits,
        totalEarned: welcomeCredits,
      },
    });

    // Record welcome bonus for students
    if (welcomeCredits > 0) {
      await db.transaction.create({
        data: {
          userId: user.id,
          type: TransactionType.EARN_REFERRAL,
          status: "COMPLETED",
          amount: welcomeCredits,
          description: "Welcome bonus",
        },
      });
    }

    return NextResponse.json({ success: true, userId: user.id, role: user.role });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid data", errors: error.errors }, { status: 422 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
