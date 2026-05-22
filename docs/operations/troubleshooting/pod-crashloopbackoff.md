---
sidebar_position: 3
description: Pod CrashLoopBackOff troubleshooting guide
---

# Pod CrashLoopBackOff

## What is CrashLoopBackOff?

Pod continuously crashes and Kubernetes tries to restart it. The back-off delay increases with each restart.

## Diagnosis

### Step 1: Get Pod Status

```bash
# Show pod status
kubectl get pod <pod-name> -n <namespace>

# Output example:
# NAME      READY   STATUS            RESTARTS   AGE
# myapp     0/1     CrashLoopBackOff  5          2m
```

### Step 2: Check Events

```bash
# View detailed information
kubectl describe pod <pod-name> -n <namespace>

# Look for: LastState, Reason, ExitCode, Message
```

### Step 3: Review Logs

```bash
# Get current logs (if any)
kubectl logs <pod-name> -n <namespace>

# Get previous container logs (before crash)
kubectl logs <pod-name> --previous -n <namespace>

# Follow logs in real-time
kubectl logs -f <pod-name> -n <namespace>
```

### Step 4: Check Configuration

```bash
# Review deployment spec
kubectl get deployment <deployment> -o yaml

# Check for obvious issues:
# - Wrong image name
# - Missing environment variables
# - Incorrect command/args
# - Invalid health checks
```

## Common Causes & Solutions

### 1. Application Startup Error

**Symptoms**: Logs show application error

```bash
kubectl logs <pod-name> --previous
# ERROR: Database connection failed
# ERROR: Missing required file
# ERROR: Port already in use
```

**Solutions**:

```bash
# Fix code issue
# Deploy new version
kubectl set image deployment/<deployment> \
  <container>=<image>:v1.0.1

# Or check environment
kubectl get configmap -n <namespace>
kubectl get secrets -n <namespace>
```

### 2. Missing Environment Variables

**Symptoms**:

```bash
# Logs show:
# ValueError: REQUIRED_VAR not set
# KeyError: DATABASE_URL
```

**Fix**:

```bash
# Check if ConfigMap exists
kubectl get configmap -n <namespace>

# Check if Secret exists
kubectl get secrets -n <namespace>

# View ConfigMap content
kubectl get configmap <name> -o yaml

# Create missing ConfigMap
kubectl create configmap app-config \
  --from-literal=DATABASE_URL=postgres://...
```

### 3. Image Pull Failures

**Symptoms**:

```bash
kubectl describe pod <pod-name>
# Message: Failed to pull image "myregistry/app:typo"
# Reason: ImagePullBackOff
```

**Fix**:

```bash
# Verify image name
kubectl get pod <pod-name> -o yaml | grep image:

# Check image exists in registry
docker pull myregistry.azurecr.io/myapp:latest

# Fix image reference
kubectl set image deployment/<deployment> \
  <container>=myregistry.azurecr.io/myapp:correct-tag

# Ensure image pull secret exists
kubectl get secrets -n <namespace> | grep docker

# If needed, create secret
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.azurecr.io \
  --docker-username=<username> \
  --docker-password=<password>
```

### 4. Insufficient Resources

**Symptoms**:

```bash
# Logs show:
# MemoryError: Unable to allocate memory
# OSError: Cannot create file (disk full)
# Process killed, Exit Code: 137 (OOMKilled)
```

**Fix**:

```bash
# Check resource limits
kubectl get pod <pod-name> -o yaml | grep -A 4 resources

# Check node resources
kubectl describe node <node-name>

# Increase memory limit
kubectl set resources deployment/<deployment> \
  --limits=memory=1Gi

# Or edit deployment
kubectl edit deployment <deployment>
# Increase: memory: 1Gi
```

### 5. Health Check Failures

**Symptoms**:

```bash
kubectl describe pod <pod-name>
# Last State: Terminated
#   Reason: Startup probe failed
# Exit Code: 1
```

**Fix**:

```bash
# Check probe configuration
kubectl get pod <pod-name> -o yaml | grep -A 10 startupProbe

# Test endpoint manually
kubectl exec <pod-name> -- curl localhost:8080/health

# Verify endpoint exists
kubectl exec <pod-name> -- bash -c 'echo GET /health | nc localhost 8080'

# Fix probe configuration or application endpoint
kubectl patch deployment <deployment> --type='json' -p='[
  {
    "op": "replace",
    "path": "/spec/template/spec/containers/0/startupProbe/failureThreshold",
    "value": 30
  }
]'
```

### 6. Port Already in Use

**Symptoms**:

```bash
kubectl logs <pod-name> --previous
# ERROR: Port 8080 already in use
# EADDRINUSE: address already in use
```

**Fix**:

```bash
# Check which pod is using port
kubectl get pods -n <namespace> --all-namespaces

# Kill pod using the port
kubectl delete pod <conflicting-pod> -n <namespace>

# Verify port is available
kubectl exec <pod-name> -- netstat -tlnp | grep 8080

# Change port if needed
kubectl set env deployment/<deployment> PORT=8081
```

## Debugging with Shell

```bash
# Run shell in failing pod
kubectl run -it --rm debug --image=<base-image> --restart=Never -- bash

# Install debugging tools
apt-get update
apt-get install -y curl wget netcat

# Test connectivity
curl -v http://database:5432
ping external-service

# Check file system
ls -la /app
cat /etc/config/app.conf

# Test application manually
python app.py
node index.js
java -jar app.jar
```

## Prevention

### Pre-Deployment Checks

```bash
# Test locally
docker build -t myapp:test .
docker run -it --rm -e ENV_VAR=value myapp:test

# Test in staging
kubectl apply -f deployment-staging.yaml
kubectl rollout status deployment/app -n staging
kubectl logs deployment/app -n staging

# Load test
ab -n 1000 -c 10 http://staging.example.com/
```

### Health Checks

```yaml
# Always include probes
startupProbe:
  httpGet:
    path: /startup
    port: 8080
  failureThreshold: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5

livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
```

## Monitoring

```bash
# Watch pod status
kubectl get pods -n <namespace> -w

# Monitor restarts
kubectl get pods -n <namespace> -o custom-columns=\
NAME:.metadata.name,\
RESTARTS:.status.containerStatuses[0].restartCount

# Alert on restarts
# (Configure in monitoring tool)
increase(kube_pod_container_status_restarts_total[15m]) > 5
```

## Related Issues

- [ImagePullBackOff](./imagepullbackoff.md)
- [OOMKilled](./oomkilled.md)
- [Pod Pending](../kubernetes/troubleshooting.md)

---

**Last Updated**: 2024-01-15  
**Category**: Container Issues  
**Severity**: Blocks deployment
