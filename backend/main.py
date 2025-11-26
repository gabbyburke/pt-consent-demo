"""
Colorado Consent Management Backend
Flask application with Google Cloud Identity Platform integration.
"""
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials

from config import Config
from routes import auth_bp, kba_bp, consent_bp, provider_bp
from services.firestore_service import firestore_db

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
# When running on Cloud Run, Application Default Credentials are used automatically
# For local development, set GOOGLE_APPLICATION_CREDENTIALS environment variable
try:
    if not firebase_admin._apps:
        # Initialize with default credentials (works on Cloud Run and with ADC locally)
        firebase_admin.initialize_app()
        logger.info("Firebase Admin SDK initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
    logger.warning("Continuing without Firebase Admin - custom token generation will not work")


def initialize_database():
    """
    Initialize Firestore database with required data if empty.
    This ensures the database is ready on first deployment.
    """
    try:
        # Check if providers exist
        providers = firestore_db.list_providers()
        if not providers:
            logger.info("No providers found. Initializing providers...")
            
            # Initialize providers
            default_providers = [
                {
                    'id': 'denver-health',
                    'name': 'Denver Health',
                    'address': '777 Bannock St, Denver, CO 80204',
                    'type': 'hospital'
                },
                {
                    'id': 'uchealth',
                    'name': 'UCHealth',
                    'address': '1635 Aurora Court, Aurora, CO 80045',
                    'type': 'hospital'
                },
                {
                    'id': 'childrens-hospital',
                    'name': "Children's Hospital Colorado",
                    'address': '13123 E 16th Ave, Aurora, CO 80045',
                    'type': 'hospital'
                },
                {
                    'id': 'kaiser-permanente',
                    'name': 'Kaiser Permanente Colorado',
                    'address': '10350 E Dakota Ave, Denver, CO 80247',
                    'type': 'hospital'
                },
                {
                    'id': 'centura-health',
                    'name': 'Centura Health',
                    'address': '188 Inverness Dr W, Englewood, CO 80112',
                    'type': 'hospital'
                }
            ]
            
            for provider in default_providers:
                firestore_db.create_provider(provider)
            
            logger.info(f"Initialized {len(default_providers)} providers")
        else:
            logger.info(f"Found {len(providers)} existing providers")
        
        # Check if synthetic persons exist (for demo/testing)
        # We'll check the medicaid_roster collection
        try:
            test_person = firestore_db.get_person_by_medicaid_id('CO-DEMO-001')
            if not test_person:
                logger.info("No synthetic persons found. Initializing demo data...")
                
                # Initialize synthetic persons
                synthetic_persons = [
                    {
                        'medicaid_id': 'CO-DEMO-001',
                        'first_name': 'Alice',
                        'last_name': 'Anderson',
                        'date_of_birth': '1985-03-15',
                        'ssn_last_4': '1234',
                        'address': {
                            'street': '123 Demo Street',
                            'city': 'Denver',
                            'state': 'CO',
                            'zip': '80202'
                        },
                        'is_synthetic': True
                    },
                    {
                        'medicaid_id': 'CO-DEMO-002',
                        'first_name': 'Bob',
                        'last_name': 'Builder',
                        'date_of_birth': '1990-07-22',
                        'ssn_last_4': '5678',
                        'address': {
                            'street': '456 Test Avenue',
                            'city': 'Aurora',
                            'state': 'CO',
                            'zip': '80012'
                        },
                        'is_synthetic': True
                    },
                    {
                        'medicaid_id': 'CO-DEMO-003',
                        'first_name': 'Carol',
                        'last_name': 'Chen',
                        'date_of_birth': '1978-11-30',
                        'ssn_last_4': '9012',
                        'address': {
                            'street': '789 Sample Road',
                            'city': 'Boulder',
                            'state': 'CO',
                            'zip': '80301'
                        },
                        'is_synthetic': True
                    }
                ]
                
                for person in synthetic_persons:
                    firestore_db.create_person(person)
                
                logger.info(f"Initialized {len(synthetic_persons)} synthetic persons for demo")
            else:
                logger.info("Synthetic persons already exist")
        except Exception as e:
            logger.warning(f"Could not check/initialize synthetic persons: {e}")
        
        logger.info("Database initialization complete")
        
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        # Don't fail startup if initialization fails
        logger.warning("Continuing without full database initialization")

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

# Note: Database initialization should be done once manually using init_firestore.py
# This avoids unnecessary checks on every startup


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
