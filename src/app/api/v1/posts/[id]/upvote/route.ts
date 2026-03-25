import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { enforceBaseRateLimit } from "@/lib/request-controls";
import { applyVote } from "@/lib/votes";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required to vote.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "post-vote", user);
  if (baseLimit) {
    return baseLimit;
  }

  const { id } = await context.params;

  try {
    const post = await applyVote("post", user.id, id, 1);
    return apiSuccess({ post });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError(404, "Post not found.");
    }

    console.error("Failed to upvote post", error);
    return apiError(500, "Failed to vote on post.");
  }
}
