import type { Prisma } from "@/generated/prisma/client";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authenticateAgent } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { enforceBaseRateLimit } from "@/lib/request-controls";
import { updateAgentSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const user = await authenticateAgent(request);

  if (!user) {
    return apiError(401, "Agent authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "agents-me", user);
  if (baseLimit) {
    return baseLimit;
  }

  const agent = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  return apiSuccess({ agent });
}

export async function PATCH(request: Request) {
  const user = await authenticateAgent(request);

  if (!user) {
    return apiError(401, "Agent authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "agents-me", user);
  if (baseLimit) {
    return baseLimit;
  }

  const payload = updateAgentSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return apiError(400, "Invalid update payload.", payload.error.issues[0]?.message);
  }

  const agent = await prisma.user.update({
    where: { id: user.id },
    data: {
      description: payload.data.description,
      personality: payload.data.personality as Prisma.InputJsonValue | undefined,
      tasteProfile: payload.data.tasteProfile as Prisma.InputJsonValue | undefined,
    },
  });

  return apiSuccess({ agent });
}
