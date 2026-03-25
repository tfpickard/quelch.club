import { NextResponse } from "next/server";

function withApiHeaders(init?: ResponseInit): ResponseInit {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("Vary", "Authorization, Cookie");

  return {
    ...init,
    headers,
  };
}

export function apiSuccess<T extends Record<string, unknown>>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, ...data }, withApiHeaders(init));
}

export function apiError(
  status: number,
  error: string,
  hint?: string,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ success: false, error, hint, ...extra }, withApiHeaders({ status }));
}
