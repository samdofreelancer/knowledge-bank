---
sidebar_position: 4
description: Kubernetes Services for networking and load balancing
---

# Kubernetes Services

## Overview

Services provide a stable endpoint for accessing Pods. They abstract the underlying Pod IP addresses and provide load balancing.

## Service Types

### 1. ClusterIP (Default)

Accessible only within the cluster:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: web-app
  ports:
  - name: http
    port: 80
    targetPort: 8080
    protocol: TCP
```

**Use Cases**: Internal microservices communication

### 2. NodePort

Exposes service on a port on each node:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app
spec:
  type: NodePort
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080
```

**Use Cases**: Testing, external access without load balancer

### 3. LoadBalancer

Creates external load balancer (cloud provider):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app
spec:
  type: LoadBalancer
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
  # Cloud provider specific
  loadBalancerIP: "203.0.113.1"
  loadBalancerSourceRanges:
  - "192.168.1.0/24"
```

**Use Cases**: Production external access

### 4. ExternalName

Maps to external DNS name:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: db.example.com
  ports:
  - port: 5432
```

**Use Cases**: Access external services as if they were internal

## Service Discovery

### DNS Names

```bash
# Format: <service-name>.<namespace>.svc.cluster.local
web-app.production.svc.cluster.local

# Within same namespace
web-app.svc.cluster.local

# Short form (same namespace)
web-app
```

### Environment Variables

Kubernetes injects service info as environment variables:

```bash
WEB_APP_SERVICE_HOST=10.0.0.1
WEB_APP_SERVICE_PORT=80
```

## Endpoints

Services use Endpoints to track Pod IPs:

```bash
# View endpoints
kubectl get endpoints

# Check service-to-pod mapping
kubectl describe service web-app
```

## Headless Services

No ClusterIP for direct Pod access:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
spec:
  clusterIP: None
  selector:
    app: mysql
  ports:
  - port: 3306
```

**Use Cases**: StatefulSets, pod-to-pod discovery

## Session Affinity

Sticky sessions:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app
spec:
  type: ClusterIP
  selector:
    app: web-app
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
  ports:
  - port: 80
    targetPort: 8080
```

## Service Mesh Integration

For advanced routing:

```bash
# Istio VirtualService example
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: web-app
spec:
  hosts:
  - web-app
  http:
  - match:
    - uri:
        prefix: /api
    route:
    - destination:
        host: web-app
        subset: v2
      weight: 20
    - destination:
        host: web-app
        subset: v1
      weight: 80
```

## Common Commands

```bash
# Create service
kubectl expose deployment web-app --type=LoadBalancer --port=80

# View services
kubectl get services -n production

# Get service details
kubectl describe service web-app

# Check endpoints
kubectl get endpoints web-app

# Port forward for testing
kubectl port-forward service/web-app 8080:80
```

## Best Practices

1. **Use stable names**: Service names shouldn't change
2. **Proper selectors**: Match deployment labels correctly
3. **Health checks**: Configure proper readiness probes
4. **Session affinity**: Use sparingly, stateless is better
5. **Resource labels**: Organize services with labels

## Troubleshooting

### Service has no endpoints?

```bash
# Check selector matches pod labels
kubectl get pods --show-labels

# Verify service selector
kubectl get service web-app -o yaml | grep -A 3 selector

# Check pod readiness
kubectl get pods
```

### Can't reach service?

```bash
# Test DNS
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup web-app

# Check network policies
kubectl get networkpolicies

# Test connectivity
kubectl run -it --rm debug --image=nginx --restart=Never -- bash
# Then: curl web-app:80
```

## Next Steps

- [Configure Ingress](./ingress.md)
- [Network Policies](./networking.md)
- [Set up service mesh](./networking.md)
