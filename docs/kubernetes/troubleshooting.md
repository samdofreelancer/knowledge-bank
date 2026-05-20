---
sidebar_position: 7
description: Kubernetes troubleshooting guide and common issue resolution
---

# Kubernetes Troubleshooting

## Diagnostic Commands

### Cluster Health

```bash
# Check cluster status
kubectl cluster-info
kubectl get nodes
kubectl describe nodes

# Check component health
kubectl get componentstatuses
kubectl get events -A --sort-by='.lastTimestamp'

# Check API server
kubectl get endpoints kubernetes

# Monitor cluster resources
kubectl top nodes
kubectl top pods -A
```

### Pod Troubleshooting

```bash
# Check pod status
kubectl get pods -A
kubectl describe pod <pod-name> -n <namespace>

# View logs
kubectl logs <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous  # Previous container

# Stream logs
kubectl logs -f <pod-name> -n <namespace>

# Multiple containers
kubectl logs <pod-name> -c <container-name> -n <namespace>

# Execute commands
kubectl exec -it <pod-name> -n <namespace> -- /bin/bash
```

## Common Issues

### Pod Stuck in Pending

**Symptoms**: Pod shows `Pending` status

**Diagnosis**:

```bash
kubectl describe pod <pod-name> -n <namespace>
```

**Common Causes & Solutions**:

1. **Insufficient resources**
   ```bash
   # Check node capacity
   kubectl describe nodes
   
   # Check resource requests
   kubectl get pod <pod-name> -o yaml | grep -A 4 requests
   
   # Reduce requests or add more nodes
   ```

2. **PVC not found**
   ```bash
   # Check PVC status
   kubectl get pvc -n <namespace>
   kubectl describe pvc <pvc-name> -n <namespace>
   ```

3. **Node selector doesn't match**
   ```bash
   # Check node labels
   kubectl get nodes --show-labels
   
   # Fix selector in deployment
   kubectl patch deployment <deployment> -p '{"spec":{"template":{"spec":{"nodeSelector":{}}}}}'
   ```

### Pod Stuck in CrashLoopBackOff

**Symptoms**: Pod restarts repeatedly

**Diagnosis**:

```bash
# Check logs
kubectl logs <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous

# Check events
kubectl describe pod <pod-name> -n <namespace>

# Check restart count
kubectl get pod <pod-name> -o wide
```

**Common Causes**:

1. **Application errors**
   ```bash
   # Review application logs for stack traces
   kubectl logs <pod-name> -n <namespace>
   ```

2. **Missing dependencies**
   ```bash
   # Check if ConfigMap/Secret exists
   kubectl get configmap,secret -n <namespace>
   ```

3. **Health check failures**
   ```bash
   # Review liveness probe in pod definition
   kubectl get pod <pod-name> -o yaml | grep -A 10 livenessProbe
   ```

### ImagePullBackOff

**Symptoms**: Pod can't pull container image

**Diagnosis**:

```bash
kubectl describe pod <pod-name> -n <namespace>
```

**Solutions**:

```bash
# Check image name
kubectl get pod <pod-name> -o yaml | grep image:

# Verify image exists in registry
docker pull myregistry.azurecr.io/myapp:latest

# Check image pull secret
kubectl get secrets -n <namespace>

# Create image pull secret if needed
kubectl create secret docker-registry acr-secret \
  --docker-server=myregistry.azurecr.io \
  --docker-username=<username> \
  --docker-password=<password> \
  -n <namespace>

# Add to pod spec:
# imagePullSecrets:
# - name: acr-secret
```

### Pod Not Ready

**Symptoms**: Pod shows `0/1` in READY column

**Diagnosis**:

```bash
kubectl get pods
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
```

**Check Readiness Probe**:

```bash
# View probe configuration
kubectl get pod <pod-name> -o yaml | grep -A 10 readinessProbe

# Test readiness endpoint manually
kubectl exec <pod-name> -n <namespace> -- curl localhost:8080/health
```

### OOMKilled

**Symptoms**: Pod exits with status 137

**Solutions**:

```bash
# Identify memory hog
kubectl top pods -A

# Check current limits
kubectl get pod <pod-name> -o yaml | grep -A 4 resources

# Increase memory limit
kubectl set resources deployment <deployment> \
  --limits=memory=1Gi,cpu=1 \
  --requests=memory=512Mi,cpu=500m

# Or edit directly
kubectl edit deployment <deployment>
```

### High CPU Usage

**Solutions**:

```bash
# Identify CPU consumer
kubectl top pods -A

# Check if pod is actually running hot
kubectl describe pod <pod-name>

# View CPU limits
kubectl get pod <pod-name> -o yaml | grep cpu

# Adjust limits if needed
kubectl set resources deployment <deployment> \
  --limits=cpu=2,memory=2Gi \
  --requests=cpu=1,memory=1Gi
```

## Network Troubleshooting

### Service Not Accessible

```bash
# Check service exists
kubectl get svc <service-name> -n <namespace>

# Verify endpoints
kubectl get endpoints <service-name> -n <namespace>

# Test DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  nslookup <service-name>.<namespace>.svc.cluster.local

# Test connectivity
kubectl run -it --rm debug --image=nginx --restart=Never -- bash
# Inside container: curl <service-name>:80
```

### Pod to Pod Communication Failing

```bash
# Check network policies
kubectl get networkpolicies -n <namespace>

# Test if traffic is blocked
kubectl describe networkpolicies -n <namespace>

# Test connection directly
kubectl exec -it <pod1> -n <namespace> -- ping <pod2>
```

### Ingress Not Working

```bash
# Check ingress resource
kubectl get ingress -n <namespace>
kubectl describe ingress <ingress-name> -n <namespace>

# Check ingress controller
kubectl get pods -n ingress-nginx

# Test DNS
dig <hostname>
# Should resolve to ingress IP

# Check NGINX logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

## Node Issues

### Node Not Ready

```bash
# Check node status
kubectl describe node <node-name>

# Check kubelet status
ssh <node>
sudo systemctl status kubelet
sudo journalctl -u kubelet -n 100

# Drain and uncordon
kubectl drain <node-name> --ignore-daemonsets
kubectl uncordon <node-name>
```

### High Disk Pressure

```bash
# Check disk usage
kubectl describe node <node-name>

# Clean up
ssh <node>
docker system prune
docker image prune
```

## Debugging Tools

### Debug Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: debug
spec:
  containers:
  - name: debug
    image: ubuntu:latest
    command: ["/bin/bash"]
    args: ["-c", "sleep 3600"]
  restartPolicy: Never
```

```bash
# Create and access
kubectl apply -f debug-pod.yaml
kubectl exec -it debug -- bash

# Useful tools to install
apt-get update && apt-get install -y curl wget dnsutils netcat tcpdump
```

### Kubectl Debug

```bash
# Debug running pod
kubectl debug <pod-name> -it --image=ubuntu

# Debug node
kubectl debug node/<node-name> -it --image=ubuntu
```

## Performance Diagnostics

```bash
# Resource usage
kubectl top nodes
kubectl top pods -A

# Resource metrics by namespace
kubectl top pods -n <namespace>

# Resource requests vs usage
kubectl get pods -o=custom-columns=NAME:.metadata.name,CPU:.spec.containers[0].resources.requests.cpu,MEM:.spec.containers[0].resources.requests.memory
```

## Best Practices

1. **Logs First**: Always check logs first
2. **Describe Objects**: Use describe for detailed information
3. **Check Events**: Events show recent issues
4. **Resource Monitoring**: Monitor before crisis
5. **Health Checks**: Properly configure probes
6. **Resource Limits**: Always set limits
7. **Network Policies**: Test connectivity early

## Emergency Procedures

### Restart Deployment

```bash
kubectl rollout restart deployment/<deployment-name> -n <namespace>
```

### Emergency Scale Down

```bash
kubectl scale deployment/<deployment-name> --replicas=0 -n <namespace>
```

### Delete Stuck Pod

```bash
# Force delete after grace period
kubectl delete pod <pod-name> -n <namespace> --grace-period=0 --force
```

## Next Steps

- [Network Policies](./networking.md)
- [Production Runbooks](../runbooks/overview.md)
- [Advanced Troubleshooting](../troubleshooting/overview.md)
