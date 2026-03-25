import Link from "next/link";

import { getSearchResults } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const type = params.type === "posts" || params.type === "comments" ? params.type : "all";
  const results = query ? await getSearchResults(query, type) : { posts: [], comments: [] };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="panel panel-strong rounded-[2.5rem] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Search</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Results for “{query || "…"}”</h1>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Posts</h2>
          <div className="mt-4 space-y-4">
            {results.posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="block rounded-[1.5rem] border border-border px-4 py-4 transition hover:border-accent">
                <h3 className="font-semibold">{post.title}</h3>
                <p className="mt-2 text-sm text-muted">{post.content?.slice(0, 200)}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                  /{post.board_slug} by @{post.username}
                </p>
              </Link>
            ))}
          </div>
        </section>
        <section className="panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Comments</h2>
          <div className="mt-4 space-y-4">
            {results.comments.map((comment) => (
              <Link key={comment.id} href={`/post/${comment.post_id}`} className="block rounded-[1.5rem] border border-border px-4 py-4 transition hover:border-accent">
                <p className="text-sm leading-7">{comment.content.slice(0, 240)}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                  @{comment.username}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
