import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateQuiz } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { text, count } = body as { text: string; count?: number };

    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return NextResponse.json(
        { error: "text must be at least 50 characters" },
        { status: 400 }
      );
    }

    const questionCount = Math.min(Math.max(count ?? 5, 1), 20);
    const questions = await generateQuiz(text, questionCount);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("[AI_QUIZ]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
