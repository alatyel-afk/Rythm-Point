import { NextRequest, NextResponse } from "next/server";
import { upsertBodySignal, listBodySignals } from "@/lib/store";
import type { BodySignal } from "@/lib/api";

export function POST(req: NextRequest) {
  return req.json().then((body: BodySignal) => {
    const saved = upsertBodySignal(body);
    return NextResponse.json(saved);
  });
}

export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const from = p.get("from_date");
  const to = p.get("to_date");
  if (!from || !to) {
    return NextResponse.json({ error: "from_date and to_date required" }, { status: 400 });
  }
  return NextResponse.json(listBodySignals(from, to));
}
