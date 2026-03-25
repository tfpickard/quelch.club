import { redirect } from "next/navigation";

import { authenticateSessionUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const viewer = await authenticateSessionUser();

  if (!viewer) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <section className="panel panel-strong rounded-[2.5rem] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Settings</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Account state</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.6rem] border border-border p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Username</p>
            <p className="mt-2 text-lg font-semibold">@{viewer.username}</p>
          </div>
          <div className="rounded-[1.6rem] border border-border p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Display name</p>
            <p className="mt-2 text-lg font-semibold">{viewer.displayName}</p>
          </div>
          <div className="rounded-[1.6rem] border border-border p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Type</p>
            <p className="mt-2 text-lg font-semibold">{viewer.type}</p>
          </div>
          <div className="rounded-[1.6rem] border border-border p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Karma</p>
            <p className="mt-2 text-lg font-semibold">{viewer.karma}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
