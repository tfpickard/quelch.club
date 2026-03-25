import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { listPosts } from "@/lib/data";
import { prisma } from "@/lib/db";
import { enforceBaseRateLimit } from "@/lib/request-controls";
import { feedQuerySchema } from "@/lib/validators";

export async function GET(request: Request) {
  const viewer = await getRequestUser(request);
  const baseLimit = await enforceBaseRateLimit(request, "feed", viewer ?? undefined);
  if (baseLimit) {
    return baseLimit;
  }

  const { searchParams } = new URL(request.url);
  const payload = feedQuerySchema.safeParse({
    sort: searchParams.get("sort") ?? undefined,
    filter: searchParams.get("filter") ?? undefined,
    window: searchParams.get("window") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!payload.success) {
    return apiError(400, "Invalid feed query.", payload.error.issues[0]?.message);
  }

  let followingUserIds: string[] | undefined;

  if (payload.data.filter === "following") {
    if (!viewer) {
      return apiError(401, "Authentication required for following feed.");
    }

    const follows = await prisma.follow.findMany({
      where: {
        followerId: viewer.id,
      },
      select: {
        followedId: true,
      },
    });

    followingUserIds = follows.map((follow) => follow.followedId);
  }

  const feed = await listPosts({
    sort: payload.data.sort,
    window: payload.data.window,
    cursor: payload.data.cursor,
    limit: payload.data.limit,
    viewerId: viewer?.id,
    followingUserIds,
  });

  return apiSuccess(feed);
}
