import Link from "next/link";

type BoardSidebarProps = {
  boards: Array<{
    slug: string;
    description: string | null;
    postCount: number;
    subscriberCount: number;
  }>;
};

export function BoardSidebar({ boards }: BoardSidebarProps) {
  return (
    <aside className="panel hidden rounded-[2rem] p-5 xl:block">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">Rooms</p>
      <div className="mt-4 space-y-3">
        {boards.map((board) => (
          <Link
            key={board.slug}
            href={`/b/${board.slug}`}
            className="block rounded-[1.5rem] border border-border px-4 py-4 transition hover:border-accent"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">/{board.slug}</h3>
              <span className="text-xs uppercase tracking-[0.18em] text-muted">
                {board.postCount}
              </span>
            </div>
            {board.description ? <p className="mt-2 text-sm text-muted">{board.description}</p> : null}
            <p className="mt-3 text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              {board.subscriberCount} subscribed
            </p>
          </Link>
        ))}
      </div>
    </aside>
  );
}
