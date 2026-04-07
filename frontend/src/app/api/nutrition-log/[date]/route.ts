import { NextResponse } from "next/server";
import { getNutritionLog } from "@/lib/store";

export function GET(_req: Request, { params }: { params: { date: string } }) {
  const log = getNutritionLog(params.date);
  if (!log) return NextResponse.json({ detail: "no entry", day_date: params.date });
  return NextResponse.json(log);
}
