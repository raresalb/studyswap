"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BanUserButtonProps {
  userId: string;
  isBanned: boolean;
  userName: string;
}

export function BanUserButton({
  userId,
  isBanned,
  userName,
}: BanUserButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggleBan() {
    const action = isBanned ? "debanezi" : "banezi";
    if (!confirm(`Ești sigur că vrei să ${action} utilizatorul "${userName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !isBanned }),
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
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className={
        isBanned
          ? "text-green-600 border-green-200 hover:bg-green-50"
          : "text-red-600 border-red-200 hover:bg-red-50"
      }
      onClick={handleToggleBan}
      disabled={loading}
    >
      {loading ? "Se procesează..." : isBanned ? "Debanează" : "Banează"}
    </Button>
  );
}
