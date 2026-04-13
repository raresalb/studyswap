"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Briefcase, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  coverLetter: z.string().min(50, "Scrisoarea de intenție trebuie să aibă cel puțin 50 de caractere"),
  phone: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function JobApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ ...data, jobId }));
      if (cvFile) formData.append("cv", cvFile);

      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      toast({
        title: "Aplicare trimisă!",
        description: `Aplicarea ta pentru "${jobTitle}" a fost trimisă cu succes.`,
      });
      router.refresh();
    } catch (error: unknown) {
      toast({
        title: "Eroare",
        description: error instanceof Error ? error.message : "Eroare la aplicare",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-center mb-4">
        <Briefcase className="w-8 h-8 text-primary mx-auto mb-2" />
        <h3 className="font-semibold">Aplică acum</h3>
        <p className="text-sm text-muted-foreground">{jobTitle}</p>
      </div>

      <div className="space-y-2">
        <Label>Scrisoare de intenție *</Label>
        <Textarea
          placeholder="Descrie de ce ești potrivit pentru acest rol, experiența ta relevantă..."
          rows={5}
          {...register("coverLetter")}
        />
        {errors.coverLetter && <p className="text-xs text-destructive">{errors.coverLetter.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>CV (PDF)</Label>
        <div
          onClick={() => document.getElementById("cv-input")?.click()}
          className="border-2 border-dashed border-border rounded-lg p-3 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input
            id="cv-input"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          />
          {cvFile ? (
            <p className="text-sm text-green-600">{cvFile.name}</p>
          ) : (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Upload CV</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Telefon de contact</Label>
        <Input placeholder="+40 7xx xxx xxx" {...register("phone")} />
      </div>

      <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Trimite aplicarea"
        )}
      </Button>
    </form>
  );
}
