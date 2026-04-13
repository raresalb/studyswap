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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MATERIAL_CATEGORIES } from "@/lib/utils";
import { Loader2, Upload, FileText, Info, X } from "lucide-react";

const schema = z.object({
  title: z.string().min(5, "Titlul trebuie să aibă cel puțin 5 caractere").max(100),
  description: z.string().min(20, "Descrierea trebuie să aibă cel puțin 20 de caractere").max(1000),
  category: z.string().min(1, "Selectează o categorie"),
  subject: z.string().min(2, "Materia este obligatorie"),
  university: z.string().optional(),
  faculty: z.string().optional(),
  studyYear: z.string().optional(),
  language: z.string().default("ro"),
  isPremium: z.boolean().default(false),
  creditCost: z.number().min(0).max(500).default(0),
  tags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

export default function UploadMaterialPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { creditCost: 0, language: "ro", isPremium: false },
  });

  const isPremium = watch("isPremium");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (tags.length < 10 && !tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()];
        setTags(newTags);
        setValue("tags", newTags);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const onSubmit = async (data: FormData) => {
    if (!file) {
      toast({ title: "Eroare", description: "Selectează un fișier pentru upload", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("data", JSON.stringify({ ...data, tags }));

      const res = await fetch("/api/materials", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Eroare la upload");

      toast({
        title: "Succes!",
        description: "Materialul tău a fost trimis spre moderare. Vei fi notificat când este aprobat.",
        variant: "success" as "default",
      });
      router.push("/dashboard/marketplace");
    } catch (error) {
      toast({ title: "Eroare", description: "Eroare la upload. Încearcă din nou.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Uploadează Material</h1>
        <p className="text-muted-foreground">Contribuie la comunitate și câștigă credite pentru fiecare descărcare</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-200 dark:border-violet-800">
        <Info className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-violet-900 dark:text-violet-100">Câștigă credite pentru fiecare descărcare</p>
          <p className="text-violet-700 dark:text-violet-300">
            Materialele gratuite: +5 credite/descărcare. Materialele premium: creditele setate de tine minus 15% comision.
            Materialele sunt moderate în maxim 24 ore.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File upload */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Fișier</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => document.getElementById("file-input")?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-violet-600" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium mb-1">Trage fișierul aici sau click pentru selectare</p>
                  <p className="text-sm text-muted-foreground">PDF, DOCX, PPT, imagini — max. 50 MB</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Material details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Detalii Material</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titlu *</Label>
              <Input placeholder="ex: Rezumat Analiză Matematică - Limite și Continuitate" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Descriere *</Label>
              <Textarea
                placeholder="Descrie conținutul materialului, pentru ce este util, ce subiecte acoperă..."
                rows={4}
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categorie *</Label>
                <Select onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Materia *</Label>
                <Input placeholder="ex: Analiză Matematică" {...register("subject")} />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Universitate</Label>
                <Input placeholder="ex: Universitatea Politehnica București" {...register("university")} />
              </div>

              <div className="space-y-2">
                <Label>An de studiu</Label>
                <Select onValueChange={(v) => setValue("studyYear", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează anul" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <SelectItem key={y} value={y.toString()}>Anul {y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags (apasă Enter pentru a adăuga)</Label>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="ex: matematică, limite, continuitate..."
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Prețuri și Acces</CardTitle>
            <CardDescription>Setează prețul materialului tău în credite</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setValue("isPremium", false); setValue("creditCost", 0); }}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${!isPremium ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <p className="font-semibold mb-1">Gratuit</p>
                <p className="text-sm text-muted-foreground">+5 credite per descărcare</p>
              </button>
              <button
                type="button"
                onClick={() => { setValue("isPremium", true); setValue("creditCost", 20); }}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${isPremium ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <p className="font-semibold mb-1">Premium</p>
                <p className="text-sm text-muted-foreground">Setezi prețul în credite</p>
              </button>
            </div>

            {isPremium && (
              <div className="space-y-2">
                <Label>Cost în credite (max. 500)</Label>
                <Input
                  type="number"
                  min={5}
                  max={500}
                  {...register("creditCost", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Tu vei primi {Math.floor((watch("creditCost") ?? 0) * 0.85)} credite per descărcare (după 15% comision)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Se uploadează...</>
          ) : (
            <><Upload className="w-4 h-4" /> Trimite spre aprobare</>
          )}
        </Button>
      </form>
    </div>
  );
}
