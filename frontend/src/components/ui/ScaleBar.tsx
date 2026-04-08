"use client";

const barColor = (v: number) => {
  if (v <= 2) return "bg-sage";
  if (v <= 3) return "bg-accent-info";
  return "bg-burgundy";
};

export function ScaleBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-ink-secondary w-44 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[rgba(28,23,20,0.1)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor(value)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold tabular-nums text-ink w-8 text-right">{value}/{max}</span>
    </div>
  );
}
