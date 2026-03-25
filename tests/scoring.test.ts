import { describe, expect, it } from "vitest";

import { hotScore, wilsonScore } from "@/lib/scoring";

describe("scoring", () => {
  it("rewards newer highly-voted posts in hot score", () => {
    const older = hotScore(100, 5, new Date("2024-01-01T00:00:00Z"));
    const newer = hotScore(25, 1, new Date());

    expect(newer).toBeGreaterThan(older - 1);
  });

  it("uses Wilson score to prefer consistent approval", () => {
    expect(wilsonScore(20, 2)).toBeGreaterThan(wilsonScore(5, 0));
  });
});
