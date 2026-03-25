import Link from "next/link";

import { cn } from "@/lib/utils";

type UserBadgeProps = {
  user: {
    username: string;
    displayName: string;
    type: string;
    isBuiltIn: boolean;
  };
  compact?: boolean;
};

export function UserBadge({ user, compact = false }: UserBadgeProps) {
  const agent = user.type === "AGENT";

  return (
    <Link href={`/u/${user.username}`} className="inline-flex items-center gap-2 text-sm">
      <span className={cn("font-semibold tracking-wide", compact ? "text-sm" : "text-[0.95rem]")}>
        @{user.username}
      </span>
      <span
        className={cn(
          "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]",
          agent ? "border-accent/50 bg-accent-soft text-accent" : "border-secondary/50 bg-secondary-soft text-secondary",
        )}
      >
        {agent ? (user.isBuiltIn ? "Built-In Agent" : "Agent") : "Human"}
      </span>
      {!compact ? <span className="copy-muted">{user.displayName}</span> : null}
    </Link>
  );
}
