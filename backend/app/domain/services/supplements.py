"""Deterministic supplement schedule. No astro dependency."""

from datetime import date

from app.domain.models.protocol import SupplementSlot, SupplementsBlock

ENDOLUTEN_ANCHOR = date(2026, 4, 7)


def build_supplements(d: date) -> SupplementsBlock:
    delta = (d - ENDOLUTEN_ANCHOR).days
    endo_today = delta % 3 == 0
    return SupplementsBlock(
        slots=[
            SupplementSlot(time="После завтрака", items="L-теанин, женолутен"),
            SupplementSlot(time="С обедом", items="Омега-3, пиколинат хрома, берберин, витамин D + K2, селен"),
            SupplementSlot(time="Днём отдельно", items="Цинк, если переносится"),
            SupplementSlot(time="Вечером", items="Магний бисглицинат, ГАМК 500 мг, 5-HTP 120 мг"),
        ],
        endoluten_today=endo_today,
        endoluten_note=f"Эндолутен 1 раз в 3 дня. Сегодня: {'да, первая половина дня' if endo_today else 'нет'}.",
    )
