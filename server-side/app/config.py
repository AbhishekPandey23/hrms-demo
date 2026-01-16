from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List

class Settings(BaseSettings):
    # Using defaults with validation_alias to prevent startup crashes.
    # Prisma will still need the actual DATABASE_URL environment variable to connect.
    database_url: str = Field(default="", validation_alias="DATABASE_URL")
    cors_origins: str = Field(default="*", validation_alias="CORS_ORIGINS")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        if self.cors_origins == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",")]

settings = Settings()
