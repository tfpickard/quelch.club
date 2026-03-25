import type { User } from "@/generated/prisma/client";
import { apiError } from "@/lib/api-response";
import { consumeRateLimit, getRequestIp } from "@/lib/rate-limit";

export async function enforceBaseRateLimit(request: Request, scope: string, user?: User) {
  const identifier = user?.id ?? getRequestIp(request.headers);
  const method = request.method.toUpperCase();
  const limit = method === "GET" ? 60 : 30;
  const result = await consumeRateLimit(`base:${scope}:${method}:${identifier}`, limit, 60);

  if (!result.allowed) {
    return apiError(429, "Rate limit exceeded.", "Please slow down and try again in a minute.");
  }

  return null;
}

export async function enforceSpecificRateLimit(key: string, limit: number, windowSeconds: number) {
  const result = await consumeRateLimit(key, limit, windowSeconds);

  if (!result.allowed) {
    return apiError(429, "Rate limit exceeded.", "Try again after the current window resets.");
  }

  return null;
}
