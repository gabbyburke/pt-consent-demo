"""
Configuration settings for the consent management backend.
Manages environment variables and application configuration.
"""
import os
from typing import Optional


class Config:
    """
    Application configuration class.
    Loads settings from environment variables with sensible defaults.
    """
    
    # GCP Project Configuration
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "gb-demos")
    
    # Google Cloud Identity Platform
    GCIP_API_KEY: Optional[str] = os.getenv("GCIP_API_KEY")
    
    # Firestore Configuration
    FIRESTORE_DATABASE: str = os.getenv("FIRESTORE_DATABASE", "(default)")
    
    # Service Account (for local development)
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = os.getenv(
        "GOOGLE_APPLICATION_CREDENTIALS"
    )
    
    # Mock Services (for prototype)
    USE_MOCK_EMAIL: bool = os.getenv("USE_MOCK_EMAIL", "true").lower() == "true"
    USE_MOCK_SMS: bool = os.getenv("USE_MOCK_SMS", "true").lower() == "true"
    
    # Security Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    TOKEN_EXPIRATION_MINUTES: int = int(os.getenv("TOKEN_EXPIRATION_MINUTES", "15"))
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    MAX_KBA_ATTEMPTS: int = int(os.getenv("MAX_KBA_ATTEMPTS", "3"))
    KBA_LOCKOUT_MINUTES: int = int(os.getenv("KBA_LOCKOUT_MINUTES", "30"))
    
    # Flask Configuration
    FLASK_ENV: str = os.getenv("FLASK_ENV", "development")
    DEBUG: bool = FLASK_ENV == "development"
    
    # CORS Configuration
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:5173,http://localhost:3000"
    ).split(",")
    
    # API Configuration
    API_PREFIX: str = "/api"
    
    @classmethod
    def validate(cls) -> None:
        """
        Validates that required configuration is present.
        Raises ValueError if critical configuration is missing.
        """
        if not cls.GCP_PROJECT_ID:
            raise ValueError("GCP_PROJECT_ID must be set")
        
        # In production, SECRET_KEY must be set via Secret Manager
        if cls.FLASK_ENV == "production":
            if not cls.SECRET_KEY or cls.SECRET_KEY == "dev-secret-key-change-in-production":
                raise ValueError("SECRET_KEY must be set via Secret Manager in production")
    
    @classmethod
    def get_config_summary(cls) -> dict:
        """
        Returns a summary of current configuration (safe for logging).
        Excludes sensitive values.
        """
        return {
            "gcp_project": cls.GCP_PROJECT_ID,
            "environment": cls.FLASK_ENV,
            "debug": cls.DEBUG,
            "mock_email": cls.USE_MOCK_EMAIL,
            "mock_sms": cls.USE_MOCK_SMS,
            "rate_limiting": cls.RATE_LIMIT_ENABLED,
            "gcip_configured": bool(cls.GCIP_API_KEY),
        }
