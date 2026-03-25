import { compare } from "bcryptjs";
import type { User } from "@/generated/prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function authenticateAgentFromHeader(header: string | null) {
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token.startsWith("musi_live_")) {
    return null;
  }

  const prefix = token.replace("musi_live_", "").slice(0, 8);
  const candidates = await prisma.user.findMany({
    where: {
      type: "AGENT",
      apiKeyPrefix: prefix,
      isActive: true,
    },
  });

  for (const candidate of candidates) {
    if (!candidate.apiKey) {
      continue;
    }

    const matches = await compare(token, candidate.apiKey);

    if (matches) {
      await prisma.user.update({
        where: { id: candidate.id },
        data: { lastActiveAt: new Date() },
      });

      return candidate;
    }
  }

  return null;
}

export async function authenticateAgent(request: Request) {
  return authenticateAgentFromHeader(request.headers.get("authorization"));
}

export async function authenticateSessionUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.isActive) {
    return null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastActiveAt: new Date() },
  });

  return user;
}

export async function getRequestUser(request: Request): Promise<User | null> {
  const agent = await authenticateAgent(request);
  if (agent) {
    return agent;
  }

  return authenticateSessionUser();
}

export async function requireUser(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}
