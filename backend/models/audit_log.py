"""
Audit log Pydantic models for HIPAA compliance tracking.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class AuditAction(str, Enum):
    """Audit action types for tracking consent changes and user actions."""
    CONSENT_GRANTED = "consent_granted"
    CONSENT_REVOKED = "consent_revoked"
    CONSENT_UPDATED = "consent_updated"
    KBA_VERIFIED = "kba_verified"
    KBA_FAILED = "kba_failed"
    LOGIN = "login"
    LOGOUT = "logout"
    USER_CREATED = "user_created"
    PROVIDER_CREATED = "provider_created"
    PROVIDER_UPDATED = "provider_updated"


class AuditLogModel(BaseModel):
    """
    Audit log model for tracking all user actions and consent changes.
    Critical for HIPAA compliance and security auditing.
    """
    id: str = Field(..., description="Unique log entry identifier")
    user_id: str = Field(..., description="User ID who performed the action")
    action: AuditAction = Field(..., description="Action performed")
    provider_id: Optional[str] = Field(
        default=None, 
        description="Provider ID (if applicable)"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, 
        description="When the action occurred"
    )
    ip_address: Optional[str] = Field(
        default=None, 
        description="IP address of the user"
    )
    user_agent: Optional[str] = Field(
        default=None, 
        description="User agent string"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None, 
        description="Additional metadata about the action"
    )
    
    class Config:
        """Pydantic configuration."""
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        use_enum_values = True


class AuditLogCreate(BaseModel):
    """
    Model for creating a new audit log entry.
    """
    user_id: str = Field(..., description="User ID who performed the action")
    action: AuditAction = Field(..., description="Action performed")
    provider_id: Optional[str] = Field(default=None, description="Provider ID (if applicable)")
    ip_address: Optional[str] = Field(default=None, description="IP address")
    user_agent: Optional[str] = Field(default=None, description="User agent")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
