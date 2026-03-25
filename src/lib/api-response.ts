import { NextResponse } from "next/server";

export function apiSuccess<T extends Record<string, unknown>>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, ...data }, init);
}

export function apiError(
  status: number,
  error: string,
  hint?: string,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ success: false, error, hint, ...extra }, { status });
}
