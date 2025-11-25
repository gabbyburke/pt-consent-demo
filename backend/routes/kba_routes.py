"""
KBA (Knowledge-Based Authentication) API routes.
"""
from flask import Blueprint, request, jsonify
from pydantic import ValidationError
import logging

from services import kba_service
from models import KBAData

logger = logging.getLogger(__name__)

kba_bp = Blueprint('kba', __name__, url_prefix='/api/kba')


@kba_bp.route('/verify', methods=['POST'])
def verify_identity():
    """
    Verifies user identity using KBA data.
    
    Request headers:
        Authorization: Bearer <token>
    
    Request body:
        {
            "ssn_last4": "1234",
            "dob": "1980-01-01"
        }
    
    Returns:
        200: Identity verified successfully
        400: Invalid request
        401: Unauthorized
        403: Verification failed
        500: Server error
    """
    try:
        # Get user ID from token (mock for prototype)
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Extract UID from mock token
        token = auth_header.split(' ')[1]
        uid = token.replace('mock-token-', '')
        
        # Validate request body
        data = request.get_json()
        try:
            kba_data = KBAData(**data)
        except ValidationError as e:
            return jsonify({'error': 'Invalid KBA data', 'details': e.errors()}), 400
        
        # Get IP address
        ip_address = request.remote_addr
        
        # Verify identity
        result = kba_service.verify_identity(
            uid=uid,
            ssn_last4=kba_data.ssn_last4,
            dob=kba_data.dob,
            ip_address=ip_address
        )
        
        if result['verified']:
            return jsonify(result), 200
        else:
            return jsonify(result), 403
        
    except Exception as e:
        logger.error(f"Error verifying identity: {e}")
        return jsonify({'error': 'Failed to verify identity'}), 500


@kba_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'kba'}), 200
