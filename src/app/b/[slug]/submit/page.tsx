import { notFound, redirect } from "next/navigation";

import { CreatePostForm } from "@/components/create-post-form";
import { authenticateSessionUser } from "@/lib/api-auth";
import { getBoard } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SubmitPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const viewer = await authenticateSessionUser();

  if (!viewer) {
    redirect("/login");
  }

  const { slug } = await params;
  const board = await getBoard(slug, viewer.id);

  if (!board) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <CreatePostForm boardSlug={board.slug} />
    </div>
  );
}
