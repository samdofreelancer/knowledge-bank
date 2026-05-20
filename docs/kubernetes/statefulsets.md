---
sidebar_position: 3
description: Managing stateful applications in Kubernetes with StatefulSets
---

# StatefulSets

StatefulSets manage stateful applications that require stable, unique network identities and persistent storage.

## When to Use StatefulSets

- **Databases**: PostgreSQL, MySQL, MongoDB
- **Message Queues**: RabbitMQ, Kafka
- **Distributed Systems**: Elasticsearch, Cassandra
- **Applications requiring stable hostnames**

## Example: PostgreSQL StatefulSet

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: databases
spec:
  clusterIP: None  # Headless service for StatefulSet
  selector:
    app: postgres
  ports:
  - port: 5432
    name: postgres
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: databases
spec:
  serviceName: postgres
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
          name: postgres
        
        env:
        - name: POSTGRES_DB
          value: appdb
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        
        livenessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U postgres
          initialDelaySeconds: 30
          periodSeconds: 10
        
        readinessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U postgres
          initialDelaySeconds: 5
          periodSeconds: 5
  
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 50Gi
```

## Key Features

### Stable Network Identities

```bash
# Pods get stable DNS names:
postgres-0.postgres.databases.svc.cluster.local
postgres-1.postgres.databases.svc.cluster.local
postgres-2.postgres.databases.svc.cluster.local
```

### Ordered Pod Management

- Pods are created and deleted in order
- Pod `postgres-1` waits for `postgres-0` to be ready

### Persistent Storage

Each pod gets its own PersistentVolume from volumeClaimTemplates

## Common Operations

### Check StatefulSet Status

```bash
# View status
kubectl get statefulset postgres -n databases

# Watch rollout progress
kubectl rollout status statefulset/postgres -n databases

# Check individual pods
kubectl get pods -n databases -l app=postgres
```

### Scale StatefulSet

```bash
# Scale to 5 replicas
kubectl scale statefulset postgres --replicas=5 -n databases

# Check status
kubectl get pvc -n databases
```

### Update StatefulSet

```bash
# Update image
kubectl set image statefulset/postgres postgres=postgres:16-alpine -n databases

# Monitor update (one pod at a time)
kubectl rollout status statefulset/postgres -n databases
```

### Delete StatefulSet

```bash
# Delete StatefulSet (keeps Pods)
kubectl delete statefulset postgres -n databases

# Delete StatefulSet and Pods
kubectl delete statefulset postgres --cascade=foreground -n databases

# Note: PersistentVolumes are NOT automatically deleted
```

## Data Persistence

### Check Persistent Volumes

```bash
# View PersistentVolumeClaims
kubectl get pvc -n databases

# View PersistentVolumes
kubectl get pv
```

### Backup Considerations

```bash
# Manually backup before major changes
kubectl exec -it postgres-0 -n databases -- pg_dump -U postgres appdb > backup.sql

# Create snapshot of PV before upgrades
# (Cloud provider specific, e.g., Azure snapshots)
```

## Headless Services

StatefulSets require a headless service (ClusterIP: None):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  clusterIP: None  # This makes it headless
  selector:
    app: postgres
  ports:
  - port: 5432
```

**Benefits**:
- Each pod accessible by stable DNS name
- No load balancing across pods
- Allows clients to connect to specific replicas

## Best Practices

1. **Use headless services**: Required for stable DNS
2. **Plan storage carefully**: Storage decisions affect scalability
3. **Monitor pod order**: Ensure proper startup order
4. **Test failure scenarios**: Verify recovery behavior
5. **Plan backup strategy**: StatefulSet data is persistent
6. **Use init containers**: Prepare pod before running application
7. **Document initialization**: Special setup requirements

## Troubleshooting

### Pod Stuck in Pending?

```bash
# Check PVC status
kubectl describe pvc <pvc-name> -n databases

# Check storage class
kubectl get storageclass

# Verify PersistentVolume availability
kubectl get pv
```

### Pod Not Ready?

```bash
# Check pod logs
kubectl logs postgres-0 -n databases

# Check events
kubectl describe pod postgres-0 -n databases

# Check readiness probe
kubectl get pod postgres-0 -n databases -o yaml | grep -A 10 readinessProbe
```

## Next Steps

- [Configure Services](./services.md)
- [Set up Persistent Storage](./storage.md)
- [Implement Networking Policies](./networking.md)
