"""Deterministic supplement schedule. No astro dependency."""

from datetime import date

from app.domain.models.protocol import SupplementSlot, SupplementsBlock

ENDOLUTEN_ANCHOR = date(2026, 4, 7)

WATER_ONLY_FAST_DAY_TEXT = (
    "Пищи нет. Только вода: тёплая по желанию, небольшими порциями в течение дня. "
    "Без соков, молока, чая с добавками, бульонов и всего с калориями."
)


def build_supplements(d: date) -> SupplementsBlock:
    delta = (d - ENDOLUTEN_ANCHOR).days
    endo_today = delta % 3 == 0
    return SupplementsBlock(
        slots=[
            SupplementSlot(
                time="Нутрицевтики: за 30 минут до завтрака (натощак)",
                items=(
                    "Альфа-липоевая кислота (ALA) — нутрицевтик. Строго за 30 минут до завтрака, натощак. "
                    "Не вместе с завтраком, не после завтрака и не в другие слоты."
                ),
            ),
            SupplementSlot(time="Нутрицевтики: после завтрака", items="L-теанин, женолутен"),
            SupplementSlot(
                time="Нутрицевтики: с обедом",
                items=(
                    "Омега-3, пиколинат хрома, берберин, витамин D + K2. "
                    "Цинк и селен — в одной капсуле одного комбинированного препарата; принимать только целиком с обедом. "
                    "Разделить цинк и селен по разному времени суток невозможно (одна капсула)."
                ),
            ),
            SupplementSlot(
                time="Специи и зелень к обедам",
                items=(
                    "К обеденным блюдам по смыслу тарелки: молотый чёрный перец, сушёная мята к варёному рису; соль умеренно; "
                    "лавровый лист к тушёным овощам при необходимости. Зелень — укроп, петрушка, зелёный лук, мята свежая (по сочетанию). "
                    "Не добавлять посторонние смеси и «от себя»."
                ),
            ),
            SupplementSlot(time="Нутрицевтики: вечером", items="Магний бисглицинат, ГАМК 500 мг, 5-HTP 120 мг"),
        ],
        endoluten_today=endo_today,
        endoluten_note=f"Эндолутен 1 раз в 3 дня. Сегодня: {'да, первая половина дня' if endo_today else 'нет'}.",
    )


def build_supplements_water_fast_day(d: date) -> SupplementsBlock:
    base = build_supplements(d)
    return SupplementsBlock(
        slots=[
            SupplementSlot(
                time="Нутрицевтики натощак (день только воды)",
                items=(
                    "Альфа-липоевая кислота (ALA) — только если по схеме допустима в пост с одной водой; "
                    "при сомнении пропустить или перенести по врачу."
                ),
            ),
            SupplementSlot(
                time="День без еды — только вода",
                items=(
                    "L-теанин, женолутен — без привязки к завтраку; только если по схеме допустимы без калорийной еды, "
                    "иначе перенос по врачу."
                ),
            ),
            SupplementSlot(
                time="Нет обеда — слот «с обедом» не действует",
                items=(
                    "Омега-3, хром, берберин, витамин D + K2, цинк/селен в одной капсуле — перенос на следующий день "
                    "или приём натощак только по решению врача."
                ),
            ),
            SupplementSlot(
                time="Специи и зелень к обедам",
                items="Сегодня не применяется — пищи по протоколу нет.",
            ),
            base.slots[4],
        ],
        endoluten_today=base.endoluten_today,
        endoluten_note=f"{base.endoluten_note} В день только воды эндолутен — по согласованию с врачом.",
    )
