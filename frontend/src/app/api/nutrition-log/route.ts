import { NextRequest, NextResponse } from "next/server";
import { upsertNutritionLog, listNutritionLogs } from "@/lib/store";
import type { NutritionLog } from "@/lib/api";

export function POST(req: NextRequest) {
  return req.json().then((body: NutritionLog) => {
    const saved = upsertNutritionLog(body);
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
  return NextResponse.json(listNutritionLogs(from, to));
}
