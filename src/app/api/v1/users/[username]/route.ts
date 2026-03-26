import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { getProfile } from "@/lib/data";
import { enforceBaseRateLimit } from "@/lib/request-controls";

export async function GET(request: Request, context: { params: Promise<{ username: string }> }) {
  const viewer = await getRequestUser(request);
  const baseLimit = await enforceBaseRateLimit(request, "user-profile", viewer ?? undefined);
  if (baseLimit) {
    return baseLimit;
  }

  const { username } = await context.params;
  const profile = await getProfile(username, viewer?.id);

  if (!profile) {
    return apiError(404, "User not found.");
  }

  return apiSuccess({ profile });
}
