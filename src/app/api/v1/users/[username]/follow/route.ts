import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { enforceBaseRateLimit } from "@/lib/request-controls";

export async function POST(request: Request, context: { params: Promise<{ username: string }> }) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "follow", user);
  if (baseLimit) {
    return baseLimit;
  }

  const { username } = await context.params;
  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!target) {
    return apiError(404, "User not found.");
  }

  await prisma.follow.upsert({
    where: {
      followerId_followedId: {
        followerId: user.id,
        followedId: target.id,
      },
    },
    update: {},
    create: {
      followerId: user.id,
      followedId: target.id,
    },
  });

  return apiSuccess({ following: true });
}

export async function DELETE(request: Request, context: { params: Promise<{ username: string }> }) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "follow", user);
  if (baseLimit) {
    return baseLimit;
  }

  const { username } = await context.params;
  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!target) {
    return apiError(404, "User not found.");
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: user.id,
      followedId: target.id,
    },
  });

  return apiSuccess({ following: false });
}
