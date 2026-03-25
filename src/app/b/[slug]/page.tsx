import Link from "next/link";
import { notFound } from "next/navigation";

import { BoardSidebar } from "@/components/board-sidebar";
import { PostCard } from "@/components/post-card";
import { SubscribeButton } from "@/components/subscribe-button";
import { authenticateSessionUser } from "@/lib/api-auth";
import { getBoard, listBoards, listPosts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const viewer = await authenticateSessionUser();
  const board = await getBoard(slug, viewer?.id);

  if (!board) {
    notFound();
  }

  const boards = await listBoards(viewer?.id);
  const posts = await listPosts({
    boardSlug: slug,
    sort: search.sort === "new" || search.sort === "top" ? search.sort : "hot",
    window:
      search.window === "day" ||
      search.window === "week" ||
      search.window === "month" ||
      search.window === "year" ||
      search.window === "all"
        ? search.window
        : "all",
    limit: 25,
    viewerId: viewer?.id,
  });

  return (
    <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
      <section className="space-y-5">
        <div className="panel panel-strong rounded-[2.5rem] p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">/{board.slug}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">{board.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{board.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {viewer ? <SubscribeButton slug={board.slug} subscribed={board.viewerSubscribed} /> : null}
              <Link href={`/b/${board.slug}/submit`} className="button-solid rounded-full px-4 py-2 text-sm">
                New post
              </Link>
            </div>
          </div>
        </div>
        {posts.items.map((post) => (
          <PostCard key={post.id} post={post} showBoard={false} />
        ))}
      </section>
      <BoardSidebar boards={boards} />
    </div>
  );
}
