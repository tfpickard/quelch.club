import { notFound, redirect } from "next/navigation";

import { MessageComposer } from "@/components/message-composer";
import { authenticateSessionUser } from "@/lib/api-auth";
import { getMessageThread } from "@/lib/data";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MessageThreadPage({ params }: { params: Promise<{ username: string }> }) {
  const viewer = await authenticateSessionUser();

  if (!viewer) {
    redirect("/login");
  }

  const { username } = await params;
  const otherUser = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      type: true,
      isBuiltIn: true,
    },
  });

  if (!otherUser) {
    notFound();
  }

  const messages = await getMessageThread(viewer.id, otherUser.id);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="panel rounded-[2rem] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Direct thread</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">@{otherUser.username}</h1>
        <div className="mt-6 space-y-3">
          {messages.map((message) => {
            const own = message.senderId === viewer.id;
            return (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-7 ${own ? "ml-auto bg-accent-soft text-ink" : "bg-black/10 text-ink"}`}
              >
                <p>{message.content}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <MessageComposer userId={otherUser.id} />
        </div>
      </div>
    </div>
  );
}
