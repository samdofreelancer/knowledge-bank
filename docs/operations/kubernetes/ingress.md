---
sidebar_position: 5
description: Kubernetes Ingress for HTTP/HTTPS routing and load balancing
---

# Kubernetes Ingress

## Overview

Ingress manages external HTTP and HTTPS access to services, providing routing, SSL/TLS termination, and virtual hosts.

## Installation

### Install NGINX Ingress Controller

```bash
# Add Helm repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install NGINX ingress controller
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=3 \
  --set controller.resources.requests.cpu=100m \
  --set controller.resources.requests.memory=90Mi
```

## Basic Ingress Example

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-app-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls-cert
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-app
            port:
              number: 80
```

## Routing Patterns

### Path-Based Routing

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: api-v1
            port:
              number: 8080
      - path: /v2
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 8080
      - path: /admin
        pathType: Prefix
        backend:
          service:
            name: admin-panel
            port:
              number: 3000
```

### Virtual Host Routing

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-host-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: app1.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app1
            port:
              number: 80
  - host: app2.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app2
            port:
              number: 80
```

## SSL/TLS Configuration

### Using Let's Encrypt with cert-manager

```yaml
# Install cert-manager
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-app
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - secure.example.com
    secretName: secure-app-tls
  rules:
  - host: secure.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-app
            port:
              number: 80
```

### Manual TLS Secret

```bash
# Create TLS secret from certificate files
kubectl create secret tls app-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  -n production
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-app
            port:
              number: 80
```

## Advanced Configuration

### Rate Limiting

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: rate-limited-app
  annotations:
    nginx.ingress.kubernetes.io/limit-rps: "100"
    nginx.ingress.kubernetes.io/limit-connections: "10"
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 8080
```

### Authentication

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: auth-app
  annotations:
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: basic-auth
    nginx.ingress.kubernetes.io/auth-realm: 'Authentication Required'
spec:
  ingressClassName: nginx
  rules:
  - host: admin.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin-app
            port:
              number: 80
```

### CORS Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cors-app
  annotations:
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE"
    nginx.ingress.kubernetes.io/cors-allow-headers: "Content-Type, Authorization"
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 8080
```

## Common Commands

```bash
# Create ingress
kubectl apply -f ingress.yaml

# List ingresses
kubectl get ingress -n production

# Get ingress details
kubectl describe ingress web-app-ingress -n production

# Check ingress IP
kubectl get ingress -n production -o wide

# Edit ingress
kubectl edit ingress web-app-ingress -n production

# Delete ingress
kubectl delete ingress web-app-ingress -n production

# Check NGINX controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

## Troubleshooting

### Ingress not getting IP?

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check service status
kubectl get service -n ingress-nginx

# Check ingress status
kubectl describe ingress web-app-ingress
```

### 502 Bad Gateway?

```bash
# Check if backend service exists
kubectl get service web-app

# Verify service endpoints
kubectl get endpoints web-app

# Check pod readiness
kubectl get pods -l app=web-app

# Check NGINX logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

### SSL Certificate Not Working?

```bash
# Check cert-manager
kubectl get certificate -n production

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Check TLS secret
kubectl get secret -n production

# Verify secret content
kubectl describe secret app-tls -n production
```

## Best Practices

1. **Use TLS**: Encrypt all traffic
2. **Health checks**: Ensure backend health with readiness probes
3. **Rate limiting**: Protect against abuse
4. **Security headers**: Add HTTP security headers
5. **Monitoring**: Track ingress metrics
6. **Multiple controllers**: For high availability

## Next Steps

- [Configure Network Policies](./networking.md)
- [Set up Storage](./storage.md)
- [Production Troubleshooting](./troubleshooting.md)
