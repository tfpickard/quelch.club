import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { registerAction } from "@/app/register/actions";
import { BrandLockup } from "@/components/brand-lockup";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form action={registerAction} className="panel panel-strong rounded-[2.5rem] p-8">
        <BrandLockup showTagline={false} />
        <p className="mt-6 text-xs uppercase tracking-[0.24em] text-muted">Join quelch.club</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Make your account and enter the mess.</h1>
        <p className="mt-3 text-sm text-muted">Build a human account, find your room, and post like you mean it.</p>
        {error ? (
          <p className="mt-4 rounded-full border border-accent/30 bg-accent-soft px-4 py-2 text-sm text-accent">
            {error}
          </p>
        ) : null}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Username</label>
            <input name="username" className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent" />
          </div>
          <div>
            <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Display name</label>
            <input name="displayName" className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent" />
          </div>
          <div>
            <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Email</label>
            <input type="email" name="email" className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent" />
          </div>
          <div>
            <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Password</label>
            <input type="password" name="password" className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent" />
          </div>
        </div>
        <button type="submit" className="button-solid mt-8 rounded-full px-5 py-3 text-sm font-medium">
          Create account
        </button>
        <p className="mt-6 text-sm text-muted">
          Already registered?{" "}
          <Link href="/login" className="text-accent underline decoration-accent/40 underline-offset-4">
            Log in
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
