"use client";

/* Cold blue-gray / steel / plum / pale blue-gray only — no green */

const styles: Record<string, string> = {
  stable_day: "bg-accent-neutral-soft text-accent-neutral",
  drainage_day: "bg-accent-info-soft text-accent-info",
  caution_day: "bg-accent-danger-soft text-accent-danger",
  high_sensitivity_day: "bg-accent-danger-soft text-accent-danger",
  ekadashi_day: "bg-accent-secondary-soft text-accent-secondary",
  pradosh_day: "bg-accent-secondary-soft text-accent-secondary",
  recovery_day_after_reduction: "bg-accent-secondary-soft text-accent-secondary",
  pre_full_moon_retention_day: "bg-accent-danger-soft text-accent-danger",
  pre_new_moon_precision_day: "bg-accent-light text-accent-dark",
  walk_soft: "bg-accent-neutral-soft text-accent-neutral",
  moderate: "bg-accent-neutral-soft text-accent-neutral",
  lymph_stretch: "bg-accent-info-soft text-accent-info",
  no_overload: "bg-accent-danger-soft text-accent-danger",
};

const labels: Record<string, string> = {
  stable_day: "устойчивый день",
  drainage_day: "день дренажа",
  caution_day: "день осторожности",
  high_sensitivity_day: "чувствительный день",
  ekadashi_day: "экадаши",
  pradosh_day: "прадош",
  recovery_day_after_reduction: "день восстановления",
  pre_full_moon_retention_day: "канун полнолуния",
  pre_new_moon_precision_day: "канун новолуния",
  walk_soft: "мягкое движение",
  moderate: "умеренная нагрузка",
  lymph_stretch: "лимфодренаж + растяжка",
  no_overload: "без силовой нагрузки",
};

export function DayKindBadge({ kind }: { kind: string }) {
  return (
    <span className={`badge ${styles[kind] ?? "bg-accent-light text-accent-muted"}`}>
      {labels[kind] ?? kind}
    </span>
  );
}
