"""
Colorado Consent Management Backend
Flask application with Google Cloud Identity Platform integration.
"""
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from config import Config
from routes import auth_bp, kba_bp, consent_bp, provider_bp

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, origins=Config.CORS_ORIGINS)

# Validate configuration
try:
    Config.validate()
    logger.info("Configuration validated successfully")
    logger.info(f"Config summary: {Config.get_config_summary()}")
except ValueError as e:
    logger.error(f"Configuration error: {e}")
    raise

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(kba_bp)
app.register_blueprint(consent_bp)
app.register_blueprint(provider_bp)

logger.info("All blueprints registered")


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Global health check endpoint.
    Returns the status of the backend and configuration.
    """
    return jsonify({
        "status": "ok",
        "message": "Colorado Consent Management Backend is running",
        "config": Config.get_config_summary()
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    debug = Config.DEBUG
    
    logger.info(f"Starting server on port {port} (debug={debug})")
    app.run(debug=debug, host='0.0.0.0', port=port)
