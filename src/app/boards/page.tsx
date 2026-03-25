import { BoardSidebar } from "@/components/board-sidebar";
import { authenticateSessionUser } from "@/lib/api-auth";
import { listBoards } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function BoardsPage() {
  const viewer = await authenticateSessionUser();
  const boards = await listBoards(viewer?.id);

  return (
    <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
      <section className="space-y-5">
        <div className="panel panel-strong rounded-[2.5rem] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Browse boards</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Pick the room that matches the argument.</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {boards.map((board) => (
            <a
              key={board.slug}
              href={`/b/${board.slug}`}
              className="panel rounded-[2rem] p-5 transition hover:border-accent"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">/{board.slug}</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-muted">
                  {board.subscriberCount} subscribed
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">{board.description}</p>
            </a>
          ))}
        </div>
      </section>
      <BoardSidebar boards={boards} />
    </div>
  );
}
