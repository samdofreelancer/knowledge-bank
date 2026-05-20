---
sidebar_position: 2
description: Deployment and rollback procedures for production systems
---

# Rollback Procedures

## When to Rollback

- Critical bug introduced in new version
- Performance degradation
- Data corruption
- Security vulnerability discovered
- Unexpected behavioral changes

## Pre-Rollback Checklist

- [ ] Incident severity assessed
- [ ] Root cause identified
- [ ] Rollback approved by team lead
- [ ] Backup of current state taken
- [ ] Rollback procedure validated
- [ ] Stakeholders notified

## Kubernetes Rollback

### Check Rollout History

```bash
# View rollout history
kubectl rollout history deployment/app -n production

# Output:
# REVISION  CHANGE-CAUSE
# 1         kubectl apply --filename=deployment.yaml
# 2         kubectl set image deployment/app app=myapp:v1.1.0
# 3         kubectl set image deployment/app app=myapp:v1.2.0 (current)

# Get revision details
kubectl rollout history deployment/app --revision=2
```

### Rollback to Previous Version

```bash
# Rollback to previous revision
kubectl rollout undo deployment/app -n production

# Verify rollback
kubectl rollout status deployment/app -n production

# Check pods
kubectl get pods -n production -l app=app
```

### Rollback to Specific Revision

```bash
# Rollback to specific version
kubectl rollout undo deployment/app --to-revision=2 -n production

# Watch progress
kubectl rollout status deployment/app -n production --watch
```

### Verify Rollback Success

```bash
# Check pod status
kubectl get pods -n production -o wide

# Check logs
kubectl logs deployment/app -n production --tail=50

# Test endpoint
curl https://api.example.com/health

# Check metrics
kubectl top pods -n production

# Verify data integrity
# Connect to database and verify
```

## Helm Rollback

```bash
# View release history
helm history myapp -n production

# OUTPUT:
# REVISION  UPDATED             STATUS      CHART
# 1         2024-01-10 10:00    superseded  myapp-1.0.0
# 2         2024-01-12 14:30    deployed    myapp-1.1.0

# Rollback to previous release
helm rollback myapp -n production

# Rollback to specific revision
helm rollback myapp 1 -n production

# Verify rollback
helm status myapp -n production
```

## Docker/Container Rollback

### Rollback with Docker Swarm

```bash
# View service history
docker service ps myapp

# Rollback service
docker service rollback myapp

# Check status
docker service ps myapp
```

### Rollback with Container Registry

```bash
# Tag previous good version
docker tag myregistry.azurecr.io/myapp:stable myregistry.azurecr.io/myapp:v1.0.0

# Update deployment to use previous tag
kubectl set image deployment/app app=myregistry.azurecr.io/myapp:v1.0.0

# Verify
kubectl rollout status deployment/app
```

## Database Rollback

### Backup Before Changes

```bash
# Backup database before deployment
pg_dump mydb > backup_before_deploy_$(date +%s).sql

# Backup to S3
aws s3 cp backup_*.sql s3://backups/

# Verify backup
pg_restore -l backup_*.sql
```

### Rollback Data

```bash
# Stop application
kubectl scale deployment/app --replicas=0

# Restore from backup
psql mydb < backup_2024_01_15.sql

# Verify data
psql mydb -c "SELECT COUNT(*) FROM users;"

# Restart application
kubectl scale deployment/app --replicas=3
```

## Configuration Rollback

### ConfigMap Rollback

```bash
# View ConfigMap changes
kubectl get configmap app-config -o yaml

# Save current config
kubectl get configmap app-config -o yaml > current_config.yaml

# Restore from backup
kubectl apply -f previous_config.yaml

# Verify
kubectl get configmap app-config -o yaml
```

### Secret Rollback

```bash
# Update secret
kubectl create secret generic app-secret \
  --from-literal=password=old-password \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart pods to pick up new secret
kubectl rollout restart deployment/app -n production
```

## Approval Workflow

### Before Rollback

1. **Assessment**
   ```
   - What's broken?
   - How critical?
   - Impact of rollback?
   ```

2. **Approval**
   ```
   - Team lead approval
   - Run-book review
   - Risk assessment
   ```

3. **Communication**
   ```
   - Notify stakeholders
   - Update status page
   - Post in Slack
   ```

### During Rollback

```bash
# Execute rollback
kubectl rollout undo deployment/app -n production

# Monitor progress
watch kubectl rollout status deployment/app

# Update status
# "Rolling back to previous version..."
```

### After Rollback

```bash
# Verify success
curl https://api.example.com/health

# Check error logs
kubectl logs deployment/app -n production | tail -50

# Monitor metrics
# Watch error rate, latency, CPU

# Notify stakeholders
# "Rollback complete, system restored"
```

## Prevention

### Staged Rollouts

```bash
# Stage 1: Canary (5% traffic)
# Stage 2: Beta (25% traffic)
# Stage 3: Full (100% traffic)

# Automatic rollback if errors detected
# threshold: error_rate > 1%
```

### Automated Testing

```bash
# Pre-deployment tests
- unit tests
- integration tests
- smoke tests
- load tests

# Post-deployment validation
- health check
- error rate check
- latency check
```

### Monitoring & Alerts

```bash
# Alert on anomalies
- Error rate > 1%
- P99 latency > 500ms
- CPU > 80%
- Memory > 90%
- Pod restart > 3

# Automatic rollback
- if error_rate > 5% for 5 minutes
- if all health checks fail
- if databases not responding
```

## Post-Rollback Analysis

### Root Cause Analysis

```markdown
1. What failed?
2. When did it start?
3. Why did it fail?
4. Could we have caught it?
5. How do we prevent this?
```

### Metrics to Review

- Deployment frequency
- Failed deployments
- MTTR (Mean Time To Recovery)
- Rollback frequency
- Testing coverage

## Escalation

```
Automatic rollback triggered
  ↓ (if not resolved)
Ops team notified
  ↓ (if not resolved in 5 min)
Engineering lead notified
  ↓ (if not resolved in 15 min)
VP Engineering notified
```

## References

- [Kubernetes Rollback Docs](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment)
- [Helm Rollback](https://helm.sh/docs/helm/helm_rollback/)
- [Database Backup Best Practices](../cicd/backup-strategy.md)

---

**Last Updated**: 2024-01-15  
**Category**: Runbooks  
**Severity**: Critical procedures
