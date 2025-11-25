#!/bin/bash
# Deployment script for Colorado Consent Management Backend to Cloud Run
# Usage: ./deploy.sh

set -e  # Exit on error

# Configuration
PROJECT_ID="gb-demos"
SERVICE_NAME="consent-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying Colorado Consent Management Backend to Cloud Run"
echo "=================================================="
echo "Project: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "=================================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo "📋 Setting GCP project..."
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable firestore.googleapis.com

# Build the container
echo "🏗️  Building container image..."
cd "$(dirname "$0")"  # Ensure we're in the backend directory
gcloud builds submit --tag ${IMAGE_NAME}:latest .

# Deploy to Cloud Run
echo "🚢 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID},FLASK_ENV=production,USE_MOCK_EMAIL=true,USE_MOCK_SMS=true,FIRESTORE_DATABASE=consent-mgmt" \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --concurrency 80

# Get the service URL
echo "✅ Deployment complete!"
echo ""
echo "📍 Service URL:"
gcloud run services describe ${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --format 'value(status.url)'

echo ""
echo "🔍 Test the deployment:"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --format 'value(status.url)')
echo "curl ${SERVICE_URL}/api/health"
echo ""
echo "📊 View logs:"
echo "gcloud run services logs read ${SERVICE_NAME} --region ${REGION}"
