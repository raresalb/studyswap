import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/** Summarize a document text using Claude */
export async function summarizeDocument(text: string): Promise<{
  summary: string;
  keyPoints: string[];
}> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Ești un asistent educațional. Analizează următorul text și generează:
1. Un rezumat concis (3-4 paragrafe)
2. 5-7 puncte cheie (concepte importante)

Răspunde în format JSON cu structura:
{
  "summary": "rezumatul aici",
  "keyPoints": ["punct 1", "punct 2", ...]
}

Text de analizat:
${text.slice(0, 8000)}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      summary: content.text,
      keyPoints: [],
    };
  }
}

/** Generate quiz questions from document text */
export async function generateQuiz(
  text: string,
  questionCount: number = 10
): Promise<
  Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>
> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Ești un profesor. Creează ${questionCount} întrebări cu răspunsuri multiple (A, B, C, D) bazate pe textul următor.

Răspunde în format JSON cu structura:
{
  "questions": [
    {
      "question": "Întrebarea?",
      "options": ["A. Opțiune 1", "B. Opțiune 2", "C. Opțiune 3", "D. Opțiune 4"],
      "correctAnswer": 0,
      "explanation": "Explicație scurtă"
    }
  ]
}

Text:
${text.slice(0, 6000)}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.questions ?? [];
  } catch {
    return [];
  }
}

/** AI study assistant chat */
export async function studyAssistantChat(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  context?: string
): Promise<string> {
  const systemPrompt = `Ești StudyBot, un asistent AI educațional pentru studenți.
Ajuți studenții să înțeleagă concepte, să rezolve probleme și să se pregătească pentru examene.
Răspunde concis, clar și în română. Folosește exemple practice când este posibil.
${context ? `\nContext din materialul de studiu:\n${context}` : ""}`;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.slice(-10), // last 10 messages for context
  });

  const content = response.content[0];
  if (content.type !== "text") return "Eroare la generarea răspunsului.";
  return content.text;
}

/** Match tutor to student based on subject and profile */
export async function matchTutors(
  studentNeeds: string,
  tutors: Array<{ id: string; name: string; subjects: string; bio: string }>
): Promise<Array<{ tutorId: string; score: number; reason: string }>> {
  if (tutors.length === 0) return [];

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analizează potrivirea dintre un student și tutorii disponibili.

Nevoia studentului: ${studentNeeds}

Tutori disponibili:
${tutors.map((t) => `- ID: ${t.id}, Nume: ${t.name}, Materii: ${t.subjects}, Bio: ${t.bio}`).join("\n")}

Răspunde în JSON:
{
  "matches": [
    {"tutorId": "id", "score": 85, "reason": "Explicație scurtă"}
  ]
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") return [];

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.matches ?? [];
  } catch {
    return [];
  }
}
