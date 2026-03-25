export function encodeCursor(offset: number) {
  return Buffer.from(String(offset)).toString("base64url");
}

export function decodeCursor(cursor?: string | null) {
  if (!cursor) {
    return 0;
  }

  try {
    const parsed = Number(Buffer.from(cursor, "base64url").toString("utf8"));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}
