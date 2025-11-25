"""
Authentication API routes.
"""
from flask import Blueprint, request, jsonify
from pydantic import ValidationError
import logging

from services import auth_service
from models import UserCreate

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/send-verification', methods=['POST'])
def send_verification():
    """
    Sends a verification link to the user's email.
    
    Request body:
        {
            "email": "user@example.com"
        }
    
    Returns:
        200: Verification link sent successfully
        400: Invalid request
        500: Server error
    """
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        result = auth_service.send_verification_link(email)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error sending verification: {e}")
        return jsonify({'error': 'Failed to send verification link'}), 500


@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """
    Verifies a verification token.
    
    Request body:
        {
            "token": "verification-token-string"
        }
    
    Returns:
        200: Token valid, returns email and custom token
        400: Invalid request
        401: Invalid or expired token
        500: Server error
    """
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token is required'}), 400
        
        email = auth_service.verify_token(token)
        
        if not email:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Create a mock UID for prototype
        # In production, this would create/get the user from GCIP
        uid = f"user-{email.split('@')[0]}"
        
        # Create custom token
        custom_token = auth_service.create_custom_token(uid)
        
        return jsonify({
            'email': email,
            'uid': uid,
            'token': custom_token
        }), 200
        
    except Exception as e:
        logger.error(f"Error verifying token: {e}")
        return jsonify({'error': 'Failed to verify token'}), 500


@auth_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'auth'}), 200
