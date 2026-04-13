"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Sparkles,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Brain,
  Send,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────

function ChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!res.ok) throw new Error("Eroare la server");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      toast({ title: "Eroare", description: "Nu s-a putut trimite mesajul.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-xl border bg-muted/30">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
            <Brain className="w-12 h-12 opacity-40" />
            <p className="font-medium">Bun venit la StudyBot!</p>
            <p className="text-sm max-w-sm">
              Sunt asistentul tău AI educațional. Întreabă-mă orice despre materiile tale de studiu.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">AI</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-background border rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">TU</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">AI</AvatarFallback>
            </Avatar>
            <div className="bg-background border rounded-2xl rounded-tl-sm px-4 py-3 space-y-1.5">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scrie mesajul tău... (Enter pentru trimitere, Shift+Enter pentru linie nouă)"
          className="resize-none min-h-[52px] max-h-32"
          rows={2}
        />
        <Button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="self-end px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Rezumat Tab ──────────────────────────────────────────────────────────────

function RezumatTab() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; keyPoints: string[] } | null>(null);
  const { toast } = useToast();

  async function handleSummarize() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Eroare");
      const data = await res.json();
      setResult(data);
    } catch {
      toast({ title: "Eroare", description: "Nu s-a putut genera rezumatul.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Lipește textul din curs, carte sau notițe mai jos. AI-ul va genera un rezumat și puncte cheie.
        </p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Lipește textul de rezumat aici (minim 100 caractere)..."
          className="min-h-[180px] resize-y"
        />
        <p className="text-xs text-muted-foreground">{text.length} caractere</p>
      </div>

      <Button onClick={handleSummarize} disabled={loading || text.trim().length < 50} className="gap-2">
        <Sparkles className="w-4 h-4" />
        {loading ? "Se generează..." : "Generează rezumat"}
      </Button>

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-600" /> Rezumat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{result.summary}</p>
            </CardContent>
          </Card>

          {result.keyPoints.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" /> Puncte cheie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.keyPoints.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-violet-50 dark:bg-violet-950/20"
                  >
                    <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm">{point}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quiz Tab ─────────────────────────────────────────────────────────────────

function QuizTab() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const score = Object.entries(selected).filter(
    ([idx, ans]) => questions[parseInt(idx)]?.correctAnswer === ans
  ).length;

  async function handleGenerateQuiz() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setQuestions([]);
    setSelected({});
    setRevealed({});

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, count: 5 }),
      });
      if (!res.ok) throw new Error("Eroare");
      const data = await res.json();
      setQuestions(data.questions ?? []);
    } catch {
      toast({ title: "Eroare", description: "Nu s-a putut genera quiz-ul.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(qIdx: number, aIdx: number) {
    if (revealed[qIdx]) return;
    setSelected((prev) => ({ ...prev, [qIdx]: aIdx }));
  }

  function revealAnswer(qIdx: number) {
    setRevealed((prev) => ({ ...prev, [qIdx]: true }));
  }

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Lipește textul din care să fie generate întrebări quiz (A/B/C/D).
          </p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Textul pentru quiz..."
            className="min-h-[160px] resize-y"
          />
          <Button onClick={handleGenerateQuiz} disabled={loading || text.trim().length < 50} className="gap-2">
            <HelpCircle className="w-4 h-4" />
            {loading ? "Se generează..." : "Generează Quiz (5 întrebări)"}
          </Button>

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    {[1, 2, 3, 4].map((j) => <Skeleton key={j} className="h-9 w-full" />)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm px-3 py-1">
                Scor: {score}/{Object.keys(revealed).length} răspunsuri dezvăluite
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setQuestions([]); setText(""); }}
            >
              Nou quiz
            </Button>
          </div>

          {questions.map((q, qIdx) => (
            <Card key={qIdx} className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <p className="font-medium text-sm">
                  <span className="text-violet-600 font-bold mr-2">{qIdx + 1}.</span>
                  {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, aIdx) => {
                    const isSelected = selected[qIdx] === aIdx;
                    const isCorrect = q.correctAnswer === aIdx;
                    const isRevealed = revealed[qIdx];

                    let variant = "outline";
                    let extra = "";
                    if (isRevealed && isCorrect) {
                      extra = "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400";
                    } else if (isRevealed && isSelected && !isCorrect) {
                      extra = "border-red-400 bg-red-50 dark:bg-red-950/20 text-red-600";
                    } else if (isSelected && !isRevealed) {
                      extra = "border-primary bg-primary/5";
                    }

                    return (
                      <button
                        key={aIdx}
                        onClick={() => selectAnswer(qIdx, aIdx)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                          isRevealed ? "cursor-default" : "hover:border-primary/60 hover:bg-muted/50 cursor-pointer"
                        } ${extra || "border-border"}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {!revealed[qIdx] ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={selected[qIdx] === undefined}
                    onClick={() => revealAnswer(qIdx)}
                    className="text-xs"
                  >
                    Verifică răspuns
                  </Button>
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                    <span className="font-medium">Explicație:</span> {q.explanation}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Matching Tutori Tab ──────────────────────────────────────────────────────

function MatchingTutoriTab() {
  const [needs, setNeeds] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<
    Array<{ tutorId: string; score: number; reason: string; name?: string }>
  >([]);
  const { toast } = useToast();

  async function handleMatch() {
    if (!needs.trim() || loading) return;
    setLoading(true);
    setMatches([]);

    try {
      const res = await fetch("/api/ai/match-tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ needs }),
      });
      if (!res.ok) throw new Error("Eroare");
      const data = await res.json();
      setMatches(data.matches ?? []);
    } catch {
      toast({ title: "Eroare", description: "Nu s-a putut efectua matching-ul.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Descrie ce materie sau subiect dorești să înveți, iar AI-ul va identifica cel mai potrivit tutor pentru tine.
      </p>
      <Textarea
        value={needs}
        onChange={(e) => setNeeds(e.target.value)}
        placeholder="Ex: Am nevoie de ajutor cu Analiză Matematică, în special integrale și serii. Prefer un stil practic cu exemple."
        className="min-h-[120px] resize-y"
      />
      <Button onClick={handleMatch} disabled={loading || needs.trim().length < 10} className="gap-2">
        <Brain className="w-4 h-4" />
        {loading ? "Se caută tutori..." : "Caută tutori potriviți"}
      </Button>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 flex gap-4 items-center">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-8 w-16 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Tutori recomandați pentru tine:</p>
          {matches.map((match, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-violet-100 text-violet-700">
                    {match.name ? match.name.slice(0, 2).toUpperCase() : "T" + (i + 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{match.name ?? `Tutor #${match.tutorId.slice(0, 6)}`}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{match.reason}</p>
                </div>
                <Badge
                  className={`text-sm px-3 ${
                    match.score >= 80
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {match.score}%
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && matches.length === 0 && needs.trim() && (
        <div className="text-center py-8 text-muted-foreground">
          <Brain className="w-10 h-10 mx-auto opacity-40 mb-2" />
          <p className="text-sm">Niciun tutor găsit. Încearcă o descriere mai detaliată.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Asistent AI</h1>
          <p className="text-muted-foreground text-sm">Instrumente AI pentru studiu mai eficient</p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="chat" className="gap-2 text-xs sm:text-sm">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Asistent AI</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="rezumat" className="gap-2 text-xs sm:text-sm">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Rezumat</span>
            <span className="sm:hidden">Rezumat</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-2 text-xs sm:text-sm">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Quiz Generator</span>
            <span className="sm:hidden">Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="tutori" className="gap-2 text-xs sm:text-sm">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Matching Tutori</span>
            <span className="sm:hidden">Tutori</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-600" /> Chat cu StudyBot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChatTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rezumat">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-600" /> Generator Rezumat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RezumatTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-violet-600" /> Quiz Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuizTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutori">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-600" /> Matching Tutori AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MatchingTutoriTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
