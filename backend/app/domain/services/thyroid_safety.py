"""Thyroid safety layer constants. No astro dependency."""

from app.domain.models.protocol import ThyroidSafetyNotes

THYROID_NOTES = [
    "Йодосодержащие добавки, водоросли и келп не рекомендуются автоматически.",
    "Селен остаётся только в рамках утверждённого стека (с обедом). Не является лечением.",
    "Дыхательные практики и мудры не являются терапией щитовидной железы.",
    "Режим: стабильное время еды, без эскалации стимуляторов, без экстремального голодания.",
]


def build_thyroid_safety() -> ThyroidSafetyNotes:
    return ThyroidSafetyNotes(notes=THYROID_NOTES)
