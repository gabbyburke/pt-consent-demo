"""
Firestore database service for managing all database operations.
"""
from google.cloud import firestore
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime

from config import Config

logger = logging.getLogger(__name__)


class FirestoreService:
    """
    Service for managing Firestore database operations.
    Provides CRUD operations for all collections.
    """
    
    def __init__(self):
        """Initialize Firestore client."""
        try:
            self.db = firestore.Client(
                project=Config.GCP_PROJECT_ID,
                database=Config.FIRESTORE_DATABASE
            )
            logger.info(f"Firestore client initialized for project: {Config.GCP_PROJECT_ID}")
        except Exception as e:
            logger.error(f"Failed to initialize Firestore client: {e}")
            self.db = None
    
    # User Operations
    
    def create_user(self, user_data: Dict[str, Any]) -> str:
        """
        Creates a new user document.
        
        Args:
            user_data: User data dictionary
            
        Returns:
            User document ID
        """
        doc_ref = self.db.collection('users').document(user_data['uid'])
        doc_ref.set(user_data)
        logger.info(f"Created user: {user_data['uid']}")
        return user_data['uid']
    
    def get_user(self, uid: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a user by UID.
        
        Args:
            uid: User ID
            
        Returns:
            User data or None if not found
        """
        doc_ref = self.db.collection('users').document(uid)
        doc = doc_ref.get()
        return doc.to_dict() if doc.exists else None
    
    def update_user(self, uid: str, updates: Dict[str, Any]) -> None:
        """
        Updates a user document.
        
        Args:
            uid: User ID
            updates: Fields to update
        """
        updates['updated_at'] = datetime.utcnow()
        self.db.collection('users').document(uid).update(updates)
        logger.info(f"Updated user: {uid}")
    
    # Provider Operations
    
    def create_provider(self, provider_data: Dict[str, Any]) -> str:
        """
        Creates a new provider document.
        
        Args:
            provider_data: Provider data dictionary
            
        Returns:
            Provider document ID
        """
        doc_ref = self.db.collection('providers').document()
        provider_data['id'] = doc_ref.id
        doc_ref.set(provider_data)
        logger.info(f"Created provider: {doc_ref.id}")
        return doc_ref.id
    
    def get_provider(self, provider_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a provider by ID.
        
        Args:
            provider_id: Provider ID
            
        Returns:
            Provider data or None if not found
        """
        doc_ref = self.db.collection('providers').document(provider_id)
        doc = doc_ref.get()
        return doc.to_dict() if doc.exists else None
    
    def list_providers(self, active_only: bool = True) -> List[Dict[str, Any]]:
        """
        Lists all providers.
        
        Args:
            active_only: If True, only return active providers
            
        Returns:
            List of provider dictionaries
        """
        query = self.db.collection('providers')
        if active_only:
            query = query.where('active', '==', True)
        
        docs = query.stream()
        return [doc.to_dict() for doc in docs]
    
    # Consent Operations
    
    def create_consent(self, consent_data: Dict[str, Any]) -> str:
        """
        Creates a new consent record.
        
        Args:
            consent_data: Consent data dictionary
            
        Returns:
            Consent document ID
        """
        doc_ref = self.db.collection('consents').document()
        consent_data['id'] = doc_ref.id
        doc_ref.set(consent_data)
        logger.info(f"Created consent: {doc_ref.id}")
        return doc_ref.id
    
    def get_consent(self, consent_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a consent record by ID.
        
        Args:
            consent_id: Consent ID
            
        Returns:
            Consent data or None if not found
        """
        doc_ref = self.db.collection('consents').document(consent_id)
        doc = doc_ref.get()
        return doc.to_dict() if doc.exists else None
    
    def get_user_consents(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves all consent records for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of consent dictionaries
        """
        docs = self.db.collection('consents').where('user_id', '==', user_id).stream()
        return [doc.to_dict() for doc in docs]
    
    def get_user_consent_for_provider(
        self, 
        user_id: str, 
        provider_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieves a specific consent record for a user and provider.
        
        Args:
            user_id: User ID
            provider_id: Provider ID
            
        Returns:
            Consent data or None if not found
        """
        docs = self.db.collection('consents')\
            .where('user_id', '==', user_id)\
            .where('provider_id', '==', provider_id)\
            .limit(1)\
            .stream()
        
        for doc in docs:
            return doc.to_dict()
        return None
    
    def update_consent(self, consent_id: str, updates: Dict[str, Any]) -> None:
        """
        Updates a consent record.
        
        Args:
            consent_id: Consent ID
            updates: Fields to update
        """
        updates['updated_at'] = datetime.utcnow()
        self.db.collection('consents').document(consent_id).update(updates)
        logger.info(f"Updated consent: {consent_id}")
    
    # Audit Log Operations
    
    def create_audit_log(self, log_data: Dict[str, Any]) -> str:
        """
        Creates a new audit log entry.
        
        Args:
            log_data: Audit log data dictionary
            
        Returns:
            Audit log document ID
        """
        doc_ref = self.db.collection('audit_logs').document()
        log_data['id'] = doc_ref.id
        doc_ref.set(log_data)
        return doc_ref.id
    
    def get_user_audit_logs(
        self, 
        user_id: str, 
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Retrieves audit logs for a user.
        
        Args:
            user_id: User ID
            limit: Maximum number of logs to return
            
        Returns:
            List of audit log dictionaries
        """
        docs = self.db.collection('audit_logs')\
            .where('user_id', '==', user_id)\
            .order_by('timestamp', direction=firestore.Query.DESCENDING)\
            .limit(limit)\
            .stream()
        
        return [doc.to_dict() for doc in docs]
    
    # Medicaid Roster Operations (for KBA verification)
    
    def create_person(self, person_data: Dict[str, Any]) -> str:
        """
        Creates a new person in the medicaid_roster collection.
        
        Args:
            person_data: Person data dictionary
            
        Returns:
            Person document ID (medicaid_id)
        """
        medicaid_id = person_data['medicaid_id']
        doc_ref = self.db.collection('medicaid_roster').document(medicaid_id)
        doc_ref.set(person_data)
        logger.info(f"Created person in medicaid_roster: {medicaid_id}")
        return medicaid_id
    
    def get_person_by_medicaid_id(self, medicaid_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a person by Medicaid ID from the medicaid_roster collection.
        
        Args:
            medicaid_id: Medicaid ID
            
        Returns:
            Person data or None if not found
        """
        doc_ref = self.db.collection('medicaid_roster').document(medicaid_id)
        doc = doc_ref.get()
        return doc.to_dict() if doc.exists else None
    
    # Verification Token Operations
    
    def create_verification_token(self, token_data: Dict[str, Any]) -> str:
        """
        Creates a verification token.
        
        Args:
            token_data: Token data dictionary
            
        Returns:
            Token document ID
        """
        doc_ref = self.db.collection('verification_tokens').document(token_data['token'])
        doc_ref.set(token_data)
        logger.info(f"Created verification token for: {token_data['email']}")
        return token_data['token']
    
    def get_verification_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a verification token.
        
        Args:
            token: Token string
            
        Returns:
            Token data or None if not found
        """
        doc_ref = self.db.collection('verification_tokens').document(token)
        doc = doc_ref.get()
        return doc.to_dict() if doc.exists else None
    
    def mark_token_used(self, token: str) -> None:
        """
        Marks a verification token as used.
        
        Args:
            token: Token string
        """
        self.db.collection('verification_tokens').document(token).update({
            'used': True
        })
        logger.info(f"Marked token as used: {token}")


# Singleton instance
firestore_db = FirestoreService()
