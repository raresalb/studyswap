import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { summarizeDocument } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { text } = body as { text: string };

    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return NextResponse.json(
        { error: "text must be at least 50 characters" },
        { status: 400 }
      );
    }

    const { summary, keyPoints } = await summarizeDocument(text);
    return NextResponse.json({ summary, keyPoints });
  } catch (error) {
    console.error("[AI_SUMMARIZE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
