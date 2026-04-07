"""Deterministic mudra selection by day_type + risk signals."""

from dataclasses import dataclass

from app.domain.models.enums import DayType, MudraType
from app.domain.models.protocol import MudraBlock


@dataclass(frozen=True)
class _MudraEntry:
    name: str
    duration: int
    reason: str
    fingers: str
    posture: str
    breathing: str
    tongue: str
    when_to_do: str
    caution: str


_CATALOG: dict[MudraType, _MudraEntry] = {
    MudraType.prana: _MudraEntry(
        name="Прана-мудра",
        duration=3,
        reason="Ресурс при утомлении без отёка.",
        fingers=(
            "На обеих руках одновременно: соединить кончики мизинца и безымянного пальца "
            "с кончиком большого пальца. Давление мягкое — подушечки касаются, не сжимают. "
            "Указательный и средний пальцы выпрямлены, расслаблены, не напряжены."
        ),
        posture=(
            "Сидя с ровной спиной, стопы на полу. Руки на коленях ладонями вверх. "
            "Плечи опущены, локти свободны."
        ),
        breathing=(
            "Дыхание носовое, спокойное. Вдох и выдох равные, примерно 4:4. "
            "Без задержек. Не форсировать глубину."
        ),
        tongue="Язык свободно лежит в полости рта, не прижат к нёбу.",
        when_to_do=(
            "Утро после горячей воды (до завтрака) или дневной перерыв при усталости. "
            "Не делать вечером после 17:00 — может мешать засыпанию."
        ),
        caution="Прекратить, если холодеют пальцы. Не использовать при выраженном отёке лодыжек.",
    ),
    MudraType.apana: _MudraEntry(
        name="Апана-мудра",
        duration=4,
        reason="Мягкий дренаж, поддержка выведения.",
        fingers=(
            "На обеих руках: соединить кончики среднего и безымянного пальцев "
            "с кончиком большого пальца. Давление лёгкое, подушечки касаются. "
            "Указательный палец и мизинец выпрямлены, расслаблены."
        ),
        posture=(
            "Сидя с прямой спиной. Руки на коленях ладонями вверх. "
            "Плечи расслаблены. Можно прикрыть глаза."
        ),
        breathing=(
            "Дыхание носовое, с мягким удлинением выдоха. Вдох на 4 счёта, "
            "выдох на 5–6 счётов. Без задержек."
        ),
        tongue="Кончик языка мягко касается верхнего нёба за передними зубами (набхи-мудра).",
        when_to_do=(
            "Через 30–40 минут после обеда или в первой половине дня. "
            "Хорошо работает в экадаши и прадошу. Не на голодный желудок с утра."
        ),
        caution="Не на полный желудок с ощущением тяжести. Не при диарее.",
    ),
    MudraType.vayu: _MudraEntry(
        name="Ваю-мудра",
        duration=3,
        reason="Снижение нервного перегруза.",
        fingers=(
            "На обеих руках: согнуть указательный палец так, чтобы его подушечка "
            "касалась основания большого пальца (не кончика). Большой палец мягко "
            "прижимает сверху первую фалангу указательного. "
            "Средний, безымянный и мизинец — выпрямлены, расслаблены."
        ),
        posture=(
            "Сидя с ровной спиной, можно на стуле. Руки на коленях ладонями вверх. "
            "Плечи вниз, локти свободны. Глаза можно закрыть."
        ),
        breathing=(
            "Дыхание носовое, ровное. Вдох 4 счёта, выдох 4 счёта. "
            "Без задержек, без усилия. Если тревога — удлинить выдох до 6."
        ),
        tongue="Язык свободно лежит в полости рта, расслаблен. Не прижат к нёбу.",
        when_to_do=(
            "При нервном напряжении, тревоге, внутреннем беспокойстве — в любое время дня. "
            "Максимум 3 минуты за один подход. Не держать дольше 5 минут подряд."
        ),
        caution="При тревоге сократить до 2 минут. Не использовать непрерывно весь день.",
    ),
    MudraType.hakini: _MudraEntry(
        name="Хакини-мудра",
        duration=1,
        reason="Фокусировка при рассеянности.",
        fingers=(
            "Соединить кончики всех пяти пальцев левой руки с соответствующими пальцами "
            "правой руки: большой с большим, указательный с указательным, средний со средним, "
            "безымянный с безымянным, мизинец с мизинцем. Пальцы слегка разведены, "
            "между ладонями — пустое пространство (как «шатёр»). Давление минимальное."
        ),
        posture=(
            "Сидя или стоя. Руки перед собой на уровне солнечного сплетения. "
            "Локти слегка разведены. Плечи расслаблены."
        ),
        breathing=(
            "Вдох через нос — взгляд вверх (глаза закрыты, зрачки к точке межбровья). "
            "Выдох через нос — язык к нёбу. Дышать спокойно, без усилия. "
            "Один вдох-выдох = 6–8 секунд."
        ),
        tongue="На выдохе кончик языка прижимается к верхнему нёбу. На вдохе — свободно.",
        when_to_do=(
            "При необходимости сфокусироваться: перед важным решением, при рассеянности. "
            "Только 1 минута. Можно повторить 1 раз через 2 часа."
        ),
        caution=(
            "Не при высоком давлении в голове, мигрени, пульсации в висках. "
            "Максимум 1 минута за подход, не более 2 раз в день."
        ),
    ),
    MudraType.varuna: _MudraEntry(
        name="Варуна-мудра",
        duration=2,
        reason="Поддержка водного баланса.",
        fingers=(
            "На обеих руках: соединить кончик мизинца с кончиком большого пальца. "
            "Давление мягкое. Указательный, средний и безымянный — выпрямлены, расслаблены."
        ),
        posture=(
            "Сидя с ровной спиной. Руки на коленях ладонями вверх. "
            "Плечи расслаблены."
        ),
        breathing=(
            "Дыхание носовое, спокойное. Вдох и выдох равные, 4:4. Без задержек."
        ),
        tongue="Язык свободно лежит в полости рта.",
        when_to_do=(
            "В первой половине дня при сухости слизистых и отсутствии отёков. "
            "Только если день НЕ отмечен высоким риском задержки воды."
        ),
        caution="Запрещена при высоком риске задержки воды и отёках. Не при насморке.",
    ),
}


def select_mudra(
    day_type: DayType,
    high_retention_risk: bool,
    high_head_pressure: bool,
    low_energy_no_swelling: bool,
) -> tuple[MudraBlock, list[str]]:
    trace: list[str] = []

    if day_type == DayType.drainage_day:
        mt = MudraType.apana
        trace.append(f"MUDRA: day_type=drainage_day → apana (drainage support)")
    elif day_type == DayType.high_sensitivity_day:
        mt = MudraType.vayu
        trace.append(f"MUDRA: day_type=high_sensitivity_day → vayu (nerve calming)")
    elif day_type in (DayType.ekadashi_day, DayType.pradosh_day):
        mt = MudraType.apana
        trace.append(f"MUDRA: day_type={day_type.value} → apana (elimination support)")
    elif day_type == DayType.pre_full_moon_retention_day:
        mt = MudraType.none
        trace.append("MUDRA: day_type=pre_full_moon_retention_day → none (retention risk)")
    elif low_energy_no_swelling:
        mt = MudraType.prana
        trace.append("MUDRA: low_energy_no_swelling=True → prana (energy without retention)")
    elif day_type in (DayType.stable_day, DayType.recovery_day_after_reduction):
        mt = MudraType.none
        trace.append(f"MUDRA: day_type={day_type.value} → none (not needed on stable/recovery)")
    else:
        mt = MudraType.none
        trace.append(f"MUDRA: day_type={day_type.value} → none (no rule matched)")

    if mt == MudraType.varuna and high_retention_risk:
        trace.append("MUDRA: varuna BLOCKED by high_retention_risk=True → none")
        mt = MudraType.none
    if mt == MudraType.hakini and high_head_pressure:
        trace.append("MUDRA: hakini BLOCKED by high_head_pressure=True → none")
        mt = MudraType.none

    if mt == MudraType.none:
        trace.append("MUDRA: final=none, suggested=False")
        return MudraBlock(
            mudra=MudraType.none,
            suggested=False,
            name_ru="нет",
            duration_minutes=0,
            reason="Сегодня мудра не рекомендуется по типу дня.",
            finger_technique="—",
            posture="—",
            breathing_during="—",
            tongue_position="—",
            when_to_do="—",
            caution="—",
        ), trace

    e = _CATALOG[mt]
    trace.append(f"MUDRA: final={mt.value}, suggested=True, duration={e.duration}min")
    return MudraBlock(
        mudra=mt,
        suggested=True,
        name_ru=e.name,
        duration_minutes=e.duration,
        reason=e.reason,
        finger_technique=e.fingers,
        posture=e.posture,
        breathing_during=e.breathing,
        tongue_position=e.tongue,
        when_to_do=e.when_to_do,
        caution=e.caution,
    ), trace
