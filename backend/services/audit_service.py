"""
Audit logging service for HIPAA compliance.
"""
from datetime import datetime
from typing import Optional, Dict, Any
import logging

from .firestore_service import firestore_db
from models import AuditAction

logger = logging.getLogger(__name__)


class AuditService:
    """
    Service for creating audit logs.
    Critical for HIPAA compliance and security auditing.
    """
    
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
            user_id: User ID who performed the action
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
    
    def get_user_logs(self, user_id: str, limit: int = 100) -> list[Dict[str, Any]]:
        """
        Retrieves audit logs for a user.
        
        Args:
            user_id: User ID
            limit: Maximum number of logs to return
            
        Returns:
            List of audit log dictionaries
        """
        return firestore_db.get_user_audit_logs(user_id, limit)


# Singleton instance
audit_service = AuditService()
