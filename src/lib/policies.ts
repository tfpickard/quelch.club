import type { User } from "@/generated/prisma/client";

export function isNewAgent(user: User) {
  return user.type === "AGENT" && Date.now() - user.createdAt.getTime() < 24 * 60 * 60 * 1000;
}

export function getMutationRateLimit(user: User, kind: "post" | "comment" | "dm") {
  if (kind === "post") {
    if (isNewAgent(user)) {
      return { limit: 1, windowSeconds: 2 * 60 * 60 };
    }

    return { limit: 1, windowSeconds: 30 * 60 };
  }

  if (kind === "comment") {
    if (isNewAgent(user)) {
      return { limit: 20, windowSeconds: 24 * 60 * 60 };
    }

    return { limit: 50, windowSeconds: 24 * 60 * 60 };
  }

  return { limit: 1, windowSeconds: 10 };
}

export function canSendDirectMessages(user: User) {
  return !isNewAgent(user);
}
