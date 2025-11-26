"""
KBA (Knowledge-Based Authentication) API routes.
Implements 2-of-4 verification using Medicaid roster data.
"""
from flask import Blueprint, request, jsonify
import logging

from services import kba_service

logger = logging.getLogger(__name__)

kba_bp = Blueprint('kba', __name__, url_prefix='/api/kba')


@kba_bp.route('/verify', methods=['POST'])
def verify_identity():
    """
    Verifies user identity using 2-of-4 KBA verification.
    
    Request body:
        {
            "medicaid_id": "CO-DEMO-001",
            "ssn_last4": "1234",        // optional
            "dob": "1985-03-15",        // optional (YYYY-MM-DD)
            "zip_code": "80202",        // optional
            "street": "123 Demo Street" // optional
        }
    
    At least 2 fields must be provided and 2 must match to verify.
    
    Returns:
        200: Identity verified successfully
        400: Invalid request
        403: Verification failed
        429: Too many attempts (locked out)
        500: Server error
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        medicaid_id = data.get('medicaid_id')
        if not medicaid_id:
            return jsonify({'error': 'medicaid_id is required'}), 400
        
        # Get optional verification fields
        ssn_last4 = data.get('ssn_last4')
        dob = data.get('dob')
        zip_code = data.get('zip_code')
        street = data.get('street')
        
        # Get IP address
        ip_address = request.remote_addr
        
        # Verify identity
        result = kba_service.verify_identity(
            medicaid_id=medicaid_id,
            ssn_last4=ssn_last4,
            dob=dob,
            zip_code=zip_code,
            street=street,
            ip_address=ip_address
        )
        
        if result['verified']:
            return jsonify(result), 200
        else:
            # Check if locked out
            if 'locked' in result.get('message', '').lower():
                return jsonify(result), 429
            else:
                return jsonify(result), 403
        
    except Exception as e:
        logger.error(f"Error verifying identity: {e}")
        return jsonify({'error': 'Failed to verify identity'}), 500


@kba_bp.route('/lookup/<medicaid_id>', methods=['GET'])
def lookup_person(medicaid_id: str):
    """
    Look up a person by Medicaid ID (for demo purposes).
    Returns basic info without sensitive data.
    
    Args:
        medicaid_id: Medicaid ID to look up
    
    Returns:
        200: Person found
        404: Person not found
        500: Server error
    """
    try:
        person = kba_service.lookup_person(medicaid_id)
        
        if person:
            # Return only non-sensitive info
            return jsonify({
                'found': True,
                'medicaid_id': person['medicaid_id'],
                'first_name': person['first_name'],
                'last_name': person['last_name'],
                'is_synthetic': person.get('is_synthetic', False)
            }), 200
        else:
            return jsonify({'found': False}), 404
        
    except Exception as e:
        logger.error(f"Error looking up person {medicaid_id}: {e}")
        return jsonify({'error': 'Failed to lookup person'}), 500


@kba_bp.route('/status/<medicaid_id>', methods=['GET'])
def check_status(medicaid_id: str):
    """
    Check KBA attempt status for a Medicaid ID.
    
    Args:
        medicaid_id: Medicaid ID to check
    
    Returns:
        200: Status retrieved
        500: Server error
    """
    try:
        status = kba_service.check_lockout(medicaid_id)
        return jsonify(status), 200
        
    except Exception as e:
        logger.error(f"Error checking status for {medicaid_id}: {e}")
        return jsonify({'error': 'Failed to check status'}), 500


@kba_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'kba'}), 200
