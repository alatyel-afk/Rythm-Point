/** Человекочитаемые названия вариантов обеда (внутренние ключи не показываем пользователю). */

export const MEAL_MATRIX_LABELS: Record<string, string> = {
  A_stable: "Полноценный обед — устойчивый день",
  B_nervous: "Упрощённый обед — нагрузка на нервную систему",
  C_retention: "Лёгкий обед — при отёках",
  D_ekadashi: "Овощи без мяса — экадаши",
  E_pradosh: "Ранний обед с мясом — прадош",
  F_grain: "Обед с гарниром — когда крупа разрешена по правилам дня",
  /** То же по смыслу, что F_grain; бэкенд использует другое имя ключа. */
  F_rice: "Обед с гарниром — когда крупа разрешена по правилам дня",
};

const FALLBACK_LABEL = "Обед подобран по правилам дня";

export function mealMatrixLabel(matrixKey: string): string {
  return MEAL_MATRIX_LABELS[matrixKey] ?? FALLBACK_LABEL;
}
