"""
User-related Pydantic models for validation and serialization.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class KBAData(BaseModel):
    """
    Knowledge-Based Authentication data model.
    Used for identity verification.
    """
    ssn_last4: str = Field(..., min_length=4, max_length=4, description="Last 4 digits of SSN")
    dob: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    
    @field_validator('ssn_last4')
    @classmethod
    def validate_ssn(cls, v: str) -> str:
        """Validates SSN last 4 contains only digits."""
        if not v.isdigit():
            raise ValueError('SSN last 4 must contain only digits')
        return v
    
    @field_validator('dob')
    @classmethod
    def validate_dob(cls, v: str) -> str:
        """Validates date of birth format."""
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', v):
            raise ValueError('DOB must be in YYYY-MM-DD format')
        
        # Validate it's a valid date
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Invalid date')
        
        return v


class UserCreate(BaseModel):
    """
    Model for creating a new user.
    Includes PHI/PII that will be hashed before storage.
    """
    email: EmailStr = Field(..., description="User's email address")
    ssn_last4: str = Field(..., min_length=4, max_length=4, description="Last 4 digits of SSN")
    dob: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    
    @field_validator('ssn_last4')
    @classmethod
    def validate_ssn(cls, v: str) -> str:
        """Validates SSN last 4 contains only digits."""
        if not v.isdigit():
            raise ValueError('SSN last 4 must contain only digits')
        return v
    
    @field_validator('dob')
    @classmethod
    def validate_dob(cls, v: str) -> str:
        """Validates date of birth format."""
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', v):
            raise ValueError('DOB must be in YYYY-MM-DD format')
        
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Invalid date')
        
        return v


class UserModel(BaseModel):
    """
    User model for database storage and API responses.
    Contains hashed PHI/PII, never plaintext.
    """
    uid: str = Field(..., description="Unique user identifier from GCIP")
    email: EmailStr = Field(..., description="User's email address")
    ssn_hash: str = Field(..., description="Hashed SSN last 4")
    dob_hash: str = Field(..., description="Hashed date of birth")
    kba_verified: bool = Field(default=False, description="Whether KBA has been completed")
    kba_attempts: int = Field(default=0, description="Number of failed KBA attempts")
    kba_locked_until: Optional[datetime] = Field(default=None, description="KBA lockout expiration")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Account creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    
    class Config:
        """Pydantic configuration."""
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class VerificationToken(BaseModel):
    """
    Model for one-time verification tokens.
    Used for email/SMS verification links.
    """
    token: str = Field(..., description="Unique verification token")
    email: EmailStr = Field(..., description="Email address to verify")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Token creation time")
    expires_at: datetime = Field(..., description="Token expiration time")
    used: bool = Field(default=False, description="Whether token has been used")
    
    class Config:
        """Pydantic configuration."""
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
