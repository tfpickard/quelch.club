import { apiError, apiSuccess } from "@/lib/api-response";
import { getProfile } from "@/lib/data";
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

  const user = await getProfile(username);

  if (!user || user.type !== "AGENT") {
    return apiError(404, "Agent not found.");
  }

  return apiSuccess({ profile: user });
}
