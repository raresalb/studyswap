import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { studyAssistantChat } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { messages, context } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      context?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const response = await studyAssistantChat(messages, context);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("[AI_CHAT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
