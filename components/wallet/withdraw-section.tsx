"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Wallet, AlertCircle, Upload, CheckCircle } from "lucide-react";
import { creditsToEur, MIN_WITHDRAWAL_CREDITS } from "@/lib/utils";
import type { KYCStatus } from "@prisma/client";

const schema = z.object({
  credits: z.number()
    .min(MIN_WITHDRAWAL_CREDITS, `Minimum ${MIN_WITHDRAWAL_CREDITS} credite`)
    .max(10000, "Maxim 10,000 credite per retragere"),
  method: z.enum(["IBAN", "PAYPAL"]),
  accountInfo: z.string().min(5, "Informație cont obligatorie"),
});

type FormData = z.infer<typeof schema>;

interface WithdrawSectionProps {
  currentCredits: number;
  kycStatus: KYCStatus;
}

export function WithdrawSection({ currentCredits, kycStatus }: WithdrawSectionProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [kycFile, setKycFile] = useState<File | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { credits: MIN_WITHDRAWAL_CREDITS, method: "IBAN" },
  });

  const creditsToWithdraw = watch("credits") || 0;
  const amountEur = creditsToEur(creditsToWithdraw).toFixed(2);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      if (kycFile) formData.append("kycDocument", kycFile);

      const res = await fetch("/api/credits/withdraw", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      toast({
        title: "Cerere de retragere trimisă!",
        description: `${data.credits} credite → ${amountEur}€ vor fi procesate în 3-5 zile lucrătoare.`,
      });
    } catch (error: unknown) {
      toast({
        title: "Eroare",
        description: error instanceof Error ? error.message : "Eroare la procesare",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentCredits < MIN_WITHDRAWAL_CREDITS) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Credite insuficiente</h3>
          <p className="text-muted-foreground mb-4">
            Ai nevoie de minimum {MIN_WITHDRAWAL_CREDITS} credite pentru a retrage.
            Mai ai nevoie de {MIN_WITHDRAWAL_CREDITS - currentCredits} credite.
          </p>
          <p className="text-sm text-muted-foreground">
            Câștigă credite prin uploadarea materialelor, tutoriat sau recenzii!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KYC status */}
      {kycStatus === "NOT_SUBMITTED" && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900 dark:text-yellow-100">Verificare identitate necesară</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Pentru prima retragere, trebuie să uploadezi o copie a buletinului de identitate (cerință legală/KYC).
            </p>
          </div>
        </div>
      )}

      {kycStatus === "PENDING" && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-xl">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <p className="text-blue-900 dark:text-blue-100">Documentul tău este în verificare (1-2 zile lucrătoare)</p>
        </div>
      )}

      {kycStatus === "APPROVED" && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-900 dark:text-green-100">Identitate verificată</p>
        </div>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Retrage Credite</CardTitle>
          <CardDescription>
            Conversie: 100 credite = 3€ • Minim {MIN_WITHDRAWAL_CREDITS} credite • Procesare 3-5 zile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Număr de credite de retras</Label>
              <Input
                type="number"
                min={MIN_WITHDRAWAL_CREDITS}
                max={Math.min(currentCredits, 10000)}
                {...register("credits", { valueAsNumber: true })}
              />
              {errors.credits && <p className="text-xs text-destructive">{errors.credits.message}</p>}
              <p className="text-sm text-muted-foreground">
                Vei primi: <span className="font-semibold text-green-600">{amountEur}€</span>
                {" "}(din {creditsToWithdraw} credite)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Metodă de plată</Label>
              <Select defaultValue="IBAN" onValueChange={(v) => setValue("method", v as "IBAN" | "PAYPAL")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IBAN">Transfer IBAN (Cont bancar)</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{watch("method") === "IBAN" ? "IBAN" : "Email PayPal"}</Label>
              <Input
                placeholder={watch("method") === "IBAN" ? "RO49 AAAA 1B31 0075 9384 0000" : "email@paypal.com"}
                {...register("accountInfo")}
              />
              {errors.accountInfo && <p className="text-xs text-destructive">{errors.accountInfo.message}</p>}
            </div>

            {/* KYC document upload */}
            {kycStatus === "NOT_SUBMITTED" && (
              <div className="space-y-2">
                <Label>Document identitate (buletin/pașaport)</Label>
                <div
                  onClick={() => document.getElementById("kyc-input")?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <input
                    id="kyc-input"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => setKycFile(e.target.files?.[0] ?? null)}
                  />
                  {kycFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">{kycFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">Upload document identitate</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Fișierele sunt criptate și stocate securizat. Obligatoriu GDPR.</p>
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={isLoading || kycStatus === "PENDING"}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Wallet className="w-4 h-4" /> Retrage {creditsToWithdraw.toLocaleString()} credite → {amountEur}€</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
