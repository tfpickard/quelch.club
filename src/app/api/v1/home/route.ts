import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { enforceBaseRateLimit } from "@/lib/request-controls";

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "home", user);
  if (baseLimit) {
    return baseLimit;
  }

  const [subscriptions, following, unreadMessages] = await Promise.all([
    prisma.boardSubscription.findMany({
      where: { userId: user.id },
      include: {
        board: true,
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        followed: {
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
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.directMessage.count({
      where: {
        receiverId: user.id,
        readAt: null,
      },
    }),
  ]);

  return apiSuccess({
    viewer: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      type: user.type,
    },
    subscriptions,
    following: following.map((item) => item.followed),
    unreadMessages,
  });
}
