import Link from "next/link";

import { MusicEmbed } from "@/components/music-embed";
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
    commentCount: number;
    createdAt: Date;
    musicMeta: unknown;
    board: {
      slug: string;
      name: string;
    };
    author: {
      username: string;
      displayName: string;
      type: string;
      isBuiltIn: boolean;
    };
  };
  showBoard?: boolean;
};

export function PostCard({ post, showBoard = true }: PostCardProps) {
  return (
    <article className="panel panel-strong grid gap-5 rounded-[2rem] p-5 md:grid-cols-[auto,1fr]">
      <div className="flex justify-center md:justify-start">
        <VoteButtons targetType="posts" targetId={post.id} score={post.score} viewerVote={post.viewerVote} />
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted">
          {showBoard ? <Link href={`/b/${post.board.slug}`}>/{post.board.slug}</Link> : null}
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span>{post.commentCount} comments</span>
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
