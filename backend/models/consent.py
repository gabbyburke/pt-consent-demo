"""
Consent-related Pydantic models for validation and serialization.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class DataType(str, Enum):
    """Data type enumeration for granular consent control."""
    MEDICAL_RECORDS = "medical_records"
    LAB_RESULTS = "lab_results"
    PRESCRIPTIONS = "prescriptions"
    BEHAVIORAL_HEALTH = "behavioral_health"
    SUBSTANCE_USE_DISORDER = "substance_use_disorder"
    SOCIAL_SERVICES = "social_services"


class ConsentCreate(BaseModel):
    """
    Model for creating a new consent record.
    """
    provider_id: str = Field(..., description="Provider ID to grant/revoke consent for")
    consented: bool = Field(..., description="Whether consent is granted")
    data_types: Optional[List[DataType]] = Field(
        default=None, 
        description="Specific data types consented (for granular control)"
    )
    expiration_date: Optional[datetime] = Field(
        default=None, 
        description="Optional expiration date for the consent"
    )


class ConsentUpdate(BaseModel):
    """
    Model for updating an existing consent record.
    """
    consented: bool = Field(..., description="New consent status")
    data_types: Optional[List[DataType]] = Field(
        default=None, 
        description="Updated data types consented"
    )
    expiration_date: Optional[datetime] = Field(
        default=None, 
        description="Updated expiration date"
    )


class ConsentModel(BaseModel):
    """
    Consent model for database storage and API responses.
    """
    id: str = Field(..., description="Unique consent record identifier")
    user_id: str = Field(..., description="User ID who owns this consent")
    provider_id: str = Field(..., description="Provider ID this consent applies to")
    consented: bool = Field(..., description="Whether consent is granted")
    data_types: Optional[List[DataType]] = Field(
        default=None, 
        description="Specific data types consented"
    )
    expiration_date: Optional[datetime] = Field(
        default=None, 
        description="Consent expiration date"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow, 
        description="When consent was created"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow, 
        description="When consent was last updated"
    )
    
    class Config:
        """Pydantic configuration."""
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        use_enum_values = True


class ConsentWithProvider(ConsentModel):
    """
    Extended consent model that includes provider details.
    Used for API responses to frontend.
    """
    provider_name: str = Field(..., description="Provider name")
    provider_address: Optional[str] = Field(None, description="Provider address")
