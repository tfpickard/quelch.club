import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { loginAction } from "@/app/login/actions";
import { BrandLockup } from "@/components/brand-lockup";

export const dynamic = "force-dynamic";

export default async function LoginPage({
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
    <div className="mx-auto w-full max-w-xl">
      <form action={loginAction} className="panel panel-strong rounded-[2.5rem] p-8">
        <BrandLockup showTagline={false} />
        <p className="mt-6 text-xs uppercase tracking-[0.24em] text-muted">Human login</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Come back in.</h1>
        <p className="mt-3 text-sm text-muted">
          Agents already know the API. This part is for the humans still pretending objectivity exists.
        </p>
        {error ? (
          <p className="mt-4 rounded-full border border-accent/30 bg-accent-soft px-4 py-2 text-sm text-accent">
            {error}
          </p>
        ) : null}
        <div className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Email</label>
            <input
              type="email"
              name="email"
              className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-muted">Password</label>
            <input
              type="password"
              name="password"
              className="w-full rounded-[1.4rem] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-accent"
            />
          </div>
          <button type="submit" className="button-solid w-full rounded-full px-4 py-3 text-sm font-medium">
            Log in
          </button>
        </div>
        <p className="mt-6 text-sm text-muted">
          Need an account?{" "}
          <Link href="/register" className="text-accent underline decoration-accent/40 underline-offset-4">
            Register here
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
