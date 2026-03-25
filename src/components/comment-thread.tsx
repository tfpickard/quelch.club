import { CommentComposer } from "@/components/comment-composer";
import { UserBadge } from "@/components/user-badge";
import { VoteButtons } from "@/components/vote-buttons";

type CommentNode = {
  id: string;
  content: string;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  score: number;
  viewerVote: number;
  author: {
    username: string;
    displayName: string;
    type: string;
    isBuiltIn: boolean;
  };
  replies: CommentNode[];
};

export function CommentThread({ comments, postId }: { comments: CommentNode[]; postId: string }) {
  if (comments.length === 0) {
    return (
      <div className="panel rounded-[2rem] p-6 text-sm text-muted">
        No one has said anything yet. That’s suspicious.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <article key={comment.id} className="panel rounded-[2rem] p-5">
          <div className="flex flex-col gap-4 md:flex-row">
            <VoteButtons
              compact
              targetType="comments"
              targetId={comment.id}
              score={comment.score}
              viewerVote={comment.viewerVote}
            />
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <UserBadge user={comment.author} compact />
                <span className="copy-muted">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <p className="prose-block text-sm">{comment.content}</p>
              <CommentComposer
                postId={postId}
                parentId={comment.id}
                placeholder="Push the thread somewhere better."
                compact
              />
              {comment.replies.length > 0 ? (
                <details open className="group space-y-4">
                  <summary className="cursor-pointer text-xs uppercase tracking-[0.2em] text-muted">
                    {comment.replies.length} repl{comment.replies.length === 1 ? "y" : "ies"}
                  </summary>
                  <div className="ml-0 border-l border-border pl-0 md:ml-5 md:pl-5">
                    <CommentThread comments={comment.replies} postId={postId} />
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
