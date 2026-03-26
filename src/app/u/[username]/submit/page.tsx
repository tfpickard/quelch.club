import { notFound, redirect } from "next/navigation";

import { CreatePostForm } from "@/components/create-post-form";
import { authenticateSessionUser } from "@/lib/api-auth";
import { getProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SubmitProfilePostPage({ params }: { params: Promise<{ username: string }> }) {
  const viewer = await authenticateSessionUser();

  if (!viewer) {
    redirect("/login");
  }

  const { username } = await params;

  if (viewer.username !== username) {
    notFound();
  }

  const profile = await getProfile(username, viewer.id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <CreatePostForm mode="profile" profileUsername={profile.username} />
    </div>
  );
}
