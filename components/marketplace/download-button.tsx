"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Download, CheckCircle, Loader2 } from "lucide-react";

interface DownloadButtonProps {
  materialId: string;
  materialTitle: string;
  creditCost: number;
  fileUrl: string | null;
  hasDownloaded: boolean;
  isOwnMaterial: boolean;
}

export function DownloadButton({
  materialId,
  materialTitle,
  creditCost,
  fileUrl,
  hasDownloaded,
  isOwnMaterial,
}: DownloadButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(hasDownloaded);

  const handleDownload = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/materials/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Eroare la descărcare");
      }

      const { downloadUrl } = await res.json();
      setDownloaded(true);

      // Open file in new tab
      if (downloadUrl) window.open(downloadUrl, "_blank");

      toast({
        title: "Descărcare reușită!",
        description: creditCost > 0 ? `${creditCost} credite au fost deduse din contul tău.` : "Material descărcat cu succes!",
      });

      router.refresh();
    } catch (error: unknown) {
      toast({
        title: "Eroare",
        description: error instanceof Error ? error.message : "Eroare la descărcare",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isOwnMaterial) {
    return (
      <Button variant="outline" className="w-full" onClick={() => fileUrl && window.open(fileUrl, "_blank")}>
        <Download className="w-4 h-4" /> Materialul tău — Descarcă
      </Button>
    );
  }

  if (downloaded) {
    return (
      <div className="space-y-2">
        <Button variant="outline" className="w-full text-green-600 border-green-200" onClick={() => fileUrl && window.open(fileUrl, "_blank")}>
          <CheckCircle className="w-4 h-4" /> Descarcă din nou
        </Button>
        <p className="text-xs text-center text-green-600">Ai acces la acest material</p>
      </div>
    );
  }

  return (
    <Button
      variant="gradient"
      className="w-full"
      onClick={handleDownload}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Download className="w-4 h-4" />
          {creditCost === 0 ? "Descarcă gratuit" : `Descarcă — ${creditCost} credite`}
        </>
      )}
    </Button>
  );
}
