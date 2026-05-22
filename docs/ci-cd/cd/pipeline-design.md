---
sidebar_position: 2
description: CI/CD pipeline design principles and best practices
---

# Pipeline Design

## Pipeline Architecture

### Single Pipeline Pattern

```
Code → Build → Unit Tests → Integration Tests → Deploy Staging → Deploy Production
```

### Multi-Stage Pipeline

```
Code
  ↓
Build & Unit Test (2 minutes)
  ↓
Integration Tests (5 minutes)
  ↓
Deploy Staging (3 minutes)
  ↓
Smoke Tests (2 minutes)
  ↓
Approval Gate
  ↓
Deploy Production (5 minutes)
```

## Pipeline Stages

### 1. Build

Compile code and create artifacts:

```yaml
build:
  image: node:18-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 day
```

### 2. Unit Tests

Fast, focused tests:

```yaml
unit-tests:
  needs: [build]
  script:
    - npm ci
    - npm test -- --coverage
  artifacts:
    paths:
      - coverage/
      - test-results.xml
  coverage: '/Lines\s*:\s*(\d+)%/'
```

### 3. Integration Tests

Database and service integration:

```yaml
integration-tests:
  needs: [build]
  services:
    - postgres:14
    - redis:7
  script:
    - npm run test:integration
```

### 4. Security Scanning

Find vulnerabilities:

```yaml
security-scan:
  needs: [build]
  script:
    - npm audit
    - snyk test
    - trivy scan .
  allow_failure: true
```

### 5. Deploy Staging

Deploy to staging environment:

```yaml
deploy-staging:
  needs: [build, unit-tests, integration-tests]
  environment: staging
  script:
    - npm run deploy:staging
  only:
    - develop
```

### 6. Smoke Tests

Verify deployment succeeded:

```yaml
smoke-tests:
  needs: [deploy-staging]
  script:
    - ./scripts/smoke-tests.sh staging
  allow_failure: false
```

### 7. Approval Gate

Manual approval for production:

```yaml
approve-production:
  stage: approval
  script:
    - echo "Approval required"
  when: manual
  only:
    - main
```

### 8. Deploy Production

Production deployment:

```yaml
deploy-production:
  needs: [approve-production]
  environment: production
  script:
    - npm run deploy:production
  only:
    - main
```

## Best Practices

### Parallelization

Run independent jobs in parallel:

```yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script: npm run build

unit-tests:
  stage: test
  needs: [build]
  script: npm test

integration-tests:
  stage: test
  needs: [build]
  script: npm run test:integration

security:
  stage: test
  needs: [build]
  script: npm audit
```

### Caching

Speed up builds:

```yaml
cache:
  key: $CI_COMMIT_REF_SLUG
  paths:
    - node_modules/
    - .npm/

build:
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
```

### Artifacts

Preserve build outputs:

```yaml
artifacts:
  paths:
    - dist/
    - coverage/
  expire_in: 30 days
  reports:
    junit: test-results.xml
    coverage_report:
      coverage_format: cobertura
      path: coverage/cobertura-coverage.xml
```

### Timeouts

Prevent hanging jobs:

```yaml
build:
  timeout: 10m
  script:
    - npm run build
```

### Retry

Handle flaky tests:

```yaml
tests:
  retry:
    max: 2
    when:
      - api_failure
      - runner_system_failure
  script:
    - npm test
```

## Deployment Patterns

### Rolling Deployment

```yaml
deploy:
  script:
    - kubectl set image deployment/app app=myapp:$CI_COMMIT_SHA
    - kubectl rollout status deployment/app --timeout=5m
```

### Blue-Green Deployment

```yaml
deploy:
  before_script:
    - kubectl apply -f deployment-green.yaml
    - kubectl rollout status deployment/app-green --timeout=5m
  script:
    - kubectl patch service app -p '{"spec":{"selector":{"version":"green"}}}'
    - kubectl delete deployment app-blue
  after_script:
    - kubectl label deployment app-green version=blue --overwrite
```

### Canary Deployment

```yaml
deploy-canary:
  script:
    - helm upgrade --install app ./chart --set canary.enabled=true --set canary.weight=10

deploy-full:
  when: manual
  script:
    - helm upgrade app ./chart --set canary.enabled=false
```

## Environment Management

```yaml
variables:
  REGISTRY: myregistry.azurecr.io
  IMAGE_NAME: $REGISTRY/myapp

build:
  variables:
    BUILD_ENV: development
  script:
    - docker build -t $IMAGE_NAME:$CI_COMMIT_SHA .

deploy_staging:
  variables:
    DEPLOY_ENV: staging
    REPLICAS: 2
  environment:
    name: staging
    url: https://staging.example.com

deploy_prod:
  variables:
    DEPLOY_ENV: production
    REPLICAS: 5
  environment:
    name: production
    url: https://example.com
```

## Monitoring Pipeline

```bash
# Pipeline duration tracking
# Build time trends
# Test coverage trends
# Deployment frequency
# Lead time
# MTTR

# Dashboards in monitoring tools:
# - Build time per commit
# - Failure rate by stage
# - Flaky test identification
# - Deployment frequency
```

## Optimization Tips

1. **Parallelize**: Run independent jobs together
2. **Cache**: Cache dependencies
3. **Artifacts**: Reuse build outputs
4. **Shallow clone**: `git clone --depth=1`
5. **Container layers**: Optimize Dockerfile
6. **Test selection**: Run only affected tests
7. **Feature flags**: Test features without full deployment

## Troubleshooting

### Pipeline Too Slow

```bash
# Analyze timing
# - Which stage takes longest?
# - Can jobs run in parallel?
# - Are dependencies necessary?

# Optimize:
- Add caching
- Parallelize jobs
- Split long tests
- Use matrix builds for sharding
```

### Flaky Tests

```bash
# Identify flaky tests
# Run tests multiple times
# Isolate dependencies
# Add retries for true flakiness
# Fix underlying issues
```

### Deployment Failures

```bash
# Check logs
# Verify credentials
# Test locally
# Add more validation
# Implement better error handling
```

## Next Steps

- [Release Strategies](./release-strategy.md)
- [Testing Best Practices](./testing.md)
- [CI/CD Security](./security.md)
