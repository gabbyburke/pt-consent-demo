"""
Consent management API routes.
"""
from flask import Blueprint, request, jsonify
import logging

from services import consent_service

logger = logging.getLogger(__name__)

consent_bp = Blueprint('consent', __name__, url_prefix='/api/consents')


def get_user_from_token():
    """Helper to extract user ID from authorization token."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    uid = token.replace('mock-token-', '')
    return uid


@consent_bp.route('', methods=['GET'])
def get_consents():
    """
    Gets all consent records for the authenticated user.
    
    Request headers:
        Authorization: Bearer <token>
    
    Returns:
        200: List of consent records with provider details
        401: Unauthorized
        500: Server error
    """
    try:
        uid = get_user_from_token()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        
        consents = consent_service.get_user_consents_with_providers(uid)
        
        return jsonify({'providers': consents}), 200
        
    except Exception as e:
        logger.error(f"Error getting consents: {e}")
        return jsonify({'error': 'Failed to get consents'}), 500


@consent_bp.route('/toggle', methods=['POST'])
def toggle_consent():
    """
    Toggles consent for a specific provider.
    
    Request headers:
        Authorization: Bearer <token>
    
    Request body:
        {
            "provider_id": "provider-123",
            "consented": true
        }
    
    Returns:
        200: Consent updated successfully
        400: Invalid request
        401: Unauthorized
        500: Server error
    """
    try:
        uid = get_user_from_token()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.get_json()
        provider_id = data.get('provider_id')
        consented = data.get('consented')
        
        if provider_id is None or consented is None:
            return jsonify({'error': 'provider_id and consented are required'}), 400
        
        ip_address = request.remote_addr
        
        result = consent_service.toggle_consent(
            user_id=uid,
            provider_id=provider_id,
            consented=consented,
            ip_address=ip_address
        )
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error toggling consent: {e}")
        return jsonify({'error': 'Failed to toggle consent'}), 500


@consent_bp.route('/grant-all', methods=['POST'])
def grant_all():
    """
    Grants consent to all providers.
    
    Request headers:
        Authorization: Bearer <token>
    
    Request body:
        {
            "provider_ids": ["p1", "p2", "p3"]
        }
    
    Returns:
        200: Consents granted successfully
        400: Invalid request
        401: Unauthorized
        500: Server error
    """
    try:
        uid = get_user_from_token()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.get_json()
        provider_ids = data.get('provider_ids', [])
        
        if not provider_ids:
            return jsonify({'error': 'provider_ids is required'}), 400
        
        ip_address = request.remote_addr
        
        result = consent_service.grant_all_consents(
            user_id=uid,
            provider_ids=provider_ids,
            ip_address=ip_address
        )
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error granting all consents: {e}")
        return jsonify({'error': 'Failed to grant all consents'}), 500


@consent_bp.route('/revoke-all', methods=['POST'])
def revoke_all():
    """
    Revokes consent from all providers.
    
    Request headers:
        Authorization: Bearer <token>
    
    Request body:
        {
            "provider_ids": ["p1", "p2", "p3"]
        }
    
    Returns:
        200: Consents revoked successfully
        400: Invalid request
        401: Unauthorized
        500: Server error
    """
    try:
        uid = get_user_from_token()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.get_json()
        provider_ids = data.get('provider_ids', [])
        
        if not provider_ids:
            return jsonify({'error': 'provider_ids is required'}), 400
        
        ip_address = request.remote_addr
        
        result = consent_service.revoke_all_consents(
            user_id=uid,
            provider_ids=provider_ids,
            ip_address=ip_address
        )
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error revoking all consents: {e}")
        return jsonify({'error': 'Failed to revoke all consents'}), 500


@consent_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'consent'}), 200
