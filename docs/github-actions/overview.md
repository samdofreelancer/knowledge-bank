---
sidebar_position: 1
description: GitHub Actions fundamentals and workflow basics
---

# GitHub Actions Overview

GitHub Actions is a continuous integration and continuous delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipeline.

## Key Concepts

### Workflows

Automated processes defined in YAML files:

```yaml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test
```

### Events

Triggers that start workflows:
- `push`: Commit pushed to repository
- `pull_request`: Pull request created or updated
- `schedule`: Cron-based triggers
- `workflow_dispatch`: Manual trigger
- `release`: Release published

### Jobs

Sets of steps that run in parallel or sequence:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]
  test:
    needs: build  # Runs after build
    steps: [...]
```

### Steps

Individual tasks within a job:

```yaml
steps:
  - uses: actions/checkout@v4      # Use action
  - run: npm install               # Run command
  - name: Build                    # Named step
    run: npm run build
```

## Actions Types

### 1. Docker Actions

Runs code in a container:

```yaml
- uses: owner/repo@v1.0.0
  with:
    input-param: value
```

### 2. JavaScript Actions

Runs Node.js code directly:

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v3
  with:
    node-version: 18
```

### 3. Composite Actions

Combines multiple steps into reusable action:

```yaml
name: My Composite Action
inputs:
  name:
    description: Name input
runs:
  using: composite
  steps:
    - run: echo ${{ inputs.name }}
      shell: bash
```

## Common Workflows

### Node.js CI/CD

```yaml
name: Node.js CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: npm
    
    - run: npm ci
    - run: npm run build
    - run: npm test
    - run: npm run lint
```

### Docker Build and Push

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      packages: write
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and Push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ghcr.io/${{ github.repository }}:latest
        cache-from: type=registry,ref=ghcr.io/${{ github.repository }}:buildcache
        cache-to: type=registry,ref=ghcr.io/${{ github.repository }}:buildcache,mode=max
```

## Using Secrets

### Define Secrets

In GitHub repository settings → Secrets and variables → Actions

### Use in Workflow

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy
      env:
        DB_PASSWORD: ${{ secrets.DATABASE_PASSWORD }}
        API_KEY: ${{ secrets.API_KEY }}
      run: |
        ./deploy.sh
```

### Environment Secrets

```yaml
jobs:
  deploy:
    environment: production
    runs-on: ubuntu-latest
    steps:
    - name: Deploy
      env:
        DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
      run: ./deploy.sh
```

## Conditionals

### If Condition

```yaml
steps:
  - name: Only on main branch
    if: github.ref == 'refs/heads/main'
    run: npm run deploy
  
  - name: Only on PR
    if: github.event_name == 'pull_request'
    run: npm run test
  
  - name: On failure
    if: failure()
    run: echo "Build failed"
  
  - name: On success
    if: success()
    run: echo "Build succeeded"
```

## Matrix Strategy

### Test Multiple Configurations

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [16, 18, 20]
    include:
      - os: ubuntu-latest
        node-version: 18
        experimental: true
    exclude:
      - os: macos-latest
        node-version: 16

steps:
  - uses: actions/setup-node@v3
    with:
      node-version: ${{ matrix.node-version }}
```

## Outputs and Artifacts

### Create Outputs

```yaml
steps:
  - name: Build
    id: build
    run: echo "VERSION=$(cat version.txt)" >> $GITHUB_OUTPUT
  
  - name: Use Output
    run: echo "Built version ${{ steps.build.outputs.VERSION }}"
```

### Upload Artifacts

```yaml
- name: Build
  run: npm run build

- name: Upload artifacts
  uses: actions/upload-artifact@v3
  with:
    name: dist
    path: dist/
    retention-days: 5
```

### Download Artifacts

```yaml
- name: Download artifacts
  uses: actions/download-artifact@v3
  with:
    name: dist
    path: ./dist

- name: Deploy
  run: ./deploy.sh
```

## Best Practices

1. **Use starter workflows**: GitHub provides templates
2. **Cache dependencies**: Speed up builds with caching
3. **Use pinned versions**: Pin action versions for reproducibility
4. **Parallel jobs**: Use `needs` strategically
5. **Security**: Never commit secrets, use GitHub secrets
6. **Documentation**: Document custom actions
7. **Status checks**: Protect branches with required checks
8. **Cost optimization**: Use only needed runners

## Common Actions

- `actions/checkout`: Clone repository
- `actions/setup-node`: Set up Node.js
- `actions/setup-python`: Set up Python
- `actions/upload-artifact`: Upload build artifacts
- `actions/deploy-pages`: Deploy to GitHub Pages
- `docker/login-action`: Log in to Docker registry
- `docker/build-push-action`: Build and push Docker images

## Next Steps

- [Workflow Basics](./workflow-basics.md)
- [Self-Hosted Runners](./self-hosted-runner.md)
- [Reusable Workflows](./reusable-workflows.md)
