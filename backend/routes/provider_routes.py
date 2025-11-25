"""
Provider management API routes.
"""
from flask import Blueprint, request, jsonify
import logging

from services import firestore_db

logger = logging.getLogger(__name__)

provider_bp = Blueprint('provider', __name__, url_prefix='/api/providers')


@provider_bp.route('', methods=['GET'])
def get_providers():
    """
    Gets all active providers.
    
    Returns:
        200: List of providers
        500: Server error
    """
    try:
        providers = firestore_db.list_providers(active_only=True)
        return jsonify({'providers': providers}), 200
        
    except Exception as e:
        logger.error(f"Error getting providers: {e}")
        return jsonify({'error': 'Failed to get providers'}), 500


@provider_bp.route('/<provider_id>', methods=['GET'])
def get_provider(provider_id):
    """
    Gets a specific provider by ID.
    
    Args:
        provider_id: Provider ID
    
    Returns:
        200: Provider details
        404: Provider not found
        500: Server error
    """
    try:
        provider = firestore_db.get_provider(provider_id)
        
        if not provider:
            return jsonify({'error': 'Provider not found'}), 404
        
        return jsonify(provider), 200
        
    except Exception as e:
        logger.error(f"Error getting provider: {e}")
        return jsonify({'error': 'Failed to get provider'}), 500


@provider_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'provider'}), 200
