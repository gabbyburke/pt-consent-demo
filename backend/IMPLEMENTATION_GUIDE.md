# Backend Implementation Guide

## ✅ Completed Components

### 1. Configuration (`backend/config/`)
- ✅ `settings.py` - Environment configuration
- ✅ `.env.example` - Configuration template

### 2. Models (`backend/models/`)
- ✅ `user.py` - User, KBAData, UserCreate, VerificationToken
- ✅ `provider.py` - ProviderModel, ProviderCreate, ProviderType
- ✅ `consent.py` - ConsentModel, ConsentCreate, ConsentUpdate, DataType
- ✅ `audit_log.py` - AuditLogModel, AuditAction

### 3. Utilities (`backend/utils/`)
- ✅ `security.py` - Hashing, token generation
- ✅ `notification_service.py` - Mock email/SMS

### 4. Services (`backend/services/`)
- ✅ `firestore_service.py` - Complete Firestore CRUD operations

## 🔄 Remaining Work

### Services to Create:

#### 1. `backend/services/auth_service.py`
```python
"""Authentication service using Google Cloud Identity Platform."""
from google.cloud import identity_toolkit
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
    """Service for GCIP authentication and verification links."""
    
    def __init__(self):
        """Initialize GCIP client."""
        try:
            self.client = identity_toolkit.IdentityToolkitClient()
            logger.info("GCIP client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize GCIP: {e}")
            self.client = None
    
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


auth_service = AuthService()
```

#### 2. `backend/services/kba_service.py`
```python
"""KBA verification service."""
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
    """Service for Knowledge-Based Authentication."""
    
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
                updates['kba_locked_until'] = locked_until
            
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


kba_service = KBAService()
```

#### 3. `backend/services/consent_service.py`
```python
"""Consent management service."""
from typing import List, Dict, Any
from datetime import datetime
import logging

from .firestore_service import firestore_db
from .audit_service import audit_service
from models import AuditAction

logger = logging.getLogger(__name__)


class ConsentService:
    """Service for managing user consent records."""
    
    def get_user_consents_with_providers(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Gets all consents for a user with provider details.
        
        Args:
            user_id: User ID
            
        Returns:
            List of consent records with provider info
        """
        consents = firestore_db.get_user_consents(user_id)
        providers = {p['id']: p for p in firestore_db.list_providers()}
        
        result = []
        for consent in consents:
            provider = providers.get(consent['provider_id'])
            if provider:
                result.append({
                    'id': consent['provider_id'],
                    'name': provider['name'],
                    'address': provider.get('address'),
                    'consented': consent['consented']
                })
        
        return result
    
    def toggle_consent(
        self, 
        user_id: str, 
        provider_id: str, 
        consented: bool,
        ip_address: str = None
    ) -> Dict[str, Any]:
        """
        Toggles consent for a provider.
        
        Args:
            user_id: User ID
            provider_id: Provider ID
            consented: New consent status
            ip_address: User's IP address
            
        Returns:
            Updated consent record
        """
        # Check if consent exists
        existing = firestore_db.get_user_consent_for_provider(user_id, provider_id)
        
        if existing:
            # Update existing
            firestore_db.update_consent(existing['id'], {'consented': consented})
            consent_id = existing['id']
        else:
            # Create new
            consent_data = {
                'user_id': user_id,
                'provider_id': provider_id,
                'consented': consented,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            consent_id = firestore_db.create_consent(consent_data)
        
        # Log action
        action = AuditAction.CONSENT_GRANTED if consented else AuditAction.CONSENT_REVOKED
        audit_service.log_action(
            user_id=user_id,
            action=action,
            provider_id=provider_id,
            ip_address=ip_address
        )
        
        return {'success': True, 'consent_id': consent_id}
    
    def grant_all_consents(
        self, 
        user_id: str, 
        provider_ids: List[str],
        ip_address: str = None
    ) -> Dict[str, Any]:
        """Grants consent to all providers."""
        for provider_id in provider_ids:
            self.toggle_consent(user_id, provider_id, True, ip_address)
        return {'success': True, 'count': len(provider_ids)}
    
    def revoke_all_consents(
        self, 
        user_id: str, 
        provider_ids: List[str],
        ip_address: str = None
    ) -> Dict[str, Any]:
        """Revokes consent from all providers."""
        for provider_id in provider_ids:
            self.toggle_consent(user_id, provider_id, False, ip_address)
        return {'success': True, 'count': len(provider_ids)}


consent_service = ConsentService()
```

#### 4. `backend/services/audit_service.py`
```python
"""Audit logging service for HIPAA compliance."""
from datetime import datetime
from typing import Optional, Dict, Any
import logging

from .firestore_service import firestore_db
from models import AuditAction

logger = logging.getLogger(__name__)


class AuditService:
    """Service for creating audit logs."""
    
    def log_action(
        self,
        user_id: str,
        action: AuditAction,
        provider_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Creates an audit log entry.
        
        Args:
            user_id: User ID
            action: Action performed
            provider_id: Provider ID (if applicable)
            ip_address: User's IP address
            user_agent: User agent string
            metadata: Additional metadata
            
        Returns:
            Audit log ID
        """
        log_data = {
            'user_id': user_id,
            'action': action.value,
            'provider_id': provider_id,
            'timestamp': datetime.utcnow(),
            'ip_address': ip_address,
            'user_agent': user_agent,
            'metadata': metadata or {}
        }
        
        log_id = firestore_db.create_audit_log(log_data)
        logger.info(f"Audit log created: {action.value} by {user_id}")
        
        return log_id


audit_service = AuditService()
```

## Next Steps

1. Create the service files above
2. Create API routes in `backend/routes/`
3. Update `backend/main.py` to wire everything together
4. Install dependencies: `pip install -r requirements.txt`
5. Set up `.env` file with your GCP credentials
6. Initialize Firestore with sample providers
7. Test the backend with the frontend

## Sample Firestore Initialization

Run this once to populate providers:

```python
from services.firestore_service import firestore_db
from datetime import datetime

providers = [
    {
        'name': 'Denver Health',
        'address': '777 Bannock St, Denver, CO 80204',
        'type': 'healthcare',
        'active': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    },
    {
        'name': 'UCHealth',
        'address': '1635 Aurora Court, Aurora, CO 80045',
        'type': 'healthcare',
        'active': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    },
    {
        'name': "Children's Hospital Colorado",
        'address': '13123 E 16th Ave, Aurora, CO 80045',
        'type': 'healthcare',
        'active': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
]

for provider in providers:
    firestore_db.create_provider(provider)
