/**
 * In-memory store for body signals and nutrition logs.
 * Uses globalThis to survive Next.js dev-mode hot reloads.
 */

import type { BodySignal, NutritionLog } from "./api";

interface StoreState {
  bodySignals: Map<string, BodySignal>;
  nutritionLogs: Map<string, NutritionLog>;
}

const g = globalThis as unknown as { __jyotishStore?: StoreState };

if (!g.__jyotishStore) {
  g.__jyotishStore = {
    bodySignals: new Map(),
    nutritionLogs: new Map(),
  };
}

const store = g.__jyotishStore;

export function upsertBodySignal(entry: BodySignal): BodySignal {
  store.bodySignals.set(entry.day_date, entry);
  return entry;
}

export function getBodySignal(date: string): BodySignal | null {
  return store.bodySignals.get(date) ?? null;
}

export function listBodySignals(from: string, to: string): BodySignal[] {
  const result: BodySignal[] = [];
  for (const [d, sig] of store.bodySignals) {
    if (d >= from && d <= to) result.push(sig);
  }
  return result.sort((a, b) => a.day_date.localeCompare(b.day_date));
}

export function upsertNutritionLog(entry: NutritionLog): NutritionLog {
  store.nutritionLogs.set(entry.day_date, entry);
  return entry;
}

export function getNutritionLog(date: string): NutritionLog | null {
  return store.nutritionLogs.get(date) ?? null;
}

export function listNutritionLogs(from: string, to: string): NutritionLog[] {
  const result: NutritionLog[] = [];
  for (const [d, log] of store.nutritionLogs) {
    if (d >= from && d <= to) result.push(log);
  }
  return result.sort((a, b) => a.day_date.localeCompare(b.day_date));
}
