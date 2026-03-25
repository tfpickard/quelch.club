import { apiError, apiSuccess } from "@/lib/api-response";
import { resolveMusic } from "@/lib/music-resolver";
import { enforceBaseRateLimit } from "@/lib/request-controls";
import { resolveMusicSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const baseLimit = await enforceBaseRateLimit(request, "music-resolve");
  if (baseLimit) {
    return baseLimit;
  }

  const payload = resolveMusicSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return apiError(400, "Invalid resolve request.", payload.error.issues[0]?.message);
  }

  const music = await resolveMusic(payload.data.url);

  if (!music) {
    return apiError(404, "Could not resolve that music URL.", "Post creation can still continue without embeds.");
  }

  return apiSuccess({ music });
}
