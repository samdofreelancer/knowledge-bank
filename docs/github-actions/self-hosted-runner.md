---
sidebar_position: 5
description: GitHub Actions self-hosted runners setup and management
---

# Self-Hosted Runners

Self-hosted runners give you the ability to run GitHub Actions workflows on your own hardware or cloud infrastructure.

## When to Use Self-Hosted Runners

- Need more computing power than GitHub-hosted runners provide
- Require specific hardware (GPU, high memory)
- Need access to internal resources
- Require specialized software/tools
- Cost optimization for heavy workloads

## Installation

### Linux

```bash
# Create directory
mkdir -p ~/actions-runner
cd ~/actions-runner

# Download runner
curl -o actions-runner-linux-x64-2.310.2.tar.gz \
  -L https://github.com/actions/runner/releases/download/v2.310.2/actions-runner-linux-x64-2.310.2.tar.gz

# Extract
tar xzf actions-runner-linux-x64-2.310.2.tar.gz

# Configure
./config.sh --url https://github.com/your-org/repo --token YOUR_TOKEN

# Install as service
sudo ./svc.sh install

# Start service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status
```

### Docker

```dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    git \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/runner

RUN curl -o actions-runner-linux-x64.tar.gz \
    -L https://github.com/actions/runner/releases/download/v2.310.2/actions-runner-linux-x64-2.310.2.tar.gz && \
    tar xzf actions-runner-linux-x64.tar.gz && \
    rm actions-runner-linux-x64.tar.gz

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
```

```bash
#!/bin/bash
./config.sh --url $GITHUB_URL --token $GITHUB_TOKEN --unattended --replace
exec ./run.sh
```

```bash
# Run Docker runner
docker run -d \
  -e GITHUB_URL=https://github.com/your-org \
  -e GITHUB_TOKEN=<token> \
  -v /var/run/docker.sock:/var/run/docker.sock \
  my-runner:latest
```

### Kubernetes

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: actions-runner

---
apiVersion: v1
kind: Secret
metadata:
  name: runner-secret
  namespace: actions-runner
type: Opaque
stringData:
  GITHUB_TOKEN: your-token-here
  GITHUB_URL: https://github.com/your-org

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: actions-runner
  namespace: actions-runner
spec:
  replicas: 3
  selector:
    matchLabels:
      app: actions-runner
  template:
    metadata:
      labels:
        app: actions-runner
    spec:
      containers:
      - name: runner
        image: my-runner:latest
        envFrom:
        - secretRef:
            name: runner-secret
        resources:
          requests:
            memory: "2Gi"
            cpu: "2"
          limits:
            memory: "4Gi"
            cpu: "4"
        volumeMounts:
        - name: docker
          mountPath: /var/run/docker.sock
      volumes:
      - name: docker
        hostPath:
          path: /var/run/docker.sock
```

## Runner Labels

### Add Labels to Runner

```bash
# Interactive configuration
./config.sh --url https://github.com/your-org/repo \
  --token YOUR_TOKEN \
  --labels ubuntu-latest,high-memory,docker
```

### Use Runner with Labels

```yaml
jobs:
  build:
    runs-on: [self-hosted, ubuntu-latest, docker]
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
```

## Runner Groups

Organize runners by project or purpose:

```bash
# In repository settings: Actions → Runners → New group
# Then assign runners to groups
```

Use in workflow:

```yaml
jobs:
  build:
    runs-on: [self-hosted, group-name]
    steps:
      - run: echo "Running on custom group"
```

## Security

### Runner Tokens

```bash
# Tokens expire after 1 hour
# For long-running setups, use registration tokens

# Get registration token from GitHub API
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/orgs/YOUR_ORG/actions/runners/registration-token
```

### Network Security

```bash
# Restrict runner to internal network only
# Use private subnets
# Don't expose runner to internet

# Firewall rules for runner
# Only allow outbound HTTPS to github.com
# Allow inbound on specific ports if needed
```

### Permissions

```bash
# Run as non-root user
sudo useradd actions-runner
sudo su - actions-runner

# Minimal sudo access if needed
# Add to sudoers for specific commands only
```

## Troubleshooting

### Runner Not Connecting

```bash
# Check logs
sudo journalctl -u actions.runner.* -n 100 -f

# Check configuration
cat /home/actions-runner/.runner

# Test connectivity
curl https://github.com

# Reconfigure
./config.sh --url https://github.com/your-org/repo --token NEW_TOKEN
```

### High Memory Usage

```bash
# Monitor runner
ps aux | grep run.sh

# Check job logs
# Reduce concurrent jobs
# Increase memory allocation
```

### Slow Performance

```bash
# Check system resources
free -h
df -h
top

# Monitor disk I/O
iostat -x 1

# Check network
iperf3 -c github.com
```

## Maintenance

### Update Runner

```bash
# Download new version
cd ~/actions-runner
curl -o actions-runner-linux-x64.tar.gz \
  -L https://github.com/actions/runner/releases/download/v2.310.2/actions-runner-linux-x64-2.310.2.tar.gz

# Extract (new files overwrite old)
tar xzf actions-runner-linux-x64.tar.gz

# Restart
sudo systemctl restart actions.runner.*
```

### Monitor Runner Health

```bash
# Check last activity
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/orgs/YOUR_ORG/actions/runners

# Monitor online status
watch -n 5 'gh api orgs/YOUR_ORG/actions/runners'
```

## Scaling Runners

### Auto-scaling with Kubernetes

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: runner-autoscaler
  namespace: actions-runner
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: actions-runner
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Cost Optimization

```bash
# Use spot instances for self-hosted runners
# Enables automatic shutdown after jobs
# Scale down during off-hours

# Example with AWS:
# Use EC2 spot instances
# Configure lifecycle management
# Auto-terminate after 8 hours idle
```

## Best Practices

1. **Use labels**: Organize runners logically
2. **Monitor resource usage**: Prevent runner overload
3. **Keep software updated**: Regular security updates
4. **Secure tokens**: Rotate registration tokens
5. **Network isolation**: Keep runners on private networks
6. **Logging**: Enable comprehensive logging
7. **Health checks**: Monitor runner connectivity
8. **Backup configuration**: Document runner setup

## Next Steps

- [Reusable Workflows](./reusable-workflows.md)
- [GitHub Actions Security](./secrets-management.md)
- [CI/CD Best Practices](../cicd/overview.md)
