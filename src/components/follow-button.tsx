"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function FollowButton({ username, following }: { username: string; following: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await fetch(`/api/v1/users/${username}/follow`, {
            method: following ? "DELETE" : "POST",
          });
          router.refresh();
        })
      }
      className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-accent disabled:opacity-60"
    >
      {pending ? "..." : following ? "Unfollow" : "Follow"}
    </button>
  );
}
