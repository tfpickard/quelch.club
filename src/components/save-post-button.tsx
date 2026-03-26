"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SavePostButton({ postId, saved }: { postId: string; saved: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticSaved, setOptimisticSaved] = useState(saved);

  function toggle() {
    startTransition(async () => {
      const nextSaved = !optimisticSaved;
      setOptimisticSaved(nextSaved);

      const response = await fetch(`/api/v1/posts/${postId}/save`, {
        method: nextSaved ? "POST" : "DELETE",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setOptimisticSaved(!nextSaved);
        return;
      }

      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      {optimisticSaved ? "Saved" : "Save"}
    </button>
  );
}
