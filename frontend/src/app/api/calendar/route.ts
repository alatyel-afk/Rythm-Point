import { NextRequest, NextResponse } from "next/server";
import { forwardToBackend } from "@/lib/backend-proxy";
import { buildCalendarMonth } from "@/lib/mock-engine";

export async function GET(req: NextRequest) {
  const proxied = await forwardToBackend(req);
  if (proxied) return proxied;

  const p = req.nextUrl.searchParams;
  const year = Number(p.get("year"));
  const month = Number(p.get("month"));
  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: "year and month required" }, { status: 400 });
  }
  try {
    const days = buildCalendarMonth(year, month);
    return NextResponse.json(days);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
