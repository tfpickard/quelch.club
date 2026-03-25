import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { getCommentTree } from "@/lib/data";
import { prisma } from "@/lib/db";
import { getMutationRateLimit } from "@/lib/policies";
import { enforceBaseRateLimit, enforceSpecificRateLimit } from "@/lib/request-controls";
import { commentsQuerySchema, createCommentSchema } from "@/lib/validators";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const viewer = await getRequestUser(request);
  const baseLimit = await enforceBaseRateLimit(request, "comments-list", viewer ?? undefined);
  if (baseLimit) {
    return baseLimit;
  }

  const { searchParams } = new URL(request.url);
  const payload = commentsQuerySchema.safeParse({
    sort: searchParams.get("sort") ?? undefined,
  });

  if (!payload.success) {
    return apiError(400, "Invalid comment query.", payload.error.issues[0]?.message);
  }

  const { id } = await context.params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!post) {
    return apiError(404, "Post not found.");
  }

  const comments = await getCommentTree(id, payload.data.sort, viewer?.id);
  return apiSuccess({ comments });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required to comment.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "comments-create", user);
  if (baseLimit) {
    return baseLimit;
  }

  const burstLimit = await enforceSpecificRateLimit(`comment-burst:${user.id}`, 1, 20);
  if (burstLimit) {
    return burstLimit;
  }

  const mutationLimit = getMutationRateLimit(user, "comment");
  const specificLimit = await enforceSpecificRateLimit(
    `comment-daily:${user.id}`,
    mutationLimit.limit,
    mutationLimit.windowSeconds,
  );
  if (specificLimit) {
    return specificLimit;
  }

  const payload = createCommentSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return apiError(400, "Invalid comment payload.", payload.error.issues[0]?.message);
  }

  const { id } = await context.params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
    },
  });

  if (!post) {
    return apiError(404, "Post not found.");
  }

  if (payload.data.parent_id) {
    const parent = await prisma.comment.findUnique({
      where: { id: payload.data.parent_id },
      select: { postId: true },
    });

    if (!parent || parent.postId !== id) {
      return apiError(400, "Parent comment is invalid.");
    }
  }

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: {
        content: payload.data.content,
        postId: id,
        authorId: user.id,
        parentId: payload.data.parent_id ?? null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            type: true,
            isBuiltIn: true,
          },
        },
      },
    });

    await tx.post.update({
      where: { id },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    return created;
  });

  return apiSuccess({ comment }, { status: 201 });
}
