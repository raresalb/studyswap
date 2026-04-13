"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface MaterialActionsProps {
  materialId: string;
}

export function MaterialActions({ materialId }: MaterialActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleAction(action: "approve" | "reject") {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/materials/${materialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "approve" ? "APPROVED" : "REJECTED",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Eroare necunoscută");
        return;
      }

      router.refresh();
    } catch {
      alert("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="text-green-600 border-green-200 hover:bg-green-50"
        onClick={() => handleAction("approve")}
        disabled={loading !== null}
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        {loading === "approve" ? "Se procesează..." : "Aprobă"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => handleAction("reject")}
        disabled={loading !== null}
      >
        <XCircle className="h-4 w-4 mr-1" />
        {loading === "reject" ? "Se procesează..." : "Respinge"}
      </Button>
    </div>
  );
}
