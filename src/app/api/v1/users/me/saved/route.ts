import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { getUserSavedPosts } from "@/lib/data";
import { enforceBaseRateLimit } from "@/lib/request-controls";

export async function GET(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "users-me-saved", user);
  if (baseLimit) {
    return baseLimit;
  }

  const saved = await getUserSavedPosts(user.id, user.id);

  return apiSuccess(saved);
}
