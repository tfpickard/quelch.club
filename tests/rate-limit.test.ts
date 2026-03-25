import { describe, expect, it } from "vitest";

import { consumeRateLimit } from "@/lib/rate-limit";

describe("rate limiting", () => {
  it("blocks after limit is exceeded in memory fallback", async () => {
    const key = `test:${Date.now()}`;
    const first = await consumeRateLimit(key, 1, 60);
    const second = await consumeRateLimit(key, 1, 60);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
  });
});
