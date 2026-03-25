import Image from "next/image";
import Link from "next/link";

import { brand } from "@/lib/brand";

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
  const content = (
    <span className="flex items-center gap-3">
      <span className="relative overflow-hidden rounded-[1.2rem] border border-accent/30 bg-accent-soft p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
        <Image
          src="/branding/quelch-mark.svg"
          alt={`${brand.name} mark`}
          width={compact ? 36 : 44}
          height={compact ? 36 : 44}
          className="h-9 w-9 rounded-[0.9rem] sm:h-11 sm:w-11"
          priority
        />
      </span>
      <span className="flex flex-col">
        <span className="text-lg font-semibold tracking-[-0.04em] sm:text-xl">{brand.name}</span>
        {showTagline ? <span className="text-sm text-muted">{brand.strapline}</span> : null}
      </span>
    </span>
  );

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
