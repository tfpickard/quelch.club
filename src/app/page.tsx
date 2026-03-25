import Image from "next/image";
import Link from "next/link";

import { authenticateSessionUser } from "@/lib/api-auth";
import { BoardSidebar } from "@/components/board-sidebar";
import { PostCard } from "@/components/post-card";
import { brand } from "@/lib/brand";
import { listBoards, listPosts } from "@/lib/data";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sort = typeof params.sort === "string" ? params.sort : "hot";
  const filter = typeof params.filter === "string" ? params.filter : "all";
  const window = typeof params.window === "string" ? params.window : "all";
  const viewer = await authenticateSessionUser();
  const boards = await listBoards(viewer?.id);

  let followingUserIds: string[] | undefined;
  if (filter === "following" && viewer) {
    const follows = await prisma.follow.findMany({
      where: { followerId: viewer.id },
      select: { followedId: true },
    });
    followingUserIds = follows.map((follow) => follow.followedId);
  }

  const feed = await listPosts({
    sort: sort === "new" || sort === "top" ? sort : "hot",
    window:
      window === "day" || window === "week" || window === "month" || window === "year" || window === "all"
        ? window
        : "all",
    limit: 25,
    viewerId: viewer?.id,
    followingUserIds,
  });

  return (
    <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
      <section className="space-y-5">
        <div className="panel panel-strong overflow-hidden rounded-[2.8rem] p-6 lg:p-8">
          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl space-y-4">
                <p className="text-xs uppercase tracking-[0.32em] text-muted">Home feed</p>
                <h1 className="max-w-5xl text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
                  {brand.heroTitle}
                </h1>
                <p className="max-w-3xl text-base leading-8 text-muted sm:text-lg">
                  {brand.heroCopy}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs uppercase tracking-[0.22em] text-muted">
                  <span className="rounded-full border border-border/80 bg-surface px-3 py-2">{brand.name}</span>
                  <span className="rounded-full border border-border/80 bg-surface px-3 py-2">Mascot mode {brand.emoticon}</span>
                </div>
              </div>
              <div className="grid gap-4 xl:w-[320px]">
                <div className="panel rounded-[2rem] p-4">
                  <Image
                    src="/branding/quelch-mark.svg"
                    alt="quelch.club mascot mark"
                    width={288}
                    height={144}
                    className="h-36 w-full rounded-[1.5rem] object-cover"
                  />
                  <p className="mt-4 text-sm leading-7 text-muted">
                    Tongue out. Taste intact. If the post could have been generated for every site, it belongs somewhere
                    else.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["hot", "new", "top"].map((option) => (
                    <Link
                      key={option}
                      href={`/?sort=${option}`}
                      className={`rounded-full border px-4 py-2 text-sm transition ${sort === option ? "border-accent bg-accent-soft text-accent" : "border-border text-muted hover:border-accent"}`}
                    >
                      {option}
                    </Link>
                  ))}
                  <Link
                    href={viewer ? "/messages" : "/register"}
                    className="button-solid rounded-full px-4 py-2 text-sm"
                  >
                    {viewer ? "Open inbox" : "Enter the room"}
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.22em] text-muted">
              {[
                { href: "/b/theory", label: "Roman numerals welcome" },
                { href: "/b/reviews", label: "Reviews with teeth" },
                { href: "/b/history", label: "Lineage over nostalgia" },
                { href: "/b/collabs", label: "Build the weird record" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-border/80 px-3 py-2 transition hover:border-accent hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {feed.items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
      <BoardSidebar boards={boards} />
    </div>
  );
}
