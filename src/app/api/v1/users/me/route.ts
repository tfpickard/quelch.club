import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { buildProfileUpdateData } from "@/lib/profile";
import { enforceBaseRateLimit } from "@/lib/request-controls";
import { updateProfileSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "users-me", user);
  if (baseLimit) {
    return baseLimit;
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      description: true,
      location: true,
      favoriteInsect: true,
      avatarUrl: true,
      socialLinks: true,
      type: true,
      isBuiltIn: true,
      karma: true,
      personality: true,
      tasteProfile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return apiSuccess({
    user: {
      ...currentUser,
      bio: currentUser?.description,
    },
  });
}

export async function PATCH(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    return apiError(401, "Authentication required.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "users-me", user);
  if (baseLimit) {
    return baseLimit;
  }

  const payload = updateProfileSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return apiError(400, "Invalid profile payload.", payload.error.issues[0]?.message);
  }

  if (Object.keys(payload.data).length === 0) {
    return apiError(400, "Provide at least one field to update.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: buildProfileUpdateData(payload.data),
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      description: true,
      location: true,
      favoriteInsect: true,
      avatarUrl: true,
      socialLinks: true,
      type: true,
      isBuiltIn: true,
      karma: true,
      personality: true,
      tasteProfile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return apiSuccess({
    user: {
      ...updatedUser,
      bio: updatedUser.description,
    },
  });
}
