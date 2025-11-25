"""
Mock notification service for email and SMS.
Logs to console for prototype testing.
Can be replaced with real SendGrid/Twilio later.
"""
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class MockNotificationService:
    """
    Mock notification service that logs to console instead of sending real emails/SMS.
    Perfect for prototype development and testing.
    """
    
    def send_verification_email(self, email: str, verification_link: str) -> Dict[str, Any]:
        """
        Mock email sending - logs to console.
        
        Args:
            email: Recipient email address
            verification_link: Verification link to include in email
            
        Returns:
            Dict with success status and mock flag
        """
        message = f"""
╔═══════════════════════════════════════════════════════════════╗
║                   📧 MOCK EMAIL SERVICE                        ║
╠═══════════════════════════════════════════════════════════════╣
║ To: {email:<57} ║
║ Subject: Verify Your Identity - Colorado Consent Portal      ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║ Hello,                                                        ║
║                                                               ║
║ Click the link below to verify your identity and access      ║
║ your consent management portal:                              ║
║                                                               ║
║ {verification_link:<61} ║
║                                                               ║
║ This link will expire in 15 minutes.                         ║
║                                                               ║
║ If you did not request this, please ignore this email.       ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║ ⚠️  THIS IS A MOCK EMAIL - Copy the link above to test       ║
╚═══════════════════════════════════════════════════════════════╝
"""
        print(message)
        logger.info(f"Mock email sent to {email}")
        
        return {
            "success": True,
            "mock": True,
            "email": email,
            "link": verification_link
        }
    
    def send_verification_sms(self, phone: str, verification_link: str) -> Dict[str, Any]:
        """
        Mock SMS sending - logs to console.
        
        Args:
            phone: Recipient phone number
            verification_link: Verification link to include in SMS
            
        Returns:
            Dict with success status and mock flag
        """
        message = f"""
╔═══════════════════════════════════════════════════════════════╗
║                   📱 MOCK SMS SERVICE                          ║
╠═══════════════════════════════════════════════════════════════╣
║ To: {phone:<57} ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║ Colorado Consent Portal: Verify your identity                ║
║                                                               ║
║ {verification_link:<61} ║
║                                                               ║
║ Link expires in 15 minutes.                                  ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║ ⚠️  THIS IS A MOCK SMS - Copy the link above to test         ║
╚═══════════════════════════════════════════════════════════════╝
"""
        print(message)
        logger.info(f"Mock SMS sent to {phone}")
        
        return {
            "success": True,
            "mock": True,
            "phone": phone,
            "link": verification_link
        }
    
    def send_consent_change_notification(
        self, 
        email: str, 
        provider_name: str, 
        consented: bool
    ) -> Dict[str, Any]:
        """
        Mock notification for consent changes.
        
        Args:
            email: User email address
            provider_name: Name of the provider
            consented: Whether consent was granted or revoked
            
        Returns:
            Dict with success status
        """
        action = "granted to" if consented else "revoked from"
        message = f"""
╔═══════════════════════════════════════════════════════════════╗
║              📧 MOCK CONSENT CHANGE NOTIFICATION               ║
╠═══════════════════════════════════════════════════════════════╣
║ To: {email:<57} ║
║ Subject: Consent {action} {provider_name:<30} ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║ Your consent has been {action:<40} ║
║ {provider_name:<61} ║
║                                                               ║
║ This change has been logged for your records.                ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║ ⚠️  THIS IS A MOCK EMAIL                                      ║
╚═══════════════════════════════════════════════════════════════╝
"""
        print(message)
        logger.info(f"Mock consent change notification sent to {email}")
        
        return {
            "success": True,
            "mock": True,
            "email": email
        }


# Singleton instance
