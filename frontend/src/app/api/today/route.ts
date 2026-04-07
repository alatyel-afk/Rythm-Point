import { NextRequest, NextResponse } from "next/server";
import { buildProtocol } from "@/lib/mock-engine";
import { getBodySignal } from "@/lib/store";

export function GET(req: NextRequest) {
  const on = req.nextUrl.searchParams.get("on");
  const dateStr = on ?? new Date().toISOString().slice(0, 10);
  try {
    const signals = getBodySignal(dateStr);
    const proto = buildProtocol(dateStr, signals);
    return NextResponse.json(proto);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
