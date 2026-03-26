import Link from "next/link";
import { redirect } from "next/navigation";

import { PostCard } from "@/components/post-card";
import { updateSettingsAction } from "@/app/settings/actions";
import { authenticateSessionUser } from "@/lib/api-auth";
import { getUserSavedPosts, listPosts } from "@/lib/data";

export const dynamic = "force-dynamic";

function socialLinksRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, string>) : {};
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await authenticateSessionUser();

  if (!viewer) {
    redirect("/login");
  }

  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : null;
  const error = typeof params.error === "string" ? params.error : null;
  const socialLinks = socialLinksRecord(viewer.socialLinks);
  const [savedPosts, profileFeedPosts] = await Promise.all([
    getUserSavedPosts(viewer.id, viewer.id),
    listPosts({
      profileOwnerUsername: viewer.username,
      sort: "new",
      window: "all",
      limit: 10,
      viewerId: viewer.id,
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <section className="panel panel-strong rounded-[2.5rem] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Settings</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Profile control panel</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Shape your public profile, keep track of saved posts, and post directly to your own feed.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/u/${viewer.username}`} className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-accent">
              View profile
            </Link>
            <Link href={`/u/${viewer.username}/submit`} className="button-solid rounded-full px-4 py-2 text-sm">
              Post to your feed
            </Link>
          </div>
        </div>
        {status === "saved" ? (
          <p className="mt-5 rounded-full border border-secondary/30 bg-secondary-soft px-4 py-2 text-sm text-secondary">
            Profile saved.
          </p>
        ) : null}
        {error ? (
          <p className="mt-5 rounded-full border border-accent/30 bg-accent-soft px-4 py-2 text-sm text-accent">
            {error}
          </p>
        ) : null}
        <form action={updateSettingsAction} className="mt-8 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Username</label>
              <input value={`@${viewer.username}`} disabled className="w-full rounded-[1.4rem] border border-border bg-black/10 px-4 py-3 text-muted outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Display name</label>
              <input name="displayName" defaultValue={viewer.displayName} className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent" />
            </div>
            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Location</label>
              <input name="location" defaultValue={viewer.location ?? ""} className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent" />
            </div>
            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Favorite insect</label>
              <input name="favoriteInsect" defaultValue={viewer.favoriteInsect ?? ""} className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Avatar URL</label>
              <input name="avatarUrl" defaultValue={viewer.avatarUrl ?? ""} className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Bio</label>
              <textarea
                name="bio"
                defaultValue={viewer.description ?? ""}
                className="min-h-36 w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent"
              />
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">Social links</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["website", "Website"],
                ["x", "X / Twitter"],
                ["instagram", "Instagram"],
                ["tiktok", "TikTok"],
                ["youtube", "YouTube"],
                ["spotify", "Spotify"],
                ["soundcloud", "SoundCloud"],
                ["bandcamp", "Bandcamp"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">{label}</label>
                  <input
                    name={name}
                    defaultValue={socialLinks[name] ?? ""}
                    className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 text-sm text-muted">
              <span>{viewer.type}</span>
              <span>{viewer.karma} karma</span>
            </div>
            <button type="submit" className="button-solid rounded-full px-5 py-3 text-sm font-medium">
              Save profile
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Your feed posts</h2>
          <Link href={`/u/${viewer.username}/submit`} className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-accent">
            New feed post
          </Link>
        </div>
        {profileFeedPosts.items.length > 0 ? profileFeedPosts.items.map((post) => <PostCard key={post.id} post={post} />) : (
          <div className="panel rounded-[2rem] p-6 text-sm text-muted">No feed posts yet.</div>
        )}
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Saved posts</h2>
        {savedPosts.items.length > 0 ? savedPosts.items.map((post) => <PostCard key={post.id} post={post} />) : (
          <div className="panel rounded-[2rem] p-6 text-sm text-muted">You have not saved any posts yet.</div>
        )}
      </section>
    </div>
  );
}
