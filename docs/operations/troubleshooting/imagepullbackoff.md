---
sidebar_position: 3
description: ImagePullBackOff troubleshooting and resolution
---

# ImagePullBackOff

## What is ImagePullBackOff?

Pod cannot pull container image from registry. Usually temporary, Kubernetes will retry with exponential backoff.

## Status Meanings

- `ImagePullBackOff`: Pulling, but failed. Will retry.
- `ErrImagePull`: Error pulling image (temporary)
- `ErrImageNeverPull`: Image pull policy set to Never

## Diagnosis

### Check Pod Events

```bash
# View detailed error
kubectl describe pod <pod-name> -n <namespace>

# Look for:
# - Image: <registry>/<image>:<tag>
# - Pull Error: <error message>
# - Last Probe Result: Failed

# Example errors:
# - "manifest not found"
# - "unauthorized: authentication required"
# - "i/o timeout"
# - "connection refused"
```

### Check Image Registry

```bash
# Verify image exists in registry
docker pull myregistry.azurecr.io/myapp:latest

# List available images
az acr repository list --name myregistry

# Check image tags
az acr repository show-tags --name myregistry --repository myapp

# Inspect image
docker inspect myregistry.azurecr.io/myapp:latest
```

### Check Kubernetes ImagePullSecret

```bash
# List secrets
kubectl get secrets -n <namespace>

# Check if secret exists
kubectl get secret <secret-name> -n <namespace>

# View secret details
kubectl describe secret <secret-name> -n <namespace>

# Check pod spec
kubectl get pod <pod-name> -o yaml | grep -A 5 imagePullSecrets
```

## Common Causes & Solutions

### 1. Wrong Image Name

**Symptom**: `repository not found` or `image not found`

```bash
# Check image name in deployment
kubectl get deployment <deployment> -o yaml | grep image:
# Output might show: image: "myapp:latest"
# But should be: image: "myregistry.azurecr.io/myapp:latest"
```

**Fix**:

```bash
# Update image reference
kubectl set image deployment/<deployment> \
  <container>=myregistry.azurecr.io/myapp:v1.0.0

# Or edit deployment
kubectl edit deployment <deployment>

# Update spec.template.spec.containers[0].image
# image: myregistry.azurecr.io/myapp:v1.0.0
```

### 2. Wrong Tag

**Symptom**: `manifest not found`

```bash
# Check image tag in deployment
kubectl get pod <pod-name> -o yaml | grep image:

# List available tags
az acr repository show-tags --name myregistry --repository myapp

# Example output:
# v1.0.0
# v1.1.0
# v2.0.0
# latest
```

**Fix**:

```bash
# Use correct tag
kubectl set image deployment/<deployment> \
  <container>=myregistry.azurecr.io/myapp:v1.0.0

# Or build and push correct tag
docker build -t myregistry.azurecr.io/myapp:v1.0.0 .
docker push myregistry.azurecr.io/myapp:v1.0.0
```

### 3. Authentication Failed

**Symptom**: `unauthorized: authentication required`

```bash
# Check if imagePullSecret exists
kubectl get secrets -n <namespace> | grep -i registry

# If missing, create it
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.azurecr.io \
  --docker-username=<username> \
  --docker-password=<password> \
  -n <namespace>

# Add to deployment
kubectl patch serviceaccount default -n <namespace> \
  -p '{"imagePullSecrets": [{"name": "regcred"}]}'
```

**For Azure Container Registry**:

```bash
# Get credentials
az acr credential show --name myregistry

# Create secret with credentials
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.azurecr.io \
  --docker-username=<username> \
  --docker-password=<password> \
  -n <namespace>
```

**For AWS ECR**:

```bash
# Create secret using service account role
# Or use static credentials

# For static credentials:
aws ecr get-authorization-token --region us-east-1

# Create secret
kubectl create secret docker-registry aws-ecr \
  --docker-server=<account>.dkr.ecr.us-east-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password=<token> \
  -n <namespace>
```

### 4. Network Issues

**Symptom**: `i/o timeout` or `connection refused`

```bash
# Test network connectivity
kubectl run -it --rm debug --image=alpine --restart=Never -- \
  apk add curl && curl myregistry.azurecr.io/v2/

# Check DNS resolution
kubectl run -it --rm debug --image=alpine --restart=Never -- \
  nslookup myregistry.azurecr.io

# Check firewall
# Ensure nodes can reach registry IP/domain
```

**Fix**:

```bash
# Update networking
# - Allow outbound HTTPS (port 443)
# - Verify DNS is configured
# - Check firewall rules
# - Verify registry is accessible

# Test from node
kubectl debug node/<node-name> -it --image=ubuntu

# Inside debug pod:
curl https://myregistry.azurecr.io/v2/
```

### 5. Private Network Registry

**Symptom**: `connection refused` or `timeout`

```bash
# Access private registry in VPC
# Option 1: Use service endpoint
# Option 2: Use private link
# Option 3: Use VPN connection

# Configure network policy
kubectl apply -f - << 'EOF'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-registry
spec:
  podSelector: {}
  policyTypes:
  - Egress
  egress:
  - to:
    - ipBlock:
        cidr: 10.0.0.0/8
    ports:
    - protocol: TCP
      port: 443
EOF
```

### 6. Registry Credential Expired

**Symptom**: `unauthorized` after some time

```bash
# Check secret age
kubectl get secret regcred -o yaml | grep creationTimestamp

# Update secret with new credentials
kubectl delete secret regcred -n <namespace>

# Create with new credentials
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.azurecr.io \
  --docker-username=<new-username> \
  --docker-password=<new-password> \
  -n <namespace>

# Restart pods to pick up new secret
kubectl rollout restart deployment/<deployment> -n <namespace>
```

## Verification

```bash
# Verify pod can pull image
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[0].imageID}'

# Check if running
kubectl get pod <pod-name>
# Should show READY 1/1 and status Running

# Check logs
kubectl logs <pod-name>

# No ImagePullBackOff error should be present
```

## Prevention

### Pre-Deployment Checklist

- [ ] Image pushed to registry
- [ ] Tag is correct
- [ ] Registry credentials configured
- [ ] imagePullSecret added to pod spec
- [ ] Network allows registry access
- [ ] Credentials not expired

### In Deployment YAML

```yaml
spec:
  containers:
  - name: myapp
    image: myregistry.azurecr.io/myapp:v1.0.0
    imagePullPolicy: IfNotPresent  # Or Always
  imagePullSecrets:
  - name: regcred
```

### Test Before Deploying

```bash
# Pull image locally to verify
docker pull myregistry.azurecr.io/myapp:v1.0.0

# Run locally
docker run -it myregistry.azurecr.io/myapp:v1.0.0

# Push to multiple registries for redundancy
docker tag myapp:latest myregistry.azurecr.io/myapp:latest
docker tag myapp:latest ghcr.io/my-org/myapp:latest
docker push myregistry.azurecr.io/myapp:latest
docker push ghcr.io/my-org/myapp:latest
```

## Related Issues

- [Pod CrashLoopBackOff](./pod-crashloopbackoff.md)
- [Registry Authentication](../../ci-cd/cd/registry-setup.md)
- [Network Connectivity](../kubernetes/networking.md)

---

**Last Updated**: 2024-01-15  
**Category**: Container Issues  
**Severity**: Blocks deployment
