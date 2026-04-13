"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function CloseJobButton({ jobId }: { jobId: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = async () => {
    if (!confirm("Ești sigur că vrei să închizi această ofertă?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/company/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Ofertă închisă", description: "Jobul nu mai este vizibil pentru candidați." });
      router.refresh();
    } catch {
      toast({ title: "Eroare", description: "Nu s-a putut închide jobul.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClose} disabled={isLoading} className="text-destructive border-destructive/30 hover:bg-destructive/5">
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Închide"}
    </Button>
  );
}
