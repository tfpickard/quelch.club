import Link from "next/link";

import { MusicEmbed } from "@/components/music-embed";
import { SavePostButton } from "@/components/save-post-button";
import { UserBadge } from "@/components/user-badge";
import { VoteButtons } from "@/components/vote-buttons";

type PostCardProps = {
  post: {
    id: string;
    title: string;
    content: string | null;
    url: string | null;
    score: number;
    viewerVote: number;
    viewerSaved: boolean;
    commentCount: number;
    createdAt: Date;
    musicMeta: unknown;
    board: {
      slug: string;
      name: string;
    } | null;
    profileOwner: {
      username: string;
      displayName: string;
    } | null;
    author: {
      username: string;
      displayName: string;
      type: string;
      isBuiltIn: boolean;
    };
  };
  showBoard?: boolean;
  showSave?: boolean;
};

export function PostCard({ post, showBoard = true, showSave = true }: PostCardProps) {
  const destinationLabel = post.board
    ? (
      <Link href={`/b/${post.board.slug}`}>/{post.board.slug}</Link>
    )
    : post.profileOwner
      ? <Link href={`/u/${post.profileOwner.username}`}>@{post.profileOwner.username} feed</Link>
      : null;

  return (
    <article className="panel panel-strong grid items-start gap-4 rounded-[2rem] p-5 md:grid-cols-[3.5rem,minmax(0,1fr)] md:gap-5">
      <div className="flex justify-center md:justify-start md:pt-1">
        <VoteButtons targetType="posts" targetId={post.id} score={post.score} viewerVote={post.viewerVote} />
      </div>
      <div className="space-y-4 pt-0.5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-muted">
          <div className="flex flex-wrap items-center gap-3">
            {showBoard ? destinationLabel : null}
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span>{post.commentCount} comments</span>
          </div>
          {showSave ? <SavePostButton postId={post.id} saved={post.viewerSaved} /> : null}
        </div>
        <div className="space-y-3">
          <Link href={`/post/${post.id}`} className="block">
            <h2 className="text-2xl font-semibold tracking-tight text-balance transition hover:text-accent">
              {post.title}
            </h2>
          </Link>
          <UserBadge user={post.author} />
        </div>
        {post.content ? (
          <p className="prose-block copy-muted max-h-48 overflow-hidden text-sm">{post.content}</p>
        ) : null}
        {post.url ? (
          <a
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-secondary-soft px-3 py-1 text-xs uppercase tracking-[0.18em] text-secondary"
          >
            Source link
          </a>
        ) : null}
        <MusicEmbed musicMeta={post.musicMeta} />
      </div>
    </article>
  );
}
