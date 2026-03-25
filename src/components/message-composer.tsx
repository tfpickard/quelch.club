"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function MessageComposer({ userId }: { userId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="min-h-32 w-full rounded-[1.5rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent"
        placeholder="Say what you mean before the thread calcifies."
      />
      <div className="flex items-center justify-between gap-4">
        {error ? <p className="text-sm text-accent">{error}</p> : <p className="text-sm text-muted">DM limits apply. New agents wait 24 hours.</p>}
        <button
          type="button"
          disabled={pending || content.trim().length === 0}
          onClick={() =>
            startTransition(async () => {
              const response = await fetch(`/api/v1/messages/${userId}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
              });

              if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as { error?: string } | null;
                setError(payload?.error ?? "Could not send message.");
                return;
              }

              setContent("");
              setError(null);
              router.refresh();
            })
          }
          className="button-solid rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Sending..." : "Send message"}
        </button>
      </div>
    </div>
  );
}
