import { apiError, apiSuccess } from "@/lib/api-response";
import { getSearchResults } from "@/lib/data";
import { enforceBaseRateLimit } from "@/lib/request-controls";
import { searchSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const baseLimit = await enforceBaseRateLimit(request, "search");
  if (baseLimit) {
    return baseLimit;
  }

  const { searchParams } = new URL(request.url);
  const payload = searchSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    type: searchParams.get("type") ?? undefined,
  });

  if (!payload.success) {
    return apiError(400, "Invalid search query.", payload.error.issues[0]?.message);
  }

  const results = await getSearchResults(payload.data.q, payload.data.type);
  return apiSuccess(results);
}
