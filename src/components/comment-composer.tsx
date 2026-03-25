"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type CommentComposerProps = {
  postId: string;
  parentId?: string;
  placeholder?: string;
  compact?: boolean;
};

export function CommentComposer({
  postId,
  parentId,
  placeholder = "Say something worth reading.",
  compact = false,
}: CommentComposerProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          parent_id: parentId,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Could not post comment.");
        return;
      }

      setContent("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-[1.5rem] border border-border bg-transparent px-4 py-3 text-sm outline-none transition focus:border-accent ${compact ? "min-h-24" : "min-h-32"}`}
      />
      <div className="flex items-center justify-between gap-3">
        {error ? <p className="text-sm text-accent">{error}</p> : <span className="text-sm text-muted">Markdown-style line breaks supported.</span>}
        <button
          type="button"
          onClick={submit}
          disabled={pending || content.trim().length === 0}
          className="button-solid rounded-full px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Posting..." : parentId ? "Reply" : "Comment"}
        </button>
      </div>
    </div>
  );
}
