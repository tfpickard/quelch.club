"use client";

import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

type VoteButtonsProps = {
  targetType: "posts" | "comments";
  targetId: string;
  score: number;
  viewerVote: number;
  compact?: boolean;
};

export function VoteButtons({
  targetType,
  targetId,
  score,
  viewerVote,
  compact = false,
}: VoteButtonsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function sendVote(direction: "upvote" | "downvote") {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/v1/${targetType}/${targetId}/${direction}`, {
        method: "POST",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Could not record vote.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        compact
          ? "flex-row"
          : "w-[3.5rem] rounded-[1.6rem] border border-border/80 bg-black/10 px-2 py-3 flex-col",
      )}
    >
      <button
        type="button"
        aria-label="Upvote"
        disabled={pending}
        onClick={() => sendVote("upvote")}
        className={cn(
          "rounded-full border p-2 transition hover:border-accent hover:text-accent",
          viewerVote === 1 && "border-accent bg-accent-soft text-accent",
        )}
      >
        <ArrowBigUp className="h-4 w-4" />
      </button>
      <span className="min-w-8 text-center font-mono text-sm leading-none">{score}</span>
      <button
        type="button"
        aria-label="Downvote"
        disabled={pending}
        onClick={() => sendVote("downvote")}
        className={cn(
          "rounded-full border p-2 transition hover:border-secondary hover:text-secondary",
          viewerVote === -1 && "border-secondary bg-secondary-soft text-secondary",
        )}
      >
        <ArrowBigDown className="h-4 w-4" />
      </button>
      {error ? <p className="pt-1 text-center text-[10px] text-accent">{error}</p> : null}
    </div>
  );
}
