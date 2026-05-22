---
sidebar_position: 1
description: Google Cloud Platform services and best practices
---

# GCP Overview

Google Cloud Platform provides a comprehensive suite of cloud services for computing, storage, networking, and data analytics.

## Core Services

### Compute Services

#### Cloud Run

Serverless container execution:

```bash
# Deploy container
gcloud run deploy my-service \
  --image gcr.io/my-project/my-service:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Check status
gcloud run services describe my-service --region us-central1
```

#### Google Kubernetes Engine (GKE)

Managed Kubernetes cluster:

```bash
# Create cluster
gcloud container clusters create my-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-2

# Get credentials
gcloud container clusters get-credentials my-cluster --zone us-central1-a

# Deploy application
kubectl apply -f deployment.yaml
```

#### Compute Engine

Virtual machines on demand:

```bash
# Create VM
gcloud compute instances create my-vm \
  --zone=us-central1-a \
  --machine-type=n1-standard-1 \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud

# SSH into VM
gcloud compute ssh my-vm --zone=us-central1-a
```

### Storage Services

#### Cloud Storage

Object storage (S3-like):

```bash
# Create bucket
gsutil mb gs://my-bucket

# Upload files
gsutil cp file.txt gs://my-bucket/

# Copy between buckets
gsutil cp gs://source-bucket/* gs://dest-bucket/
```

#### Cloud SQL

Managed relational databases:

```bash
# Create PostgreSQL instance
gcloud sql instances create my-postgres \
  --database-version POSTGRES_14 \
  --tier db-f1-micro \
  --region us-central1

# Create database
gcloud sql databases create mydb --instance my-postgres

# Connect
gcloud sql connect my-postgres --user=postgres
```

#### Firestore

NoSQL document database:

```bash
# Equivalent to MongoDB
# Create collection and document via:

from google.cloud import firestore

db = firestore.Client()
db.collection('users').document('user1').set({
    'name': 'John Doe',
    'email': 'john@example.com'
})
```

### Networking

#### Cloud Load Balancing

Distribute traffic globally:

```bash
# Create load balancer
gcloud compute backend-services create my-service \
  --protocol HTTP \
  --health-checks http-basic-check \
  --global

# Add backend
gcloud compute backend-services add-backend my-service \
  --instance-group my-ig \
  --instance-group-zone us-central1-a \
  --global
```

#### Cloud VPN

Secure networking:

```bash
# Create VPN connection
gcloud compute vpn-gateways create my-vpn \
  --network my-network \
  --region us-central1
```

### Data & Analytics

#### BigQuery

Data warehouse:

```sql
-- Query data
SELECT 
  user_id,
  COUNT(*) as event_count
FROM events
WHERE DATE(event_time) = CURRENT_DATE()
GROUP BY user_id
```

#### Cloud Pub/Sub

Message queue:

```bash
# Create topic
gcloud pubsub topics create my-topic

# Create subscription
gcloud pubsub subscriptions create my-sub \
  --topic my-topic

# Publish message
gcloud pubsub topics publish my-topic --message "Hello"
```

## Best Practices

### Security

```yaml
# Enable Cloud Armor
- Type: Cloud Armor policy
  Rules:
    - Allow traffic from known IPs
    - Rate limit: 100 req/min
    - Block countries: [KP, IR]

# VPC Security
- Use VPC Service Controls
- Enable Binary Authorization
- Use Cloud KMS for encryption
```

### Cost Optimization

```bash
# Set budget alerts
gcloud billing budgets create \
  --billing-account BILLING_ID \
  --display-name "Monthly Budget" \
  --budget-amount 1000

# Use committed use discounts
# Use preemptible VMs
# Enable autoscaling
# Archive old data to Cloud Storage
```

### Monitoring

```bash
# Enable Cloud Monitoring
gcloud monitoring dashboards create --config-from-file dashboard.yaml

# Create alert policy
gcloud alpha monitoring policies create \
  --notification-channels CHANNEL_ID \
  --display-name "High Error Rate"
```

## Common Patterns

### Deployment Pattern

```yaml
# Cloud Run deployment from Cloud Build
steps:
  - name: Build
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/app:latest', '.']
  
  - name: Push
    args: ['push', 'gcr.io/$PROJECT_ID/app:latest']
  
  - name: Deploy
    args:
      - 'run'
      - 'deploy'
      - 'my-service'
      - '--image=gcr.io/$PROJECT_ID/app:latest'
      - '--region=us-central1'
```

### Multi-region Setup

```bash
# Deploy to multiple regions
for REGION in us-central1 europe-west1 asia-east1; do
  gcloud run deploy my-service \
    --image gcr.io/$PROJECT_ID/app:latest \
    --region $REGION
done

# Use Cloud Load Balancing for routing
```

## Integration with GitHub Actions

```yaml
name: Deploy to GCP

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - uses: google-github-actions/setup-gcloud@v1
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy my-service \
            --image gcr.io/${{ env.PROJECT_ID }}/app:${{ github.sha }} \
            --region us-central1
```

## Troubleshooting

```bash
# Check quota usage
gcloud compute project-info describe --project=PROJECT_ID

# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Debug Cloud Run
gcloud logging read "resource.type=cloud_function" --limit 50
```

## Next Steps

- [Cloud Run Documentation](./cloud-run.md)
- [GKE Setup Guide](./gke.md)
- [Security Best Practices](./security.md)
