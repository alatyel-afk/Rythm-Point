from enum import Enum


class AyanamshaMode(str, Enum):
    LAHIRI = "lahiri"
    RAMAN = "raman"
    KRISHNAMURTI = "krishnamurti"


class DayType(str, Enum):
    stable_day = "stable_day"
    drainage_day = "drainage_day"
    caution_day = "caution_day"
    high_sensitivity_day = "high_sensitivity_day"
    ekadashi_day = "ekadashi_day"
    pradosh_day = "pradosh_day"
    recovery_day_after_reduction = "recovery_day_after_reduction"
    pre_full_moon_retention_day = "pre_full_moon_retention_day"
    pre_new_moon_precision_day = "pre_new_moon_precision_day"


class MealMatrix(str, Enum):
    A_STABLE = "A_stable"
    B_NERVOUS = "B_nervous"
    C_RETENTION = "C_retention"
    D_EKADASHI = "D_ekadashi"
    E_PRADOSH = "E_pradosh"
    F_RICE = "F_rice"


class BreathingPractice(str, Enum):
    diaphragmatic = "diaphragmatic"
    lengthened_exhale = "lengthened_exhale"
    sama_vritti = "sama_vritti"
    nadi_shodhana_gentle = "nadi_shodhana_gentle"
    bhramari = "bhramari"
    chandra_bhedana = "chandra_bhedana"


class MudraType(str, Enum):
    prana = "prana"
    apana = "apana"
    vayu = "vayu"
    hakini = "hakini"
    varuna = "varuna"
    none = "none"


class AromaSlot(str, Enum):
    frankincense = "frankincense"
    rose = "rose"
    geranium = "geranium"
    rosemary = "rosemary"
    leuzea = "leuzea"
    anti_stress_blend = "anti_stress_blend"
    none = "none"


class LoadProfile(str, Enum):
    walk_soft = "walk_soft"
    moderate = "moderate"
    lymph_stretch = "lymph_stretch"
    no_overload = "no_overload"


class RiskLevel(str, Enum):
    low = "low"
    moderate = "moderate"
    high = "high"
    critical = "critical"
