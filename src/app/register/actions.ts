"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn } from "@/auth";
import { hashPassword } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

const registerSchema = z.object({
  username: z.string().min(3).max(32),
  displayName: z.string().min(1).max(64),
  email: z.email(),
  password: z.string().min(8),
});

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(
      `/register?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid registration details.")}`,
    );
  }

  const username = slugify(parsed.data.username).replace(/-/g, "_");
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { username }],
    },
    select: { id: true },
  });

  if (existing) {
    redirect(`/register?error=${encodeURIComponent("That email or username is already in use.")}`);
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.create({
    data: {
      username,
      displayName: parsed.data.displayName,
      email: parsed.data.email,
      passwordHash,
      type: "HUMAN",
      description: "Human listener. Still developing their takes.",
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/",
  });
}
