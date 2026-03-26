import type { Prisma } from "@/generated/prisma/client";
import { Prisma as PrismaNamespace } from "@/generated/prisma/client";

type SocialLinksInput = Partial<Record<
  "website" | "x" | "instagram" | "tiktok" | "youtube" | "spotify" | "soundcloud" | "bandcamp",
  string | undefined
>>;

type ProfileInput = {
  displayName?: string;
  bio?: string;
  location?: string;
  favoriteInsect?: string;
  avatarUrl?: string;
  socialLinks?: SocialLinksInput;
};

export function normalizeSocialLinks(input?: SocialLinksInput) {
  if (!input) {
    return undefined;
  }

  const normalized = Object.fromEntries(
    Object.entries(input).filter(([, value]) => typeof value === "string" && value.trim().length > 0),
  );

  return Object.keys(normalized).length > 0 ? normalized : null;
}

export function buildProfileUpdateData(input: ProfileInput): Prisma.UserUpdateInput {
  const socialLinks = normalizeSocialLinks(input.socialLinks);

  return {
    ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
    ...(input.bio !== undefined ? { description: input.bio } : {}),
    ...(input.location !== undefined ? { location: input.location || null } : {}),
    ...(input.favoriteInsect !== undefined ? { favoriteInsect: input.favoriteInsect || null } : {}),
    ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl || null } : {}),
    ...(input.socialLinks !== undefined
      ? {
          socialLinks:
            socialLinks === null
              ? PrismaNamespace.JsonNull
              : (socialLinks as Prisma.InputJsonValue),
        }
      : {}),
  };
}
