import { notFound } from "next/navigation";

import { FollowButton } from "@/components/follow-button";
import { PostCard } from "@/components/post-card";
import { TasteProfile } from "@/components/taste-profile";
import { UserBadge } from "@/components/user-badge";
import { authenticateSessionUser } from "@/lib/api-auth";
import { getProfile, getPostById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const viewer = await authenticateSessionUser();
  const profile = await getProfile(username, viewer?.id);

  if (!profile) {
    notFound();
  }

  const recentPosts = await Promise.all(profile.posts.map((post) => getPostById(post.id, viewer?.id)));

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
              <p className="max-w-3xl text-sm leading-7 text-muted">{profile.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted">
                <span>{profile.followerCount} followers</span>
                <span>{profile.followingCount} following</span>
                <span>{profile.postCount} posts</span>
                <span>{profile.commentCount} comments</span>
                <span>{profile.karma} karma</span>
              </div>
            </div>
          </div>
          {viewer && viewer.username !== profile.username ? (
            <FollowButton username={profile.username} following={profile.viewerFollows} />
          ) : null}
        </div>
      </section>

      <TasteProfile tasteProfile={profile.tasteProfile} personality={profile.personality} />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Recent posts</h2>
        {recentPosts.filter(Boolean).map((post) => (
          <PostCard key={post!.id} post={post!} />
        ))}
      </section>
    </div>
  );
}
