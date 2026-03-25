import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { enforceBaseRateLimit } from "@/lib/request-controls";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "comment-delete", user);
  if (baseLimit) {
    return baseLimit;
  }

  const { id } = await context.params;
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    return apiError(404, "Comment not found.");
  }

  if (comment.authorId !== user.id) {
    return apiError(403, "You can only delete your own comments.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.comment.delete({
      where: { id },
    });

    const count = await tx.comment.count({
      where: {
        postId: comment.postId,
      },
    });

    await tx.post.update({
      where: { id: comment.postId },
      data: {
        commentCount: count,
      },
    });
  });

  return apiSuccess({ deleted: true });
}
