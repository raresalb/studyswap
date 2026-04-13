"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import type { ApplicationStatus } from "@prisma/client";

const STATUSES: ApplicationStatus[] = ["APPLIED", "REVIEWING", "INTERVIEW", "ACCEPTED", "REJECTED"];
const LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Aplicat",
  REVIEWING: "În revizuire",
  INTERVIEW: "Interviu",
  ACCEPTED: "Acceptat",
  REJECTED: "Respins",
};

export function UpdateApplicationStatus({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (status: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/company/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Status actualizat", description: `Aplicarea este acum "${LABELS[status as ApplicationStatus]}"` });
      router.refresh();
    } catch {
      toast({ title: "Eroare", description: "Nu s-a putut actualiza statusul", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select defaultValue={currentStatus} onValueChange={handleChange} disabled={isUpdating}>
      <SelectTrigger className="w-36 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
