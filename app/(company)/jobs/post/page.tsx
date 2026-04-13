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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { JOB_DOMAINS } from "@/lib/utils";
import { Loader2, Plus } from "lucide-react";

const schema = z.object({
  title: z.string().min(5, "Titlul trebuie să aibă cel puțin 5 caractere"),
  description: z.string().min(50, "Descrierea trebuie să aibă cel puțin 50 de caractere"),
  requirements: z.string().min(20, "Cerințele sunt obligatorii"),
  benefits: z.string().optional(),
  salary: z.string().optional(),
  type: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "FREELANCE", "REMOTE", "HYBRID"]),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  domain: z.string().min(1, "Selectează domeniul"),
  deadline: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const JOB_TYPES = [
  { value: "INTERNSHIP", label: "Internship" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

export default function PostJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "INTERNSHIP", isRemote: false },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/company/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Eroare la postare");
      }

      toast({ title: "Job postat cu succes!", description: "Oferta ta este acum vizibilă pentru candidați." });
      router.push("/company/jobs");
    } catch (error: unknown) {
      toast({
        title: "Eroare",
        description: error instanceof Error ? error.message : "Eroare la postare",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Postează o Ofertă</h1>
        <p className="text-muted-foreground">Ajunge la mii de studenți talentați din România</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Informații de bază</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titlu job *</Label>
              <Input placeholder="ex: Junior React Developer" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tip contract *</Label>
                <Select defaultValue="INTERNSHIP" onValueChange={(v) => setValue("type", v as FormData["type"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Domeniu *</Label>
                <Select onValueChange={(v) => setValue("domain", v)}>
                  <SelectTrigger><SelectValue placeholder="Selectează domeniu" /></SelectTrigger>
                  <SelectContent>
                    {JOB_DOMAINS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.domain && <p className="text-xs text-destructive">{errors.domain.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Locație</Label>
                <Input placeholder="ex: București, Cluj-Napoca" {...register("location")} />
              </div>

              <div className="space-y-2">
                <Label>Salariu / compensație</Label>
                <Input placeholder="ex: 2000-3000 RON, Negociabil" {...register("salary")} />
              </div>

              <div className="space-y-2">
                <Label>Deadline aplicare</Label>
                <Input type="date" {...register("deadline")} />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="isRemote"
                  className="w-4 h-4"
                  {...register("isRemote")}
                />
                <Label htmlFor="isRemote">Disponibil remote</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Detalii ofertă</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Descrierea jobului *</Label>
              <Textarea
                placeholder="Descrie rolul, responsabilitățile, echipa, cultura companiei..."
                rows={6}
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Cerințe *</Label>
              <Textarea
                placeholder="Experiență, competențe tehnice, soft skills necesare..."
                rows={4}
                {...register("requirements")}
              />
              {errors.requirements && <p className="text-xs text-destructive">{errors.requirements.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Beneficii</Label>
              <Textarea
                placeholder="Tichete de masă, asigurare medicală, zile de concediu, training..."
                rows={3}
                {...register("benefits")}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Se postează...</>
          ) : (
            <><Plus className="w-4 h-4" /> Postează Oferta</>
          )}
        </Button>
      </form>
    </div>
  );
}
