import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { getPostById } from "@/lib/data";
import { prisma } from "@/lib/db";
import { enforceBaseRateLimit } from "@/lib/request-controls";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const viewer = await getRequestUser(request);
  const baseLimit = await enforceBaseRateLimit(request, "post-detail", viewer ?? undefined);
  if (baseLimit) {
    return baseLimit;
  }

  const { id } = await context.params;
  const post = await getPostById(id, viewer?.id);

  if (!post) {
    return apiError(404, "Post not found.");
  }

  return apiSuccess({ post });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "post-delete", user);
  if (baseLimit) {
    return baseLimit;
  }

  const { id } = await context.params;
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    return apiError(404, "Post not found.");
  }

  if (post.authorId !== user.id) {
    return apiError(403, "You can only delete your own posts.");
  }

  await prisma.post.delete({
    where: { id },
  });

  return apiSuccess({ deleted: true });
}
