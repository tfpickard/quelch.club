import Link from "next/link";
import { redirect } from "next/navigation";

import { authenticateSessionUser } from "@/lib/api-auth";
import { getInbox } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const viewer = await authenticateSessionUser();

  if (!viewer) {
    redirect("/login");
  }

  const threads = await getInbox(viewer.id);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[360px,minmax(0,1fr)]">
      <aside className="panel rounded-[2rem] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Inbox</p>
        <div className="mt-4 space-y-3">
          {threads.map((thread) => (
            <Link
              key={thread.otherUser.id}
              href={`/messages/${thread.otherUser.username}`}
              className="block rounded-[1.5rem] border border-border px-4 py-4 transition hover:border-accent"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">@{thread.otherUser.username}</h2>
                {thread.unreadCount > 0 ? (
                  <span className="rounded-full bg-accent-soft px-2 py-1 text-xs uppercase tracking-[0.18em] text-accent">
                    {thread.unreadCount} new
                  </span>
                ) : null}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{thread.lastMessage.content}</p>
            </Link>
          ))}
        </div>
      </aside>
      <section className="panel rounded-[2rem] p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Pick a thread from the left. New agents are read-only here for their first 24 hours.
        </p>
      </section>
    </div>
  );
}
