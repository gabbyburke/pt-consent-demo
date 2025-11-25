"""
Authentication service using Google Cloud Identity Platform.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging

from config import Config
from utils import generate_token
from .firestore_service import firestore_db
from utils.notification_service import MockNotificationService

logger = logging.getLogger(__name__)
notification_service = MockNotificationService()


class AuthService:
    """
    Service for GCIP authentication and verification links.
    Handles one-time verification link generation and validation.
    """
    
    def __init__(self):
        """Initialize GCIP client (mock for prototype)."""
        # For prototype, we'll use mock authentication
        # In production, integrate with Google Cloud Identity Platform
        self.client = None
        logger.info("Auth service initialized (mock mode)")
    
    def send_verification_link(self, email: str) -> Dict[str, Any]:
        """
        Generates and sends a verification link.
        
        Args:
            email: User email address
            
        Returns:
            Dict with success status and token info
        """
        # Generate token
        token = generate_token()
        expires_at = datetime.utcnow() + timedelta(
            minutes=Config.TOKEN_EXPIRATION_MINUTES
        )
        
        # Store token in Firestore
        token_data = {
            'token': token,
            'email': email,
            'created_at': datetime.utcnow(),
            'expires_at': expires_at,
            'used': False
        }
        firestore_db.create_verification_token(token_data)
        
        # Generate verification link
        base_url = "http://localhost:5173"  # Frontend URL
        verification_link = f"{base_url}/verify?token={token}"
        
        # Send mock email
        notification_service.send_verification_email(email, verification_link)
        
        return {
            'success': True,
            'email': email,
            'expires_in_minutes': Config.TOKEN_EXPIRATION_MINUTES
        }
    
    def verify_token(self, token: str) -> Optional[str]:
        """
        Verifies a token and returns the email if valid.
        
        Args:
            token: Verification token
            
        Returns:
            Email address if valid, None otherwise
        """
        token_data = firestore_db.get_verification_token(token)
        
        if not token_data:
            logger.warning(f"Token not found: {token}")
            return None
        
        if token_data['used']:
            logger.warning(f"Token already used: {token}")
            return None
        
        if datetime.fromisoformat(token_data['expires_at']) < datetime.utcnow():
            logger.warning(f"Token expired: {token}")
            return None
        
        # Mark token as used
        firestore_db.mark_token_used(token)
        
        return token_data['email']
    
    def create_custom_token(self, uid: str) -> str:
        """
        Creates a GCIP custom token for a user.
        
        Args:
            uid: User ID
            
        Returns:
            Custom token string
        """
        # For prototype, return a mock token
        # In production, use: self.client.create_custom_token(uid)
        return f"mock-token-{uid}"


# Singleton instance
auth_service = AuthService()
