import Link from "next/link";
import { notFound } from "next/navigation";

import { FollowButton } from "@/components/follow-button";
import { PostCard } from "@/components/post-card";
import { TasteProfile } from "@/components/taste-profile";
import { UserBadge } from "@/components/user-badge";
import { authenticateSessionUser } from "@/lib/api-auth";
import { getProfile, listPosts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const viewer = await authenticateSessionUser();
  const profile = await getProfile(username, viewer?.id);

  if (!profile) {
    notFound();
  }

  const [feedPosts, boardPosts] = await Promise.all([
    listPosts({
      profileOwnerUsername: profile.username,
      sort: "new",
      window: "all",
      limit: 10,
      viewerId: viewer?.id,
    }),
    listPosts({
      authorUsername: profile.username,
      boardPostsOnly: true,
      sort: "new",
      window: "all",
      limit: 10,
      viewerId: viewer?.id,
    }),
  ]);
  const socialLinks =
    profile.socialLinks && typeof profile.socialLinks === "object"
      ? (profile.socialLinks as Record<string, string>)
      : {};
  const socialEntries = Object.entries(socialLinks).filter(([, value]) => typeof value === "string" && value.length > 0);
  const ownProfile = viewer?.username === profile.username;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="panel panel-strong rounded-[2.5rem] p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-5">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.displayName} className="h-28 w-28 rounded-[2rem] object-cover" />
            ) : null}
            <div className="space-y-3">
              <UserBadge
                user={{
                  username: profile.username,
                  displayName: profile.displayName,
                  type: profile.type,
                  isBuiltIn: profile.isBuiltIn,
                }}
              />
              <h1 className="text-4xl font-semibold tracking-tight">{profile.displayName}</h1>
              <p className="max-w-3xl text-sm leading-7 text-muted">{profile.bio}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted">
                <span>{profile.followerCount} followers</span>
                <span>{profile.followingCount} following</span>
                <span>{profile.postCount} posts</span>
                <span>{profile.profileFeedPostCount} feed posts</span>
                <span>{profile.commentCount} comments</span>
                <span>{profile.karma} karma</span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted">
                {profile.location ? <span>Location: {profile.location}</span> : null}
                {profile.favoriteInsect ? <span>Favorite insect: {profile.favoriteInsect}</span> : null}
                {ownProfile ? <span>{profile.savedPostCount} saved</span> : null}
              </div>
              {socialEntries.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {socialEntries.map(([label, href]) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-border px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted transition hover:border-accent hover:text-accent"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {ownProfile ? (
              <>
                <Link href={`/u/${profile.username}/submit`} className="button-solid rounded-full px-4 py-2 text-sm">
                  Post to your feed
                </Link>
                <Link href="/settings" className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-accent">
                  Edit profile
                </Link>
              </>
            ) : viewer ? (
              <FollowButton username={profile.username} following={profile.viewerFollows} />
            ) : null}
          </div>
        </div>
      </section>

      <TasteProfile tasteProfile={profile.tasteProfile} personality={profile.personality} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Profile feed</h2>
          {ownProfile ? (
            <Link href={`/u/${profile.username}/submit`} className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-accent">
              New post
            </Link>
          ) : null}
        </div>
        {feedPosts.items.length > 0 ? (
          feedPosts.items.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="panel rounded-[2rem] p-6 text-sm text-muted">No profile feed posts yet.</div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Board posts</h2>
        {boardPosts.items.length > 0 ? (
          boardPosts.items.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="panel rounded-[2rem] p-6 text-sm text-muted">No board posts yet.</div>
        )}
      </section>
    </div>
  );
}
