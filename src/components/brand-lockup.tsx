import Image from "next/image";
import Link from "next/link";

import { brand, getRandomBrandTagline } from "@/lib/brand";

type BrandLockupProps = {
  href?: string;
  compact?: boolean;
  showTagline?: boolean;
};

export function BrandLockup({
  href = "/",
  compact = false,
  showTagline = true,
}: BrandLockupProps) {
  const tagline = getRandomBrandTagline();

  const content = (
    <span className="flex min-w-0 items-center gap-3">
      <span className="relative shrink-0 overflow-hidden rounded-[1.2rem] border border-accent/30 bg-accent-soft p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
        <Image
          src="/branding/quelch-head-mark.png"
          alt={`${brand.name} mascot`}
          width={compact ? 40 : 52}
          height={compact ? 40 : 52}
          className="h-10 w-10 rounded-[0.9rem] sm:h-12 sm:w-12"
          priority
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-lg font-semibold tracking-[-0.04em] sm:text-xl">{brand.name}</span>
        {showTagline ? <span className="max-w-[20rem] truncate text-sm text-muted">{tagline}</span> : null}
      </span>
    </span>
  );

  return (
    <Link href={href} className="inline-flex min-w-0 items-center">
      {content}
    </Link>
  );
}
