"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2, Shield } from "lucide-react";
import { MATERIAL_CATEGORIES } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(2),
  university: z.string().optional(),
  faculty: z.string().optional(),
  studyYear: z.string().optional(),
  specialization: z.string().optional(),
  bio: z.string().max(500).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
    },
  });

  const onSave = async (data: ProfileForm) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      await update(); // refresh session
      toast({ title: "Profil actualizat!", description: "Modificările au fost salvate." });
      router.refresh();
    } catch {
      toast({ title: "Eroare", description: "Nu s-a putut salva profilul.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Ești sigur că vrei să îți ștergi contul? Această acțiune este ireversibilă și toate datele tale vor fi șterse (conform GDPR).")) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/users/delete", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Cont șters", description: "Contul tău a fost șters cu succes." });
      router.push("/");
    } catch {
      toast({ title: "Eroare", description: "Nu s-a putut șterge contul.", variant: "destructive" });
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Setări Cont</h1>
        <p className="text-muted-foreground">Gestionează-ți profilul și preferințele</p>
      </div>

      {/* Profile settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Informații Profil</CardTitle>
          <CardDescription>Aceste informații sunt vizibile în profilul tău public</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nume complet</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Universitate</Label>
                <Input placeholder="ex: UPB, ASE, UBB..." {...register("university")} />
              </div>
              <div className="space-y-2">
                <Label>Facultate</Label>
                <Input placeholder="ex: Automatică și Calculatoare" {...register("faculty")} />
              </div>
              <div className="space-y-2">
                <Label>Specializare</Label>
                <Input placeholder="ex: Calculatoare și IT" {...register("specialization")} />
              </div>
              <div className="space-y-2">
                <Label>An de studiu</Label>
                <Select onValueChange={(v) => setValue("studyYear", v)}>
                  <SelectTrigger><SelectValue placeholder="Selectează" /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <SelectItem key={y} value={String(y)}>Anul {y}</SelectItem>
                    ))}
                    <SelectItem value="master1">Master, Anul 1</SelectItem>
                    <SelectItem value="master2">Master, Anul 2</SelectItem>
                    <SelectItem value="doctorat">Doctorat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                placeholder="Scrie câteva lucruri despre tine, experiența ta, interesele academice..."
                rows={3}
                {...register("bio")}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input placeholder="https://linkedin.com/in/..." {...register("linkedinUrl")} />
              </div>
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input placeholder="https://github.com/..." {...register("githubUrl")} />
              </div>
            </div>

            <Button type="submit" variant="gradient" disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvează modificările</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Privacy & GDPR */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" /> Confidențialitate & GDPR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Conform GDPR, ai dreptul la portabilitatea datelor și dreptul la ștergere.
            Poți solicita exportul datelor tale sau ștergerea completă a contului.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Exportă datele mele
            </Button>
          </div>
          <Separator />
          <div>
            <p className="font-medium text-sm text-destructive mb-2">Zona periculoasă</p>
            <p className="text-sm text-muted-foreground mb-3">
              Ștergerea contului este permanentă. Toate materialele, creditele și datele tale vor fi șterse.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Șterge contul meu</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
