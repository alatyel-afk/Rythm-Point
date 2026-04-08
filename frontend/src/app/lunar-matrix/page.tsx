"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { mealMatrixLabel } from "@/lib/meal-matrix-labels";

interface Meal {
  protein: string;
  vegetables: string;
  full_description: string;
}

export default function LunarMatrixPage() {
  const [data, setData] = useState<Record<string, Meal[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.getLunarMatrix().then(setData).catch((e) => setErr(e.message));
  }, []);

  if (err)
    return <p className="text-semantic-danger py-12 text-center text-sm">{err}</p>;

  if (!Object.keys(data).length)
    return <p className="py-12 text-center text-sm text-ink-tertiary">Загружаю варианты обедов…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight bg-gradient-to-r from-burgundy via-accent-dark to-sage bg-clip-text text-transparent">
          Наборы обедов
        </h1>
        <p className="text-sm text-sage mt-1.5 leading-relaxed font-medium">
          Шесть наборов обедов. Какой набор вы получите — зависит от типа дня, лунного дня и самочувствия.
        </p>
      </div>

      <div className="space-y-2">
        {Object.entries(data).map(([key, meals]) => {
          const isOpen = expanded === key;
          return (
            <div
              key={key}
              className="rounded-2xl border border-gold/30 bg-gradient-to-r from-surface-card via-gold-soft/90 to-sage-soft/45 shadow-card overflow-hidden ring-1 ring-sage/20"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : key)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gold/10 transition-colors"
              >
                <span className="text-sm font-semibold text-accent-dark">
                  {mealMatrixLabel(key)}
                </span>
                <span className="text-xs text-ink-tertiary tabular-nums">
                  {meals.length} вариантов
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-border-light divide-y divide-border-light">
                  {meals.map((m, i) => (
                    <div key={i} className="px-5 py-3">
                      <p className="text-sm text-ink font-medium">
                        {m.full_description}
                      </p>
                      <div className="flex gap-4 text-xs text-ink-tertiary mt-1">
                        <span>Белок: {m.protein}</span>
                        <span>Овощи: {m.vegetables}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
