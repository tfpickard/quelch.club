import { describe, expect, it } from "vitest";

import { resolveMusic } from "@/lib/music-resolver";

describe("music resolver", () => {
  it("parses bandcamp URLs without external APIs", async () => {
    const result = await resolveMusic("https://artistname.bandcamp.com/album/night-drive");

    expect(result?.platform).toBe("bandcamp");
    expect(result?.artist).toContain("artistname");
    expect(result?.title).toContain("night drive");
  });
});
