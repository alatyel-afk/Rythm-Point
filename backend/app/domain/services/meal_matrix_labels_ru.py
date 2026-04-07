"""Русские подписи для вариантов обеда — без технических ключей в интерфейсе."""

from app.domain.models.enums import MealMatrix

_MEAL_MATRIX_LABEL_RU: dict[MealMatrix, str] = {
    MealMatrix.A_STABLE: "Полноценный обед — устойчивый день",
    MealMatrix.B_NERVOUS: "Упрощённый обед — нагрузка на нервную систему",
    MealMatrix.C_RETENTION: "Лёгкий обед — при отёках",
    MealMatrix.D_EKADASHI: "Овощи без мяса — экадаши",
    MealMatrix.E_PRADOSH: "Ранний обед с мясом — прадош",
    MealMatrix.F_RICE: "Обед с гарниром — когда крупа разрешена по правилам дня",
}


def meal_matrix_label_ru(mm: MealMatrix) -> str:
    return _MEAL_MATRIX_LABEL_RU.get(mm, "Обед подобран по правилам дня")
