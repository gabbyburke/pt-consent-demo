# Colorado Consent Management Backend

Flask-based backend for the Colorado Consent Management application, deployed on Google Cloud Run.

## Quick Start

### Prerequisites

- Python 3.13+
- Google Cloud SDK (`gcloud`)
- Access to `gb-demos` GCP project

### Local Development

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run locally:**
   ```bash
   python main.py
   ```

   Server will start at `http://localhost:8080`

### Deploy to Cloud Run

**Important:** Run the deploy script from the `backend` directory:

```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Enable required GCP APIs
2. Build the Docker container
3. Deploy to Cloud Run
4. Display the service URL

### Initialize Firestore

After deployment, populate Firestore with sample providers:

```bash
cd backend
python init_firestore.py
```

## Project Structure

```
backend/
├── config/              # Configuration management
├── models/              # Pydantic data models
├── services/            # Business logic
├── routes/              # API endpoints
├── utils/               # Utilities (security, notifications)
├── main.py              # Flask application entry point
├── Dockerfile           # Container configuration
├── deploy.sh            # Deployment script
└── init_firestore.py    # Database initialization
```

## API Endpoints

### Authentication
- `POST /api/auth/send-verification` - Send verification link
- `POST /api/auth/verify-token` - Verify token

### KBA
- `POST /api/kba/verify` - Verify identity

### Consents
- `GET /api/consents` - Get user consents
- `POST /api/consents/toggle` - Toggle consent
- `POST /api/consents/grant-all` - Grant all consents
- `POST /api/consents/revoke-all` - Revoke all consents

### Providers
- `GET /api/providers` - List providers
- `GET /api/providers/:id` - Get provider details

### Health
- `GET /api/health` - Health check

## Environment Variables

- `GCP_PROJECT_ID` - Google Cloud project ID (default: gb-demos)
- `FLASK_ENV` - Environment (development/production)
- `USE_MOCK_EMAIL` - Use mock email service (true/false)
- `USE_MOCK_SMS` - Use mock SMS service (true/false)
- `SECRET_KEY` - Application secret key
- `PORT` - Server port (default: 8080)

## Documentation

- [Deployment Guide](DEPLOYMENT.md) - Comprehensive deployment instructions
- [Implementation Guide](IMPLEMENTATION_GUIDE.md) - Development notes

## Testing

```bash
# Test health endpoint
curl http://localhost:8080/api/health

# Test with deployed service
curl https://your-service-url.run.app/api/health
```

## Troubleshooting

### Build fails with "Dockerfile not found"

Make sure you're in the `backend` directory when running `deploy.sh`:
```bash
cd backend
./deploy.sh
```

### Firestore connection issues

Ensure you're authenticated:
```bash
gcloud auth application-default login
gcloud config set project gb-demos
```

### View logs

```bash
gcloud run services logs read consent-backend --region us-central1
```

## Architecture

- **Framework:** Flask 3.0
- **Database:** Google Cloud Firestore
- **Authentication:** Google Cloud Identity Platform
- **Deployment:** Google Cloud Run
- **Container:** Docker with Python 3.13

## Security

- PHI/PII data is hashed with bcrypt
- Rate limiting on KBA attempts
- Comprehensive audit logging
- HIPAA-compliant infrastructure (Cloud Run + Firestore)

## License

Google LLC 2025