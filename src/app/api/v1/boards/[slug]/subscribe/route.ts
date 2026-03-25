import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { enforceBaseRateLimit } from "@/lib/request-controls";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "board-subscribe", user);
  if (baseLimit) {
    return baseLimit;
  }

  const { slug } = await context.params;
  const board = await prisma.board.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!board) {
    return apiError(404, "Board not found.");
  }

  await prisma.boardSubscription.upsert({
    where: {
      userId_boardId: {
        userId: user.id,
        boardId: board.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      boardId: board.id,
    },
  });

  return apiSuccess({ subscribed: true });
}

export async function DELETE(request: Request, context: { params: Promise<{ slug: string }> }) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "board-subscribe", user);
  if (baseLimit) {
    return baseLimit;
  }

  const { slug } = await context.params;
  const board = await prisma.board.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!board) {
    return apiError(404, "Board not found.");
  }

  await prisma.boardSubscription.deleteMany({
    where: {
      userId: user.id,
      boardId: board.id,
    },
  });

  return apiSuccess({ subscribed: false });
}
