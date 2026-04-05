from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://municipio:municipio123@localhost:5432/municipio_db"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    model_config = {"env_file": ".env"}


settings = Settings()
