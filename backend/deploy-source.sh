#!/bin/bash
# Simple source-based deployment for Colorado Consent Management Backend
# This deploys directly from source code without building a container

set -e

# Configuration
PROJECT_ID="gb-demos"
SERVICE_NAME="consent-backend"
REGION="us-central1"

echo "🚀 Deploying Colorado Consent Management Backend (Source Deployment)"
echo "=================================================="
echo "Project: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "=================================================="

# Set the project
echo "📋 Setting GCP project..."
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable firestore.googleapis.com

# Deploy from source
echo "🚢 Deploying from source..."
cd "$(dirname "$0")"

gcloud run deploy ${SERVICE_NAME} \
  --source . \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID},FLASK_ENV=production,USE_MOCK_EMAIL=true,USE_MOCK_SMS=true,FIRESTORE_DATABASE=consent-mgmt" \
  --set-secrets "SECRET_KEY=flask-secret-key:latest" \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300

# Get the service URL
echo ""
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
