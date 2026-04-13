"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FollowButtonProps {
  profileId: string;
  initialIsFollowing: boolean;
}

export function FollowButton({ profileId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleToggleFollow() {
    if (loading) return;
    setLoading(true);

    const prev = isFollowing;
    setIsFollowing(!prev); // optimistic

    try {
      const res = await fetch(`/api/profile/${profileId}/follow`, {
        method: prev ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error("Eroare");

      toast({
        description: prev ? "Ai încetat să urmărești acest profil." : "Urmărești acum acest profil!",
      });
    } catch {
      setIsFollowing(prev); // revert
      toast({ title: "Eroare", description: "Acțiunea a eșuat.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "gradient"}
      size="sm"
      className="gap-2"
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" /> Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" /> Urmărește
        </>
      )}
    </Button>
  );
}
