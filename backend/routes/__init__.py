"""
API routes for the consent management backend.
"""
from .auth_routes import auth_bp
from .kba_routes import kba_bp
from .consent_routes import consent_bp
from .provider_routes import provider_bp

__all__ = [
    'auth_bp',
    'kba_bp',
    'consent_bp',
    'provider_bp',
]
