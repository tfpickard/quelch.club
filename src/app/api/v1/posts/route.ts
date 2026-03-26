import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { listPosts } from "@/lib/data";
import { prisma } from "@/lib/db";
import { resolveMusic } from "@/lib/music-resolver";
import { getMutationRateLimit } from "@/lib/policies";
import { enforceBaseRateLimit, enforceSpecificRateLimit } from "@/lib/request-controls";
import { boardQuerySchema, createPostSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const viewer = await getRequestUser(request);
  const baseLimit = await enforceBaseRateLimit(request, "posts-list", viewer ?? undefined);
  if (baseLimit) {
    return baseLimit;
  }

  const { searchParams } = new URL(request.url);
  const payload = boardQuerySchema.safeParse({
    board: searchParams.get("board") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    window: searchParams.get("window") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!payload.success) {
    return apiError(400, "Invalid query.", payload.error.issues[0]?.message);
  }

  const posts = await listPosts({
    boardSlug: payload.data.board,
    sort: payload.data.sort,
    window: payload.data.window,
    cursor: payload.data.cursor,
    limit: payload.data.limit,
    viewerId: viewer?.id,
  });

  return apiSuccess(posts);
}

export async function POST(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    return apiError(401, "Authentication required to create posts.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "posts-create", user);
  if (baseLimit) {
    return baseLimit;
  }

  const mutationLimit = getMutationRateLimit(user, "post");
  const specificLimit = await enforceSpecificRateLimit(
    `create-post:${user.id}`,
    mutationLimit.limit,
    mutationLimit.windowSeconds,
  );
  if (specificLimit) {
    return specificLimit;
  }

  const payload = createPostSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return apiError(400, "Invalid post payload.", payload.error.issues[0]?.message);
  }

  const board =
    payload.data.feed === "PROFILE"
      ? null
      : await prisma.board.findUnique({
          where: {
            slug: payload.data.board,
          },
        });

  if (payload.data.feed !== "PROFILE" && !board) {
    return apiError(404, "Board not found.");
  }

  const inferredType =
    payload.data.type ??
    (payload.data.url ? "LINK" : "TEXT");

  const musicMeta = payload.data.url ? await resolveMusic(payload.data.url) : null;

  const post = await prisma.post.create({
    data: {
      title: payload.data.title,
      content: payload.data.content,
      url: payload.data.url,
      type: inferredType,
      boardId: payload.data.feed === "PROFILE" ? null : board!.id,
      authorId: user.id,
      profileOwnerId: payload.data.feed === "PROFILE" ? user.id : null,
      musicMeta: musicMeta ?? undefined,
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
      board: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
        },
      },
      profileOwner: {
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

  return apiSuccess({ post }, { status: 201 });
}
