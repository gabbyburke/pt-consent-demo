"""
KBA (Knowledge-Based Authentication) verification service.
"""
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import logging

from config import Config
from utils import hash_value, verify_hash
from .firestore_service import firestore_db
from .audit_service import audit_service
from models import AuditAction

logger = logging.getLogger(__name__)


class KBAService:
    """
    Service for Knowledge-Based Authentication.
    Verifies user identity using SSN last 4 and date of birth.
    """
    
    def verify_identity(
        self, 
        uid: str, 
        ssn_last4: str, 
        dob: str,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Verifies user identity using KBA data.
        
        Args:
            uid: User ID
            ssn_last4: Last 4 digits of SSN
            dob: Date of birth (YYYY-MM-DD)
            ip_address: User's IP address
            
        Returns:
            Dict with verification result
        """
        user = firestore_db.get_user(uid)
        
        if not user:
            return {'verified': False, 'message': 'User not found'}
        
        # Check if locked out
        if user.get('kba_locked_until'):
            locked_until = datetime.fromisoformat(user['kba_locked_until'])
            if locked_until > datetime.utcnow():
                return {
                    'verified': False,
                    'message': 'Account temporarily locked. Try again later.'
                }
        
        # Verify SSN and DOB
        ssn_match = verify_hash(ssn_last4, user['ssn_hash'])
        dob_match = verify_hash(dob, user['dob_hash'])
        
        if ssn_match and dob_match:
            # Success - reset attempts and mark verified
            firestore_db.update_user(uid, {
                'kba_verified': True,
                'kba_attempts': 0,
                'kba_locked_until': None
            })
            
            # Log success
            audit_service.log_action(
                user_id=uid,
                action=AuditAction.KBA_VERIFIED,
                ip_address=ip_address
            )
            
            return {'verified': True, 'message': 'Identity verified'}
        else:
            # Failed attempt
            attempts = user.get('kba_attempts', 0) + 1
            updates = {'kba_attempts': attempts}
            
            # Lock account if max attempts reached
            if attempts >= Config.MAX_KBA_ATTEMPTS:
                locked_until = datetime.utcnow() + timedelta(
                    minutes=Config.KBA_LOCKOUT_MINUTES
                )
                updates['kba_locked_until'] = locked_until.isoformat()
            
            firestore_db.update_user(uid, updates)
            
            # Log failure
            audit_service.log_action(
                user_id=uid,
                action=AuditAction.KBA_FAILED,
                ip_address=ip_address
            )
            
            remaining = Config.MAX_KBA_ATTEMPTS - attempts
            if remaining > 0:
                message = f'Incorrect information. {remaining} attempts remaining.'
            else:
                message = f'Account locked for {Config.KBA_LOCKOUT_MINUTES} minutes.'
            
            return {'verified': False, 'message': message}


# Singleton instance
kba_service = KBAService()
