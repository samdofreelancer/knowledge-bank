---
sidebar_position: 2
description: Production incident response runbook and escalation procedures
---

# Production Incident Response

## Severity Classification

### SEV1 - Critical
- Complete service outage
- 50%+ of users affected
- Revenue impact
- Response time: Immediate
- On-call: All hands

### SEV2 - Major
- Significant functionality affected
- 10-50% of users affected
- Workaround available
- Response time: 15 minutes
- On-call: Team lead + specialists

### SEV3 - Minor
- Non-critical feature affected
- < 10% of users affected
- Clear workaround
- Response time: 1 hour
- On-call: Single engineer

## Incident Response Process

### Phase 1: Detection & Assessment (0-5 minutes)

```bash
# Check alert details
# Who: Who is reporting the issue?
# What: What is affected?
# When: When did it start?
# Scale: How many users?

# Acknowledge incident
echo "Incident acknowledged: $(date)"

# Classify severity
# Based on impact and scope
```

### Phase 2: Initial Investigation (5-15 minutes)

```bash
# Check service health
kubectl get pods -n production | grep -E 'Error|Crash'

# View recent logs
kubectl logs -n production -l app=critical --tail=100 --timestamps=true

# Check metrics
kubectl top pods -n production
kubectl top nodes

# Review recent deployments
kubectl rollout history deployment/app -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp' | tail -20
```

### Phase 3: Escalation (15+ minutes if not resolved)

```
Level 1: On-call engineer
   ↓ (if unresolved in 15 min)
Level 2: Team lead + specialist
   ↓ (if unresolved in 30 min)
Level 3: Manager + architecture team
   ↓ (if unresolved in 60 min)
Level 4: VP Engineering + external support
```

### Phase 4: Resolution

Implement fix:

```bash
# Option 1: Restart pod
kubectl delete pod <pod-name> -n production

# Option 2: Rollback
kubectl rollout undo deployment/app -n production

# Option 3: Scale down
kubectl scale deployment app --replicas=0 -n production

# Option 4: Update config
kubectl edit configmap app-config -n production
```

### Phase 5: Verification

```bash
# Check pod status
kubectl get pods -n production -w

# Monitor metrics
watch 'kubectl top pods -n production | grep app'

# Test endpoint
curl https://api.example.com/health
ab -n 1000 -c 10 https://api.example.com/

# Check error rate
# (Query monitoring tool)
```

### Phase 6: Communication

```
1. Update status page: https://status.example.com
2. Post to Slack: #incidents
3. Email stakeholders
4. Continue updates every 10 minutes
5. Send root cause analysis post-incident
```

## Common Incidents

### High Error Rate

```bash
# Check application errors
kubectl logs <pod> -n production | grep -i error | tail -20

# Check database connectivity
kubectl logs <pod> -n production | grep -i database

# Check external service calls
kubectl logs <pod> -n production | grep -i "connection refused"

# Solutions:
# 1. Restart pods
# 2. Scale up
# 3. Check database status
# 4. Verify API keys/credentials
```

### High Latency

```bash
# Check resource utilization
kubectl top nodes
kubectl top pods -n production

# Check network
kubectl exec <pod> -- telnet <service> <port>

# Check database slow queries
# (Connect to database and analyze)

# Solutions:
# 1. Scale up replicas
# 2. Increase resource limits
# 3. Optimize queries
# 4. Add caching layer
```

### Pod Crash Loop

```bash
# Check logs
kubectl logs <pod> -n production --previous

# Check readiness probe
kubectl get pod <pod> -o yaml | grep -A 5 readinessProbe

# Check configuration
kubectl get configmap -n production
kubectl get secrets -n production

# Solutions:
# 1. Fix application code issue
# 2. Update configuration
# 3. Increase resource limits
```

### Deployment Failure

```bash
# Check rollout status
kubectl rollout status deployment/app -n production

# Check events
kubectl describe deployment app -n production

# Check image availability
kubectl describe pod <pod> -n production | grep -A 5 "image"

# Solutions:
# 1. Fix image reference
# 2. Update image pull secrets
# 3. Rollback to previous version
```

## Escalation Contacts

```
On-call Engineer: <phone> / <slack>
Team Lead: <phone> / <slack>
Manager: <phone> / <email>
VP Engineering: <phone> / <email>
External Support: support@vendor.com
```

## Postmortem Template

After incident is resolved:

```markdown
# Incident Postmortem

## Timeline
- HH:MM: Alert triggered
- HH:MM: Investigation started
- HH:MM: Root cause identified
- HH:MM: Fix implemented
- HH:MM: Service restored

## Root Cause
Description of what actually failed.

## Impact
- Duration: HH:MM
- Users affected: Number
- Revenue impact: $XXX

## Resolution
Exactly what fixed the issue.

## Prevention
How to prevent this in the future.

## Action Items
1. [ ] Action item 1
2. [ ] Action item 2
3. [ ] Action item 3

## Lessons Learned
- Key insight 1
- Key insight 2
```

## Prevention

### Pre-Production Checks

```bash
# Test deployment
kubectl apply -f deployment.yaml --dry-run=client -o yaml

# Validate configuration
kubectl apply -f configmap.yaml --dry-run=client

# Health check endpoint
curl https://staging.example.com/health

# Load test
ab -n 10000 -c 100 https://staging.example.com/
```

### Monitoring Setup

```bash
# Alert on error rate
rate(errors[5m]) > 100

# Alert on latency
histogram_quantile(0.95, latency) > 500ms

# Alert on pod restarts
increase(restarts[5m]) > 5

# Alert on memory usage
memory_usage > 90%
```

### Runbook Testing

- Test incident response weekly
- Practice escalation procedures
- Update runbooks monthly
- Run chaos engineering tests quarterly

## Contacts & Resources

**On-Call Schedule**: [Link to schedule]
**Escalation Policy**: [Link to policy]
**Status Page**: [Link to status page]
**Documentation**: [Link to docs]
**Dashboards**: [Link to monitoring]

---

**Last Updated**: 2024-01-15  
**Reviewed by**: DevOps Team  
**Next Review**: Quarterly
