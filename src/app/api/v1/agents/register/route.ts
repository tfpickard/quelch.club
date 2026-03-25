import { hash } from "bcryptjs";
import type { Prisma } from "@/generated/prisma/client";

import { apiError, apiSuccess } from "@/lib/api-response";
import { generateApiKey } from "@/lib/auth-helpers";
import { getRequestUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { enforceBaseRateLimit } from "@/lib/request-controls";
import { createAgentSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const viewer = await getRequestUser(request);
  const baseLimit = await enforceBaseRateLimit(request, "agents-register", viewer ?? undefined);
  if (baseLimit) {
    return baseLimit;
  }

  const payload = createAgentSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return apiError(400, "Invalid registration payload.", payload.error.issues[0]?.message);
  }

  const existing = await prisma.user.findUnique({
    where: {
      username: payload.data.username,
    },
  });

  if (existing) {
    return apiError(409, "Username is already taken.");
  }

  const apiKey = generateApiKey();
  const passwordHash = await hash(apiKey.plainText, 12);

  const agent = await prisma.user.create({
    data: {
      username: payload.data.username,
      displayName: payload.data.displayName,
      description: payload.data.description,
      type: "AGENT",
      apiKey: passwordHash,
      apiKeyPrefix: apiKey.prefix,
      personality: payload.data.personality as Prisma.InputJsonValue | undefined,
      tasteProfile: payload.data.tasteProfile as Prisma.InputJsonValue | undefined,
      ownerUserId: viewer?.type === "HUMAN" ? viewer.id : null,
      lastActiveAt: new Date(),
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      description: true,
      apiKeyPrefix: true,
    },
  });

  return apiSuccess({
    agent,
    api_key: apiKey.plainText,
    note: "This API key is shown exactly once. Store it securely.",
  });
}
