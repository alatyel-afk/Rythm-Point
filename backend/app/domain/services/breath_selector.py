"""Deterministic breathing practice selection by day_type."""

from dataclasses import dataclass

from app.domain.models.enums import BreathingPractice, DayType
from app.domain.models.protocol import BreathBlock


@dataclass(frozen=True)
class _BreathEntry:
    title: str
    minutes: int
    best_time: str
    posture: str
    technique: str
    tongue: str
    contraindication: str


_CATALOG: dict[BreathingPractice, _BreathEntry] = {
    BreathingPractice.diaphragmatic: _BreathEntry(
        title="Диафрагмальное дыхание",
        minutes=8,
        best_time="Утро после горячей воды или вечер до 17:30.",
        posture=(
            "Сидя с ровной спиной, стопы на полу. Можно полулёжа с согнутыми коленями, "
            "если утром трудно сидеть. Плечи опущены, руки на нижних рёбрах или на животе."
        ),
        technique=(
            "Вдох через нос на 4 счёта — живот мягко расширяется вперёд и в стороны, "
            "грудная клетка почти не поднимается. Выдох через нос на 5–6 счётов — живот "
            "мягко возвращается к позвоночнику без напряжения. Между вдохом и выдохом нет паузы. "
            "Ритм ровный, без рывков. Первые 2 минуты — адаптация, затем углубить амплитуду."
        ),
        tongue="Язык свободно лежит за нижними зубами, не прижат к нёбу.",
        contraindication="Не увеличивать глубину после 18:00 — только спокойное носовое дыхание.",
    ),
    BreathingPractice.lengthened_exhale: _BreathEntry(
        title="Удлинённый выдох 1:2",
        minutes=8,
        best_time="Утро после горячей воды или за 20 минут до обеда.",
        posture=(
            "Сидя с прямой спиной, ноги на полу или скрестив. Руки на коленях ладонями вниз. "
            "Плечи расслаблены, грудная клетка открыта."
        ),
        technique=(
            "Вдох через нос на 4 счёта. Выдох через нос на 8 счётов — плавно, без усилия "
            "в конце. Если 1:2 трудно, начать с 4:6, через 3 минуты перейти к 4:8. "
            "Ритм монотонный, без задержек между фазами. Выдох должен заканчиваться "
            "естественно, без выжимания воздуха."
        ),
        tongue="Кончик языка мягко касается верхнего нёба за передними зубами (набхи-мудра).",
        contraindication="Не на полный желудок. Прекратить при головокружении, вернуться к обычному носовому.",
    ),
    BreathingPractice.sama_vritti: _BreathEntry(
        title="Самавритти (равные фазы)",
        minutes=6,
        best_time="Середина дня при ментальной нагрузке или за 15 минут до обеда.",
        posture=(
            "Сидя с ровной спиной, можно на стуле. Руки на коленях ладонями вверх "
            "(джняна-мудра — большой и указательный палец соединены, если удобно). "
            "Глаза закрыты или полуприкрыты."
        ),
        technique=(
            "Вдох через нос на 4 счёта. Задержка на 4 счёта (не форсировать — воздух "
            "просто остаётся). Выдох через нос на 4 счёта. Задержка на пустых лёгких на 4 счёта "
            "(только если нет тревоги — иначе пропустить). Все фазы равные. Если 4 тяжело — "
            "начать с 3. Через 3 минуты оценить: если спокойно, продолжить; если сжимает — "
            "убрать задержки и дышать 4:4 без пауз."
        ),
        tongue="Язык прижат к верхнему нёбу мягко (набхи-мудра).",
        contraindication="Прекратить при спазме в груди или тревоге. Убрать задержки и вернуться к носовому.",
    ),
    BreathingPractice.nadi_shodhana_gentle: _BreathEntry(
        title="Нади-шодхана мягкая (попеременное дыхание)",
        minutes=7,
        best_time="До обеда, 10:00–12:00, для ясности без стимуляции.",
        posture=(
            "Сидя с прямой спиной. Левая рука на колене. Правая рука в вишну-мудре: "
            "указательный и средний пальцы согнуты к ладони, большой палец — "
            "для правой ноздри, безымянный — для левой."
        ),
        technique=(
            "Закрыть правую ноздрю большим пальцем правой руки. Вдох через левую на 4 счёта. "
            "Закрыть левую ноздрю безымянным пальцем, отпустить правую. Выдох через правую на 4 счёта. "
            "Вдох через правую на 4 счёта. Закрыть правую, отпустить левую. Выдох через левую на 4 счёта. "
            "Это 1 цикл. Повторить 8–12 циклов. Давление пальцев минимальное — только прикрыть, "
            "не зажимать. Если нос заложен с одной стороны, дышать через открытую и пропустить "
            "закрытую фазу."
        ),
        tongue="Язык прижат к верхнему нёбу (набхи-мудра) на протяжении всей практики.",
        contraindication="Короткие циклы, без гипервентиляции. При головокружении остановиться.",
    ),
    BreathingPractice.bhramari: _BreathEntry(
        title="Бхрамари (жужжание пчелы)",
        minutes=4,
        best_time="Вечер 16:00–17:30 или при перегрузе головы в любое время.",
        posture=(
            "Сидя с прямой спиной. Указательные пальцы мягко закрывают ушные раковины "
            "(шанмукхи-мудра): большие пальцы — на козелках ушей, указательные — на закрытых "
            "веках (без давления на глаза), средние — по бокам носа, безымянные — над верхней губой, "
            "мизинцы — под нижней губой. Если полная шанмукхи сложна, достаточно закрыть "
            "уши указательными пальцами."
        ),
        technique=(
            "Вдох через нос на 4 счёта. На выдохе — мягкое непрерывное гудение «мммм» через "
            "закрытые губы. Звук низкий, вибрация ощущается в переносице и макушке. "
            "Выдох длится 6–8 счётов. Между циклами — 1 обычный вдох-выдох. "
            "Повторить 6–8 циклов. Громкость минимальная — комфортная вибрация, не напряжение."
        ),
        tongue="Язык свободно лежит в полости рта, не прижат, губы мягко сомкнуты.",
        contraindication="Не повышать громкость. Прекратить при дискомфорте в ушах или давлении в голове.",
    ),
    BreathingPractice.chandra_bhedana: _BreathEntry(
        title="Чандра-бхедана (лунное дыхание)",
        minutes=5,
        best_time="Вторая половина дня, 14:00–17:00, при ощущении перегрева или жара в голове.",
        posture=(
            "Сидя с прямой спиной. Правая рука в вишну-мудре (как в нади-шодхане): "
            "указательный и средний пальцы согнуты, большой палец — правая ноздря, "
            "безымянный — левая. Левая рука на колене."
        ),
        technique=(
            "Закрыть правую ноздрю большим пальцем. Вдох через левую ноздрю на 4 счёта. "
            "Закрыть обе ноздри, задержка 2 счёта (если комфортно). "
            "Открыть правую, выдох через правую на 6 счётов. "
            "Снова закрыть правую, вдох через левую. Повторить 6–8 циклов. "
            "Всегда вдох только через левую (лунную). Если задержка вызывает тревогу — пропустить."
        ),
        tongue="Кончик языка мягко прижат к верхнему нёбу за передними зубами.",
        contraindication="При заложенности левой ноздри заменить на удлинённый выдох. Не при пониженном давлении.",
    ),
}

_RULES: dict[DayType, BreathingPractice] = {
    DayType.stable_day: BreathingPractice.lengthened_exhale,
    DayType.drainage_day: BreathingPractice.nadi_shodhana_gentle,
    DayType.caution_day: BreathingPractice.diaphragmatic,
    DayType.high_sensitivity_day: BreathingPractice.bhramari,
    DayType.ekadashi_day: BreathingPractice.sama_vritti,
    DayType.pradosh_day: BreathingPractice.lengthened_exhale,
    DayType.recovery_day_after_reduction: BreathingPractice.diaphragmatic,
    DayType.pre_full_moon_retention_day: BreathingPractice.bhramari,
    DayType.pre_new_moon_precision_day: BreathingPractice.diaphragmatic,
}


def select_breathing(day_type: DayType, mental_overload: bool = False) -> tuple[BreathBlock, list[str]]:
    trace: list[str] = []
    bp = _RULES[day_type]
    trace.append(f"BREATH: day_type={day_type.value} → default practice={bp.value}")
    if mental_overload and bp != BreathingPractice.bhramari:
        trace.append(f"BREATH: mental_overload=True, overriding {bp.value} → bhramari")
        bp = BreathingPractice.bhramari
    elif mental_overload:
        trace.append("BREATH: mental_overload=True but already bhramari, no override needed")
    else:
        trace.append("BREATH: mental_overload=False, no override")
    e = _CATALOG[bp]
    trace.append(f"BREATH: selected={bp.value}, minutes={e.minutes}")
    return BreathBlock(
        practice=bp,
        title_ru=e.title,
        minutes=e.minutes,
        best_time=e.best_time,
        posture=e.posture,
        technique=e.technique,
        tongue_position=e.tongue,
        contraindication=e.contraindication,
    ), trace
