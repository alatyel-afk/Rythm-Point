import type { BodySignal } from "../../lib/api";
import type { SignalOverrides } from "./signals";

export function interpretSignals(sig: BodySignal): SignalOverrides {
  const trace: string[] = [];
  const ov: SignalOverrides = {
    forceRetentionMatrix: false, forceNoRice: false, forceCalmBreathing: false,
    reduceMealComplexity: false, noIntensifyExercise: false, riceConditionallyAllowed: false,
    scaleDeltas: { wr: 0, nrv: 0, rel: 0, rhy: 0 },
    trace,
  };

  const ankles = sig.ankles_evening ?? 0;
  const eyes = sig.eye_area_morning ?? 0;
  const mental = sig.head_overload ?? 0;
  const sleep = sig.sleep_quality ?? 5;
  const energy = sig.energy_level ?? 5;
  const tissue = sig.tissue_density ?? 0;
  const sweet = sig.sweet_craving ?? 0;
  const salty = sig.salty_craving ?? 0;

  if (ankles >= 3) {
    ov.forceRetentionMatrix = true;
    ov.scaleDeltas.wr += 12;
    ov.scaleDeltas.rel += 5;
    trace.push(`Лодыжки отекли (${ankles}/5) — обед лёгкий, без гарнира, задержка воды +12, выведение +5`);
  }
  if (ankles >= 4) {
    ov.scaleDeltas.wr += 6;
    trace.push(`Лодыжки отекли сильно (${ankles}/5) — дополнительно задержка +6`);
  }

  if (eyes >= 3) {
    ov.forceNoRice = true;
    ov.scaleDeltas.wr += 8;
    trace.push(`Отёк под глазами (${eyes}/5) — гарнир запрещён, тяжёлая еда исключена, задержка воды +8`);
  }

  if (mental >= 4) {
    ov.forceCalmBreathing = true;
    ov.reduceMealComplexity = true;
    ov.scaleDeltas.nrv += 10;
    trace.push(`Голова перегружена (${mental}/5) — дыхание на успокоение, обед упрощён, нервная нагрузка +10`);
  }
  if (mental >= 3) {
    ov.scaleDeltas.nrv += 6;
    if (mental < 4) trace.push(`Голова тяжёлая (${mental}/5) — нервная нагрузка +6`);
  }

  if (sleep <= 2) {
    ov.noIntensifyExercise = true;
    ov.scaleDeltas.nrv += 5;
    ov.scaleDeltas.rhy += 4;
    trace.push(`Плохой сон (${sleep}/5) — без силовых, нервная нагрузка +5, режим +4`);
  }

  if (energy <= 2 && ankles < 3 && eyes < 3) {
    ov.riceConditionallyAllowed = true;
    trace.push(`Мало сил (${energy}/5), отёков нет — гарнир допустим в ровный день`);
  }

  if (tissue >= 3) {
    ov.scaleDeltas.wr += 5;
    trace.push(`Тяжесть в теле (${tissue}/5) — задержка воды +5`);
  }

  if (salty >= 3) {
    ov.scaleDeltas.wr += 4;
    trace.push(`Тянет на солёное (${salty}/5) — признак задержки, задержка воды +4`);
  }

  if (sweet >= 3) {
    ov.scaleDeltas.nrv += 3;
    trace.push(`Тянет на сладкое (${sweet}/5) — стрессовая тяга, нервная нагрузка +3`);
  }

  if (trace.length === 0) {
    trace.push("Все показатели в норме, протокол без изменений");
  }

  return ov;
}
