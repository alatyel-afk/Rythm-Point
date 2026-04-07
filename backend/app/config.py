from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Jyotish Protocol Engine"
    database_url: str = "postgresql+asyncpg://jyotish:jyotish@localhost:5432/jyotish_protocol"
    # Swiss Ephemeris: пустая строка = встроенные данные / дефолтный поиск
    swe_ephe_path: str = ""

    # Репрезентативный момент суток для «дня» в календаре (локальное время пользователя)
    daily_snapshot_local_hour: int = 12
    daily_snapshot_local_minute: int = 0

    # Орбисы для транзит→натал (градусы)
    transit_orb_conjunction: float = 6.0
    transit_orb_major: float = 5.0


@lru_cache
def get_settings() -> Settings:
    return Settings()
