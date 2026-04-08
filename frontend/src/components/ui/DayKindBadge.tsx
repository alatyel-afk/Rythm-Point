"use client";

/* Спокойные чипы: белая плоскость + тонкий цветной акцент слева */

const styles: Record<string, string> = {
  stable_day: "border-l-sage",
  drainage_day: "border-l-accent-info",
  caution_day: "border-l-burgundy",
  high_sensitivity_day: "border-l-accent-danger",
  ekadashi_day: "border-l-gold",
  pradosh_day: "border-l-gold",
  recovery_day_after_reduction: "border-l-accent-secondary",
  pre_full_moon_retention_day: "border-l-burgundy",
  pre_new_moon_precision_day: "border-l-gold",
  walk_soft: "border-l-gold",
  moderate: "border-l-sage",
  lymph_stretch: "border-l-accent-info",
  no_overload: "border-l-accent-danger",
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
  const edge = styles[kind] ?? "border-l-stone-500";
  return (
    <span
      className={`badge border border-gold/25 bg-surface-card text-ink shadow-sm border-l-[3px] ${edge}`}
    >
      {labels[kind] ?? kind}
    </span>
  );
}
