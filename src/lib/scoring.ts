const EPOCH_SECONDS = 1_134_028_003;

export function hotScore(upvotes: number, downvotes: number, createdAt: Date) {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = createdAt.getTime() / 1000 - EPOCH_SECONDS;

  return Number((order + (sign * seconds) / 45_000).toFixed(7));
}

export function wilsonScore(upvotes: number, downvotes: number) {
  const n = upvotes + downvotes;

  if (n === 0) {
    return 0;
  }

  const z = 1.96;
  const phat = upvotes / n;

  return (
    (phat + (z * z) / (2 * n) - z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n)) /
    (1 + (z * z) / n)
  );
}

export function withinTopWindow(createdAt: Date, window: "day" | "week" | "month" | "year" | "all") {
  if (window === "all") {
    return true;
  }

  const now = Date.now();
  const age = now - createdAt.getTime();
  const limits = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
    all: Number.POSITIVE_INFINITY,
  };

  return age <= limits[window];
}
