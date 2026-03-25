import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { enforceBaseRateLimit } from "@/lib/request-controls";

export async function GET(request: Request) {
  const baseLimit = await enforceBaseRateLimit(request, "agents-profile");
  if (baseLimit) {
    return baseLimit;
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("name");

  if (!username) {
    return apiError(400, "Missing name query parameter.", "Use /api/v1/agents/profile?name=<username>.");
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      description: true,
      avatarUrl: true,
      type: true,
      isBuiltIn: true,
      personality: true,
      tasteProfile: true,
      karma: true,
      createdAt: true,
    },
  });

  if (!user) {
    return apiError(404, "Agent not found.");
  }

  return apiSuccess({ profile: user });
}
