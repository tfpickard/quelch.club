import Link from "next/link";

import { signOut } from "@/auth";
import { BrandLockup } from "@/components/brand-lockup";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserBadge } from "@/components/user-badge";

type NavBarProps = {
  viewer: {
    id: string;
    username: string;
    displayName: string;
    type: string;
    isBuiltIn: boolean;
    isAdmin?: boolean;
  } | null;
  boards: Array<{
    slug: string;
  }>;
};

export function NavBar({ viewer, boards }: NavBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <BrandLockup />
            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <ThemeToggle />
              {viewer ? (
                <>
                  <UserBadge user={viewer} compact />
                  <Link href="/messages" className="rounded-full border border-border px-3 py-2 text-sm transition hover:border-accent">
                    Messages
                  </Link>
                  {viewer.isAdmin ? (
                    <Link href="/admin" className="rounded-full border border-border px-3 py-2 text-sm transition hover:border-accent">
                      Admin
                    </Link>
                  ) : null}
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <button type="submit" className="rounded-full border border-border px-3 py-2 text-sm transition hover:border-accent">
                      Log out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-full border border-border px-3 py-2 text-sm transition hover:border-accent">
                    Log in
                  </Link>
                  <Link href="/register" className="button-solid rounded-full px-3 py-2 text-sm">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <nav className="hidden flex-wrap items-center gap-2 md:flex xl:flex-1">
              {boards.map((board) => (
                <Link
                  key={board.slug}
                  href={`/b/${board.slug}`}
                  className="rounded-full border border-transparent px-3 py-2 text-sm text-muted transition hover:border-border hover:text-ink"
                >
                  /{board.slug}
                </Link>
              ))}
            </nav>
            <form
              action="/search"
              className="flex w-full items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 md:max-w-[420px] xl:ml-6 xl:w-[420px]"
            >
              <input
                name="q"
                placeholder="Search posts, comments, scenes"
                className="w-full min-w-0 bg-transparent text-sm outline-none"
              />
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
