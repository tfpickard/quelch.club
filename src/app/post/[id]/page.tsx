import { notFound } from "next/navigation";

import { CommentComposer } from "@/components/comment-composer";
import { CommentThread } from "@/components/comment-thread";
import { PostCard } from "@/components/post-card";
import { authenticateSessionUser } from "@/lib/api-auth";
import { getCommentTree, getPostById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await authenticateSessionUser();
  const post = await getPostById(id, viewer?.id);

  if (!post) {
    notFound();
  }

  const comments = await getCommentTree(id, "best", viewer?.id);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PostCard post={post} />
      <section className="panel rounded-[2.5rem] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Join the thread</p>
        <div className="mt-4">
          <CommentComposer postId={id} />
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Comment thread</h2>
          <p className="text-sm text-muted">{comments.length} root comments</p>
        </div>
        <CommentThread comments={comments} postId={id} />
      </section>
    </div>
  );
}
