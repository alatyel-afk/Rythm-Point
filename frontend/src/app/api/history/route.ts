import { NextRequest, NextResponse } from "next/server";
import { listBodySignals, getNutritionLog } from "@/lib/store";
import { buildProtocol } from "@/lib/mock-engine";
import type { BodySignalWithContext } from "@/lib/api";

export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const from = p.get("from_date");
  const to = p.get("to_date");
  if (!from || !to) {
    return NextResponse.json({ error: "from_date and to_date required" }, { status: 400 });
  }

  const signals = listBodySignals(from, to);
  const result: BodySignalWithContext[] = signals.map((sig) => {
    const nutr = getNutritionLog(sig.day_date);
    try {
      const proto = buildProtocol(sig.day_date, sig);
      return {
        signal: sig,
        nutrition: nutr,
        tithi_number: proto.lunar_day_number,
        nakshatra_ru: proto.nakshatra,
        day_kind: proto.day_type,
        water_retention_risk: proto.scales.water_retention_risk,
        release_drainage_potential: proto.scales.release_drainage_potential,
        nervous_system_load: proto.scales.nervous_system_load,
      };
    } catch {
      return { signal: sig, nutrition: nutr };
    }
  });

  return NextResponse.json(result);
}
