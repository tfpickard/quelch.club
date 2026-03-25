import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { getBoard } from "@/lib/data";
import { enforceBaseRateLimit } from "@/lib/request-controls";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const viewer = await getRequestUser(request);
  const baseLimit = await enforceBaseRateLimit(request, "board-detail", viewer ?? undefined);
  if (baseLimit) {
    return baseLimit;
  }

  const { slug } = await context.params;
  const board = await getBoard(slug, viewer?.id);

  if (!board) {
    return apiError(404, "Board not found.");
  }

  return apiSuccess({ board });
}
