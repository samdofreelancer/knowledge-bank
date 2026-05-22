---
sidebar_position: 2
description: Kubernetes Deployment strategies and best practices
---

# Kubernetes Deployments

## Overview

A Deployment provides declarative updates for Pods and ReplicaSets. It manages the desired state of your application and automatically handles rolling out changes.

## Basic Deployment

### Example: Deploy a Web Application

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production
  labels:
    app: web-app
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
        version: v1
    spec:
      # Pod specification
      containers:
      - name: web-app
        image: myregistry.azurecr.io/web-app:1.2.0
        imagePullPolicy: IfNotPresent
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
        
        # Resource management
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        
        # Health checks
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
        
        # Environment configuration
        env:
        - name: LOG_LEVEL
          value: "info"
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: db.host
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        
        # Volume mounts
        volumeMounts:
        - name: config
          mountPath: /etc/app/config
          readOnly: true
        
        # Security context
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1000
      
      # Pod-level security context
      securityContext:
        fsGroup: 1000
      
      # Volume definitions
      volumes:
      - name: config
        configMap:
          name: app-config
      
      # Node affinity
      affinity:
        nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            preference:
              matchExpressions:
              - key: workload-type
                operator: In
                values:
                - general
      
      # Pod disruption budget reference
      terminationGracePeriodSeconds: 30
```

## Deployment Strategies

### 1. Rolling Update (Default)

Updates Pods gradually to minimize downtime.

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Max new Pods above desired count
      maxUnavailable: 0  # Max unavailable Pods
```

**Pros**: Zero downtime, simple
**Cons**: Temporary resource overhead

### 2. Blue-Green Deployment

Deploy new version alongside old version, then switch traffic.

```bash
# Deploy green version
kubectl apply -f deployment-v2.yaml

# Verify green version is healthy
kubectl rollout status deployment/web-app-green

# Switch service to green
kubectl patch service web-app -p '{"spec":{"selector":{"version":"v2"}}}'

# Keep blue version for quick rollback
```

### 3. Canary Deployment

Gradually shift traffic to new version.

```yaml
# Use multiple services or service mesh (Istio/Flagger)
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: web-app
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  progressDeadlineSeconds: 60
  service:
    port: 80
  analysis:
    interval: 1m
    threshold: 5
    metrics:
    - name: request-success-rate
      thresholdRange:
        min: 99
    - name: request-duration
      thresholdRange:
        max: 500
  skipAnalysis: false
  maxWeight: 50
  stepWeight: 5
```

## Common Operations

### Check Deployment Status

```bash
# View deployment details
kubectl describe deployment web-app

# Get deployment status
kubectl rollout status deployment/web-app

# Watch deployment progress
kubectl rollout status deployment/web-app --watch
```

### Update Application

```bash
# Update image
kubectl set image deployment/web-app web-app=myregistry.azurecr.io/web-app:1.3.0

# Update and record for history
kubectl set image deployment/web-app web-app=myregistry.azurecr.io/web-app:1.3.0 --record

# Check rollout history
kubectl rollout history deployment/web-app
```

### Rollback Changes

```bash
# Rollback to previous version
kubectl rollout undo deployment/web-app

# Rollback to specific revision
kubectl rollout undo deployment/web-app --to-revision=2
```

### Scale Deployment

```bash
# Scale to specific number of replicas
kubectl scale deployment web-app --replicas=5

# Auto-scale based on metrics
kubectl autoscale deployment web-app --min=2 --max=10 --cpu-percent=80
```

## Health Checks

### Liveness Probe

Restarts container if unhealthy:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Readiness Probe

Removes pod from service if not ready:

```yaml
readinessProbe:
  exec:
    command:
    - /bin/sh
    - -c
    - redis-cli ping | grep PONG
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Startup Probe

Gives container time to start:

```yaml
startupProbe:
  httpGet:
    path: /startup
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 10
  failureThreshold: 30  # 30 * 10 = 300 seconds max startup time
```

## Resource Management

### Request vs Limit

```yaml
resources:
  requests:
    memory: "256Mi"    # Minimum required
    cpu: "250m"        # 0.25 CPU cores
  limits:
    memory: "512Mi"    # Maximum allowed
    cpu: "500m"        # Maximum CPU
```

:::warning Best Practice
Always set both requests and limits:
- **Requests**: Scheduler uses to find suitable nodes
- **Limits**: Enforced at runtime to prevent resource starvation
:::

## Best Practices

1. **Use specific image tags**: Never use `latest` in production
2. **Implement health checks**: Always use liveness and readiness probes
3. **Set resource limits**: Prevent resource exhaustion
4. **Use multiple replicas**: Ensure high availability
5. **Implement graceful shutdown**: Handle SIGTERM properly
6. **Use pod disruption budgets**: Protect from voluntary disruptions
7. **Configure affinity rules**: Control pod placement
8. **Use namespaces**: Isolate deployments

## Troubleshooting

### Pods not starting?

```bash
# Check pod status
kubectl describe pod <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name>
```

### High memory usage?

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -A

# Review limits in deployment
kubectl get deployment web-app -o yaml | grep -A 4 limits
```

## Next Steps

- [Manage Stateful Applications](./statefulsets.md)
- [Configure Services](./services.md)
- [Set up Ingress](./ingress.md)
