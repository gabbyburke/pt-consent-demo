"""
Provider-related Pydantic models for validation and serialization.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class ProviderType(str, Enum):
    """Provider type enumeration."""
    HEALTHCARE = "healthcare"
    BEHAVIORAL_HEALTH = "behavioral_health"
    SOCIAL_CARE = "social_care"


class ProviderCreate(BaseModel):
    """
    Model for creating a new provider.
    Used by administrators to add providers to the system.
    """
    name: str = Field(..., min_length=1, max_length=200, description="Provider name")
    address: Optional[str] = Field(None, max_length=500, description="Provider address")
    type: ProviderType = Field(default=ProviderType.HEALTHCARE, description="Provider type")
    active: bool = Field(default=True, description="Whether provider is active")


class ProviderModel(BaseModel):
    """
    Provider model for database storage and API responses.
    """
    id: str = Field(..., description="Unique provider identifier")
    name: str = Field(..., description="Provider name")
    address: Optional[str] = Field(None, description="Provider address")
    type: ProviderType = Field(default=ProviderType.HEALTHCARE, description="Provider type")
    active: bool = Field(default=True, description="Whether provider is active")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    
    class Config:
        """Pydantic configuration."""
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        use_enum_values = True
