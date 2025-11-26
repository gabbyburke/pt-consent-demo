"""
KBA (Knowledge-Based Authentication) verification service.
Implements 2-of-4 verification using Medicaid roster data.
"""
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
import logging

from config import Config
from .firestore_service import firestore_db
from .audit_service import audit_service
from models import AuditAction

logger = logging.getLogger(__name__)


class KBAService:
    """
    Service for Knowledge-Based Authentication.
    Verifies user identity using 2 out of 4 data points:
    - SSN last 4
    - Date of birth
    - ZIP code
    - Street address
    """
    
    def lookup_person(self, medicaid_id: str) -> Optional[Dict[str, Any]]:
        """
        Look up a person by Medicaid ID in the synthetic persons collection.
        
        Args:
            medicaid_id: Medicaid ID to look up
            
        Returns:
            Person data if found, None otherwise
        """
        try:
            db = firestore_db.db
            doc_ref = db.collection('synthetic_persons').document(medicaid_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error looking up person {medicaid_id}: {e}")
            return None
    
    def check_lockout(self, medicaid_id: str) -> Dict[str, Any]:
        """
        Check if a Medicaid ID is locked out due to too many failed attempts.
        
        Args:
            medicaid_id: Medicaid ID to check
            
        Returns:
            Dict with locked status and message
        """
        try:
            db = firestore_db.db
            doc_ref = db.collection('kba_attempts').document(medicaid_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return {'locked': False}
            
            data = doc.to_dict()
            attempts = data.get('attempts', 0)
            locked_until = data.get('locked_until')
            
            if locked_until:
                locked_until_dt = locked_until
                if isinstance(locked_until, str):
                    locked_until_dt = datetime.fromisoformat(locked_until.replace('Z', '+00:00'))
                
                if locked_until_dt > datetime.now(timezone.utc):
                    minutes_remaining = int((locked_until_dt - datetime.now(timezone.utc)).total_seconds() / 60)
                    return {
                        'locked': True,
                        'message': f'Account temporarily locked. Try again in {minutes_remaining} minutes.',
                        'locked_until': locked_until_dt.isoformat()
                    }
                else:
                    # Lockout expired, reset
                    doc_ref.update({
                        'attempts': 0,
                        'locked_until': None
                    })
                    return {'locked': False}
            
            return {'locked': False, 'attempts': attempts}
            
        except Exception as e:
            logger.error(f"Error checking lockout for {medicaid_id}: {e}")
            return {'locked': False}
    
    def record_attempt(
        self, 
        medicaid_id: str, 
        success: bool,
        ip_address: Optional[str] = None
    ) -> None:
        """
        Record a KBA attempt (success or failure).
        
        Args:
            medicaid_id: Medicaid ID
            success: Whether the attempt was successful
            ip_address: User's IP address
        """
        try:
            db = firestore_db.db
            doc_ref = db.collection('kba_attempts').document(medicaid_id)
            doc = doc_ref.get()
            
            if success:
                # Reset attempts on success
                doc_ref.set({
                    'medicaid_id': medicaid_id,
                    'attempts': 0,
                    'locked_until': None,
                    'last_success': datetime.now(timezone.utc),
                    'last_ip': ip_address
                })
            else:
                # Increment attempts on failure
                if doc.exists:
                    data = doc.to_dict()
                    attempts = data.get('attempts', 0) + 1
                else:
                    attempts = 1
                
                update_data = {
                    'medicaid_id': medicaid_id,
                    'attempts': attempts,
                    'last_attempt': datetime.now(timezone.utc),
                    'last_ip': ip_address
                }
                
                # Lock if max attempts reached
                if attempts >= Config.MAX_KBA_ATTEMPTS:
                    locked_until = datetime.now(timezone.utc) + timedelta(
                        minutes=Config.KBA_LOCKOUT_MINUTES
                    )
                    update_data['locked_until'] = locked_until
                
                doc_ref.set(update_data)
                
        except Exception as e:
            logger.error(f"Error recording attempt for {medicaid_id}: {e}")
    
    def verify_identity(
        self, 
        medicaid_id: str,
        ssn_last4: Optional[str] = None,
        dob: Optional[str] = None,
        zip_code: Optional[str] = None,
        street: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Verifies user identity using 2-of-4 KBA verification.
        
        Args:
            medicaid_id: Medicaid ID
            ssn_last4: Last 4 digits of SSN (optional)
            dob: Date of birth in YYYY-MM-DD format (optional)
            zip_code: ZIP code (optional)
            street: Street address (optional)
            ip_address: User's IP address
            
        Returns:
            Dict with verification result
        """
        # Check if locked out
        lockout_status = self.check_lockout(medicaid_id)
        if lockout_status.get('locked'):
            return {
                'verified': False,
                'message': lockout_status['message']
            }
        
        # Look up person
        person = self.lookup_person(medicaid_id)
        if not person:
            # Record failed attempt
            self.record_attempt(medicaid_id, False, ip_address)
            
            return {
                'verified': False,
                'message': 'Medicaid ID not found'
            }
        
        # Count how many fields match
        matches = 0
        fields_checked = 0
        
        if ssn_last4 is not None:
            fields_checked += 1
            if ssn_last4 == person.get('ssn_last_4'):
                matches += 1
        
        if dob is not None:
            fields_checked += 1
            if dob == person.get('date_of_birth'):
                matches += 1
        
        if zip_code is not None:
            fields_checked += 1
            person_zip = person.get('address', {}).get('zip')
            if zip_code == person_zip:
                matches += 1
        
        if street is not None:
            fields_checked += 1
            person_street = person.get('address', {}).get('street', '').lower()
            if street.lower() == person_street:
                matches += 1
        
        # Need at least 2 fields checked and 2 matches
        if fields_checked < 2:
            return {
                'verified': False,
                'message': 'Please provide at least 2 verification fields'
            }
        
        if matches >= 2:
            # Success!
            self.record_attempt(medicaid_id, True, ip_address)
            
            # Log success
            audit_service.log_action(
                user_id=medicaid_id,
                action=AuditAction.KBA_VERIFIED,
                ip_address=ip_address,
                details={
                    'fields_checked': fields_checked,
                    'matches': matches
                }
            )
            
            return {
                'verified': True,
                'message': 'Identity verified',
                'person': {
                    'medicaid_id': person['medicaid_id'],
                    'first_name': person['first_name'],
                    'last_name': person['last_name'],
                    'email': person.get('email'),
                    'phone': person.get('phone')
                }
            }
        else:
            # Failed
            self.record_attempt(medicaid_id, False, ip_address)
            
            # Log failure
            audit_service.log_action(
                user_id=medicaid_id,
                action=AuditAction.KBA_FAILED,
                ip_address=ip_address,
                details={
                    'fields_checked': fields_checked,
                    'matches': matches
                }
            )
            
            attempts = lockout_status.get('attempts', 0) + 1
            remaining = Config.MAX_KBA_ATTEMPTS - attempts
            
            if remaining > 0:
                message = f'Verification failed. {remaining} attempts remaining.'
            else:
                message = f'Too many failed attempts. Account locked for {Config.KBA_LOCKOUT_MINUTES} minutes.'
            
            return {
                'verified': False,
                'message': message,
                'attempts_remaining': max(0, remaining)
            }


# Singleton instance
kba_service = KBAService()
