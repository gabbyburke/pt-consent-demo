"""
Consent management service.
"""
from typing import List, Dict, Any
from datetime import datetime
import logging

from .firestore_service import firestore_db
from .audit_service import audit_service
from models import AuditAction

logger = logging.getLogger(__name__)


class ConsentService:
    """
    Service for managing user consent records.
    Handles CRUD operations and audit logging for consent changes.
    """
    
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
        
        logger.info(f"Consent {'granted' if consented else 'revoked'} for user {user_id}, provider {provider_id}")
        
        return {'success': True, 'consent_id': consent_id}
    
    def grant_all_consents(
        self, 
        user_id: str, 
        provider_ids: List[str],
        ip_address: str = None
    ) -> Dict[str, Any]:
        """
        Grants consent to all providers.
        
        Args:
            user_id: User ID
            provider_ids: List of provider IDs
            ip_address: User's IP address
            
        Returns:
            Success status and count
        """
        for provider_id in provider_ids:
            self.toggle_consent(user_id, provider_id, True, ip_address)
        
        logger.info(f"Granted consent to all {len(provider_ids)} providers for user {user_id}")
        return {'success': True, 'count': len(provider_ids)}
    
    def revoke_all_consents(
        self, 
        user_id: str, 
        provider_ids: List[str],
        ip_address: str = None
    ) -> Dict[str, Any]:
        """
        Revokes consent from all providers.
        
        Args:
            user_id: User ID
            provider_ids: List of provider IDs
            ip_address: User's IP address
            
        Returns:
            Success status and count
        """
        for provider_id in provider_ids:
            self.toggle_consent(user_id, provider_id, False, ip_address)
        
        logger.info(f"Revoked consent from all {len(provider_ids)} providers for user {user_id}")
        return {'success': True, 'count': len(provider_ids)}


# Singleton instance
consent_service = ConsentService()
