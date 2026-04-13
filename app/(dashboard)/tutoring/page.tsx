import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  Calendar,
  Clock,
  Star,
  Users,
  Plus,
} from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";

// Coins is not in lucide-react 0.468, use a simple SVG substitute
function CoinsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}

export default async function TutoringPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sessions = await db.tutoringSession.findMany({
    where: { status: "PENDING", studentId: null },
    orderBy: { scheduledAt: "asc" },
    include: {
      tutor: {
        select: {
          id: true,
          name: true,
          image: true,
          university: true,
          faculty: true,
          reputationPoints: true,
        },
      },
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sesiuni Tutoriat</h1>
          <p className="text-muted-foreground">
            {sessions.length} sesiuni disponibile
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/dashboard/tutoring/offer" className="gap-2">
            <Plus className="w-4 h-4" /> Oferă tutoriat
          </Link>
        </Button>
      </div>

      {/* Sessions grid */}
      {sessions.length === 0 ? (
        <div className="text-center py-20">
          <GraduationCap className="w-14 h-14 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg mb-2">Nicio sesiune disponibilă</h3>
          <p className="text-muted-foreground mb-6">
            Fii primul care oferă tutoriat colegilor tăi!
          </p>
          <Button variant="gradient" asChild>
            <Link href="/dashboard/tutoring/offer" className="gap-2">
              <Plus className="w-4 h-4" /> Oferă tutoriat
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => (
            <Card key={s.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                {/* Tutor info */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={s.tutor.image ?? ""} />
                    <AvatarFallback className="bg-violet-100 text-violet-700 text-sm">
                      {getInitials(s.tutor.name ?? "T")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.tutor.name}</p>
                    {s.tutor.university && (
                      <p className="text-xs text-muted-foreground truncate">
                        {s.tutor.university}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-medium">{s.tutor.reputationPoints}</span>
                  </div>
                </div>

                {/* Title & subject */}
                <div>
                  <h3 className="font-semibold line-clamp-1">{s.title}</h3>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {s.subject}
                  </Badge>
                </div>

                {/* Description */}
                {s.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                )}

                {/* Meta */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formatDate(s.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{s.durationMin} minute</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CoinsIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-semibold text-violet-600">{s.creditCost} credite</span>
                  </div>
                </div>

                {/* Action */}
                <form action={`/api/tutoring/sessions/${s.id}/book`} method="POST">
                  <Button type="submit" className="w-full gap-2" size="sm">
                    <Users className="w-4 h-4" /> Rezervă sesiune
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
