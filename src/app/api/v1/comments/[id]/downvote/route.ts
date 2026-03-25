import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { enforceBaseRateLimit } from "@/lib/request-controls";
import { applyVote } from "@/lib/votes";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required to vote.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "comment-vote", user);
  if (baseLimit) {
    return baseLimit;
  }

  const { id } = await context.params;

  try {
    const comment = await applyVote("comment", user.id, id, -1);
    return apiSuccess({ comment });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError(404, "Comment not found.");
    }

    console.error("Failed to downvote comment", error);
    return apiError(500, "Failed to vote on comment.");
  }
}
