"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { GraduationCap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MATERIAL_CATEGORIES } from "@/lib/utils";

// ─── Validation schema ────────────────────────────────────────────────────────

const offerSchema = z.object({
  title: z.string().min(5, "Titlul trebuie să aibă cel puțin 5 caractere"),
  description: z.string().min(20, "Descrierea trebuie să aibă cel puțin 20 caractere"),
  subject: z.string().min(2, "Selectează sau scrie materia"),
  scheduledAt: z.string().min(1, "Selectează data și ora"),
  durationMin: z.coerce.number().min(30).max(240),
  creditCost: z.coerce.number().min(1, "Costul trebuie să fie cel puțin 1 credit").max(500),
});

type OfferFormData = z.infer<typeof offerSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TutoringOfferPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      durationMin: 60,
      creditCost: 20,
    },
  });

  const durationValue = watch("durationMin");

  async function onSubmit(data: OfferFormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/tutoring/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          scheduledAt: new Date(data.scheduledAt).toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Eroare la creare");
      }

      toast({
        title: "Sesiune creată!",
        description: "Sesiunea ta de tutoriat este acum disponibilă.",
      });
      router.push("/dashboard/tutoring");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Eroare necunoscută";
      toast({ title: "Eroare", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/tutoring">
            <ArrowLeft className="w-4 h-4 mr-1" /> Înapoi
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Oferă tutoriat</h1>
          <p className="text-muted-foreground text-sm">Creează o sesiune de tutoriat pentru colegi</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Detalii sesiune</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Titlu sesiune *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Ex: Matematică - Integrale și aplicații"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Descriere *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Descrie ce vei preda, metodele folosite, nivelul de dificultate..."
                className="min-h-[100px] resize-y"
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="subject">Materie *</Label>
              <Select onValueChange={(val) => setValue("subject", val, { shouldValidate: true })}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Selectează materia" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject && (
                <p className="text-xs text-destructive">{errors.subject.message}</p>
              )}
            </div>

            {/* Scheduled At */}
            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt">Data și ora *</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                {...register("scheduledAt")}
                min={new Date().toISOString().slice(0, 16)}
              />
              {errors.scheduledAt && (
                <p className="text-xs text-destructive">{errors.scheduledAt.message}</p>
              )}
            </div>

            {/* Duration & Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="durationMin">Durată</Label>
                <Select
                  defaultValue="60"
                  onValueChange={(val) =>
                    setValue("durationMin", parseInt(val), { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="durationMin">
                    <SelectValue>{durationValue} minute</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minute</SelectItem>
                    <SelectItem value="60">60 minute</SelectItem>
                    <SelectItem value="90">90 minute</SelectItem>
                    <SelectItem value="120">120 minute</SelectItem>
                  </SelectContent>
                </Select>
                {errors.durationMin && (
                  <p className="text-xs text-destructive">{errors.durationMin.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="creditCost">Cost (credite) *</Label>
                <Input
                  id="creditCost"
                  type="number"
                  min={1}
                  max={500}
                  {...register("creditCost", { valueAsNumber: true })}
                  placeholder="20"
                />
                {errors.creditCost && (
                  <p className="text-xs text-destructive">{errors.creditCost.message}</p>
                )}
              </div>
            </div>

            {/* Info box */}
            <div className="rounded-lg bg-violet-50 dark:bg-violet-950/20 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Cum funcționează?</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Sesiunea devine vizibilă imediat pentru studenți</li>
                <li>La rezervare, creditele sunt blocate până la finalizare</li>
                <li>Platforma reține un comision de 15%</li>
                <li>Vei primi un link de videoconferință automat</li>
              </ul>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Se creează..." : "Creează sesiunea"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
