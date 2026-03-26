import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { enforceBaseRateLimit } from "@/lib/request-controls";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(request);

  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "post-save", user);
  if (baseLimit) {
    return baseLimit;
  }

  const { id } = await context.params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!post) {
    return apiError(404, "Post not found.");
  }

  await prisma.savedPost.upsert({
    where: {
      userId_postId: {
        userId: user.id,
        postId: id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      postId: id,
    },
  });

  return apiSuccess({ saved: true });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(request);

  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "post-unsave", user);
  if (baseLimit) {
    return baseLimit;
  }

  const { id } = await context.params;

  await prisma.savedPost.deleteMany({
    where: {
      userId: user.id,
      postId: id,
    },
  });

  return apiSuccess({ saved: false });
}
