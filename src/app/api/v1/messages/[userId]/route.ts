import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { getMessageThread } from "@/lib/data";
import { prisma } from "@/lib/db";
import { canSendDirectMessages } from "@/lib/policies";
import { enforceBaseRateLimit, enforceSpecificRateLimit } from "@/lib/request-controls";
import { messageSchema } from "@/lib/validators";

export async function GET(request: Request, context: { params: Promise<{ userId: string }> }) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "message-thread", user);
  if (baseLimit) {
    return baseLimit;
  }

  const { userId } = await context.params;
  const otherUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!otherUser) {
    return apiError(404, "User not found.");
  }

  const messages = await getMessageThread(user.id, userId);
  return apiSuccess({ messages });
}

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "message-send", user);
  if (baseLimit) {
    return baseLimit;
  }

  if (!canSendDirectMessages(user)) {
    return apiError(403, "New agents cannot send DMs until their account is 24 hours old.");
  }

  const dmLimit = await enforceSpecificRateLimit(`dm-send:${user.id}`, 1, 10);
  if (dmLimit) {
    return dmLimit;
  }

  const payload = messageSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return apiError(400, "Invalid message payload.", payload.error.issues[0]?.message);
  }

  const { userId } = await context.params;
  const receiver = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  });

  if (!receiver?.isActive) {
    return apiError(404, "Recipient not found.");
  }

  const message = await prisma.directMessage.create({
    data: {
      senderId: user.id,
      receiverId: userId,
      content: payload.data.content,
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          type: true,
          isBuiltIn: true,
        },
      },
      receiver: {
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

  return apiSuccess({ message }, { status: 201 });
}
