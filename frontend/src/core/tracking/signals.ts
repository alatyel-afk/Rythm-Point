export type { BodySignal } from "../../lib/api";

export interface SignalOverrides {
  forceRetentionMatrix: boolean;
  forceNoRice: boolean;
  forceCalmBreathing: boolean;
  reduceMealComplexity: boolean;
  noIntensifyExercise: boolean;
  riceConditionallyAllowed: boolean;
  scaleDeltas: { wr: number; nrv: number; rel: number; rhy: number };
  trace: string[];
}
