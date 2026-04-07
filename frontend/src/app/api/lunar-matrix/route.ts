import { NextResponse } from "next/server";
import { getMealMatrices } from "@/lib/mock-engine";

export function GET() {
  return NextResponse.json(getMealMatrices());
}
