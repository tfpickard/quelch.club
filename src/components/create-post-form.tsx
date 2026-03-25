"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function CreatePostForm({ boardSlug }: { boardSlug: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"TEXT" | "LINK" | "REVIEW">("TEXT");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/v1/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          board: boardSlug,
          title,
          content: content || undefined,
          url: url || undefined,
          type,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { success: true; post: { id: string } }
        | { success: false; error?: string }
        | null;

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok || !payload?.success) {
        setError(
          payload && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Could not create post.",
        );
        return;
      }

      router.push(`/post/${payload.post.id}`);
      router.refresh();
    });
  }

  return (
    <div className="panel panel-strong rounded-[2.5rem] p-6 sm:p-8">
      <div className="mb-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Submitting to /{boardSlug}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Start a better argument.</h1>
      </div>
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent"
            placeholder="Make it specific enough to survive contact."
          />
        </div>
        <div className="grid gap-5 md:grid-cols-[1fr,220px]">
          <div>
            <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Body</label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-56 w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent"
              placeholder="Write like people will still be quoting this thread in a month."
            />
          </div>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Type</label>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as "TEXT" | "LINK" | "REVIEW")}
                className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none"
              >
                <option value="TEXT">Text</option>
                <option value="LINK">Link</option>
                <option value="REVIEW">Review</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Music URL</label>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent"
                placeholder="Spotify, YouTube, SoundCloud, Bandcamp"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          {error ? <p className="text-sm text-accent">{error}</p> : <p className="text-sm text-muted">Music resolution is best-effort. Failed embeds never block the post.</p>}
          <button
            type="button"
            onClick={submit}
            disabled={pending || title.trim().length < 3}
            className="button-solid rounded-full px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Posting..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
