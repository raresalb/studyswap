"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Coins, CheckCircle, Shield, Zap } from "lucide-react";
import { CREDIT_PACKAGES } from "@/lib/utils";

export function BuyCreditsSection() {
  const { toast } = useToast();
  const [loadingPkg, setLoadingPkg] = useState<number | null>(null);

  const handlePurchase = async (credits: number, price: number) => {
    setLoadingPkg(credits);
    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits, price }),
      });

      if (!res.ok) throw new Error("Eroare la creare sesiune plată");

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      toast({ title: "Eroare", description: "Nu s-a putut iniția plata. Încearcă din nou.", variant: "destructive" });
    } finally {
      setLoadingPkg(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Cumpără Credite</h2>
        <p className="text-muted-foreground">Alege pachetul potrivit pentru tine. Plată securizată cu Stripe.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {CREDIT_PACKAGES.map((pkg) => (
          <Card
            key={pkg.credits}
            className={`relative border-2 transition-all ${
              "popular" in pkg && pkg.popular
                ? "border-primary shadow-lg"
                : "border-border hover:border-primary/50"
            }`}
          >
            {"popular" in pkg && pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-violet-600 to-blue-500 text-white border-0">
                  <Zap className="w-3 h-3 mr-1" /> Recomandat
                </Badge>
              </div>
            )}
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center mx-auto mb-4">
                <Coins className="w-7 h-7 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold mb-1">{pkg.credits}</p>
              <p className="text-muted-foreground text-sm mb-4">credite</p>
              <p className="text-3xl font-bold mb-1">{pkg.price}€</p>
              <p className="text-xs text-muted-foreground mb-6">
                ~{(pkg.price / pkg.credits * 100).toFixed(1)}€/100 credite
              </p>

              <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {pkg.credits} credite instant
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Acces materiale premium
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Sesiuni tutoriat
                </li>
              </ul>

              <Button
                variant={"popular" in pkg && pkg.popular ? "gradient" : "outline"}
                className="w-full"
                onClick={() => handlePurchase(pkg.credits, pkg.price)}
                disabled={loadingPkg === pkg.credits}
              >
                {loadingPkg === pkg.credits ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `Cumpără — ${pkg.price}€`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Shield className="w-4 h-4" /> Plăți securizate Stripe
        </span>
        <span>Card, Google Pay, Apple Pay</span>
        <span>Rambursare garantată 7 zile</span>
      </div>
    </div>
  );
}
