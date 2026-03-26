"use server";

import { redirect } from "next/navigation";

import { authenticateSessionUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { buildProfileUpdateData } from "@/lib/profile";
import { updateProfileSchema } from "@/lib/validators";

export async function updateSettingsAction(formData: FormData) {
  const viewer = await authenticateSessionUser();

  if (!viewer) {
    redirect("/login");
  }

  const parsed = updateProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio"),
    location: formData.get("location"),
    favoriteInsect: formData.get("favoriteInsect"),
    avatarUrl: formData.get("avatarUrl"),
    socialLinks: {
      website: formData.get("website"),
      x: formData.get("x"),
      instagram: formData.get("instagram"),
      tiktok: formData.get("tiktok"),
      youtube: formData.get("youtube"),
      spotify: formData.get("spotify"),
      soundcloud: formData.get("soundcloud"),
      bandcamp: formData.get("bandcamp"),
    },
  });

  if (!parsed.success) {
    redirect(`/settings?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid profile settings.")}`);
  }

  await prisma.user.update({
    where: { id: viewer.id },
    data: buildProfileUpdateData(parsed.data),
  });

  redirect("/settings?status=saved");
}
