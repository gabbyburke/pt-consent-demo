# Cloud Run Deployment Guide
## Colorado Consent Management Backend

This guide covers deploying the backend to Google Cloud Run in the `gb-demos` project.

## Prerequisites

1. **Google Cloud SDK** installed and configured
   ```bash
   gcloud --version
   ```

2. **Docker** installed (for local testing)
   ```bash
   docker --version
   ```

3. **Access to gb-demos project**
   ```bash
   gcloud config set project gb-demos
   ```

4. **Required APIs enabled** (done automatically by deploy script):
   - Cloud Build API
   - Cloud Run API
   - Container Registry API
   - Firestore API

## Deployment Methods

### Method 1: Quick Deploy (Recommended)

Use the deployment script:

```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

This script will:
- ✅ Enable required APIs
- ✅ Build the container image
- ✅ Deploy to Cloud Run
- ✅ Display the service URL

### Method 2: Cloud Build (CI/CD)

For automated deployments:

```bash
cd backend
gcloud builds submit --config cloudbuild.yaml
```

### Method 3: Manual Deployment

Step-by-step manual deployment:

```bash
# 1. Build the container
cd backend
gcloud builds submit --tag gcr.io/gb-demos/consent-backend

# 2. Deploy to Cloud Run
gcloud run deploy consent-backend \
  --image gcr.io/gb-demos/consent-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GCP_PROJECT_ID=gb-demos,FLASK_ENV=production" \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1
```

## Configuration

### Environment Variables

Set via Cloud Run:

```bash
gcloud run services update consent-backend \
  --region us-central1 \
  --set-env-vars "GCP_PROJECT_ID=gb-demos,FLASK_ENV=production,USE_MOCK_EMAIL=true,USE_MOCK_SMS=true"
```

### Secrets (for sensitive data)

For production, use Secret Manager:

```bash
# Create secret
echo -n "your-secret-key" | gcloud secrets create SECRET_KEY --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding SECRET_KEY \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Update Cloud Run to use secret
gcloud run services update consent-backend \
  --region us-central1 \
  --update-secrets=SECRET_KEY=SECRET_KEY:latest
```

## Service Configuration

### Current Settings

- **Region**: us-central1
- **Memory**: 512Mi
- **CPU**: 1
- **Min Instances**: 0 (scales to zero)
- **Max Instances**: 10
- **Concurrency**: 80 requests per instance
- **Timeout**: 300 seconds
- **Authentication**: Allow unauthenticated (for prototype)

### Updating Configuration

```bash
gcloud run services update consent-backend \
  --region us-central1 \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 1
```

## Testing the Deployment

### 1. Get the Service URL

```bash
gcloud run services describe consent-backend \
  --region us-central1 \
  --format 'value(status.url)'
```

### 2. Test Health Endpoint

```bash
SERVICE_URL=$(gcloud run services describe consent-backend --region us-central1 --format 'value(status.url)')
curl $SERVICE_URL/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Colorado Consent Management Backend is running",
  "config": {
    "gcp_project": "gb-demos",
    "environment": "production",
    ...
  }
}
```

### 3. Test API Endpoints

```bash
# Test auth endpoint
curl -X POST $SERVICE_URL/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test providers endpoint
curl $SERVICE_URL/api/providers
```

## Viewing Logs

### Real-time logs

```bash
gcloud run services logs tail consent-backend --region us-central1
```

### Recent logs

```bash
gcloud run services logs read consent-backend --region us-central1 --limit 50
```

### Logs in Cloud Console

https://console.cloud.google.com/run/detail/us-central1/consent-backend/logs?project=gb-demos

## Monitoring

### Service Metrics

```bash
gcloud run services describe consent-backend --region us-central1
```

### Cloud Console Monitoring

https://console.cloud.google.com/run/detail/us-central1/consent-backend/metrics?project=gb-demos

## Firestore Setup

### Initialize Providers

Create a Python script to populate Firestore:

```python
from google.cloud import firestore
from datetime import datetime

db = firestore.Client(project='gb-demos')

providers = [
    {
        'name': 'Denver Health',
        'address': '777 Bannock St, Denver, CO 80204',
        'type': 'healthcare',
        'active': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    },
    {
        'name': 'UCHealth',
        'address': '1635 Aurora Court, Aurora, CO 80045',
        'type': 'healthcare',
        'active': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    },
    {
        'name': "Children's Hospital Colorado",
        'address': '13123 E 16th Ave, Aurora, CO 80045',
        'type': 'healthcare',
        'active': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
]

for provider in providers:
    doc_ref = db.collection('providers').document()
    provider['id'] = doc_ref.id
    doc_ref.set(provider)
    print(f"Created provider: {provider['name']}")
```

Run with:
```bash
python init_firestore.py
```

## Updating the Frontend

Update the frontend API base URL to point to Cloud Run:

```typescript
// frontend/src/services/api.client.ts
const API_BASE_URL = 'https://consent-backend-xxx.run.app';
```

## Troubleshooting

### Build Failures

```bash
# View build logs
gcloud builds list --limit 5
gcloud builds log BUILD_ID
```

### Service Not Starting

```bash
# Check service status
gcloud run services describe consent-backend --region us-central1

# View error logs
gcloud run services logs read consent-backend --region us-central1 --limit 100
```

### Permission Issues

```bash
# Grant Firestore permissions to Cloud Run service account
gcloud projects add-iam-policy-binding gb-demos \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"
```

## Rollback

### To previous version

```bash
# List revisions
gcloud run revisions list --service consent-backend --region us-central1

# Rollback to specific revision
gcloud run services update-traffic consent-backend \
  --region us-central1 \
  --to-revisions REVISION_NAME=100
```

## Cleanup

### Delete the service

```bash
gcloud run services delete consent-backend --region us-central1
```

### Delete container images

```bash
gcloud container images delete gcr.io/gb-demos/consent-backend --quiet
```

## Cost Optimization

- **Min instances**: Set to 0 for prototype (scales to zero when not in use)
- **Memory**: 512Mi is sufficient for this workload
- **CPU**: 1 CPU is adequate for prototype traffic
- **Concurrency**: 80 requests per instance maximizes efficiency

## Security Considerations

### For Production

1. **Enable authentication**:
   ```bash
   gcloud run services update consent-backend \
     --region us-central1 \
     --no-allow-unauthenticated
   ```

2. **Use Secret Manager** for sensitive environment variables

3. **Enable VPC connector** for private Firestore access

4. **Set up Cloud Armor** for DDoS protection

5. **Enable audit logging**

## Next Steps

1. ✅ Deploy backend to Cloud Run
2. ✅ Initialize Firestore with providers
3. ✅ Test all API endpoints
4. ✅ Update frontend to use Cloud Run URL
5. ✅ Test end-to-end flow
6. ✅ Monitor logs and metrics

## Support

For issues or questions:
- Check logs: `gcloud run services logs read consent-backend --region us-central1`
- View metrics in Cloud Console
- Review this documentation
