---
sidebar_position: 2
description: GitHub Actions workflow basics and examples
---

# Workflow Basics

## Workflow Structure

```yaml
# Workflow name (displayed in Actions tab)
name: Build and Test

# Event triggers
on:
  push:
    branches: [main, develop]
    paths:
      - 'src/**'
      - 'package.json'
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC

# Environment variables accessible to all jobs
env:
  REGISTRY: ghcr.io
  NODE_VERSION: '18'

# Workflow jobs
jobs:
  # Job ID
  build:
    # Display name
    name: Build and Test
    
    # Runner environment
    runs-on: ubuntu-latest
    
    # Set timeout in minutes
    timeout-minutes: 30
    
    # Job-level environment variables
    env:
      DEBUG: true
    
    # Permissions for this job
    permissions:
      contents: read
      packages: write
    
    # Run job on specific condition
    if: github.event_name == 'push' || !github.event.pull_request.draft
    
    # Steps in job
    steps:
      # Use existing action
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for versioning
      
      # Run shell command
      - run: echo "Hello, World!"
      
      # Run multi-line command
      - name: Build Application
        run: |
          npm ci
          npm run build
          npm test
```

## Event Triggers

### Push Events

```yaml
on:
  push:
    branches:
      - main
      - 'develop/**'  # Wildcard
    tags:
      - 'v*'         # Version tags
    paths:
      - 'src/**'
      - 'package.json'
    paths-ignore:
      - 'docs/**'
      - '*.md'
```

### Pull Request Events

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [main]
    paths: ['src/**']
```

### Schedule Events

```yaml
on:
  schedule:
    # Run at 2 AM UTC daily
    - cron: '0 2 * * *'
    # Run at 9 AM UTC on weekdays
    - cron: '0 9 * * 1-5'
    # Run every 6 hours
    - cron: '0 */6 * * *'
```

### Manual Trigger

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: Deployment environment
        required: true
        default: staging
        type: choice
        options:
          - staging
          - production
      version:
        description: Version to deploy
        required: true
        type: string

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ${{ github.event.inputs.environment }}
        run: |
          echo "Deploying version ${{ github.event.inputs.version }}"
```

## Contexts and Variables

### GitHub Context

```yaml
steps:
  - name: Print GitHub Context
    run: |
      echo "Repository: ${{ github.repository }}"
      echo "Branch: ${{ github.ref }}"
      echo "Commit: ${{ github.sha }}"
      echo "Actor: ${{ github.actor }}"
      echo "Event: ${{ github.event_name }}"
      echo "Workspace: ${{ github.workspace }}"
```

### Runner Context

```yaml
steps:
  - name: Print Runner Info
    run: |
      echo "OS: ${{ runner.os }}"
      echo "Architecture: ${{ runner.arch }}"
      echo "Temp directory: ${{ runner.temp }}"
```

### Job Context

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.VERSION }}
    steps:
      - id: version
        run: echo "VERSION=1.0.0" >> $GITHUB_OUTPUT
  
  deploy:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying ${{ needs.setup.outputs.version }}"
```

### Strategy Context

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]

steps:
  - run: echo "Testing with Node ${{ matrix.node-version }}"
```

## Common Patterns

### Skip Workflow

```yaml
steps:
  - uses: actions/checkout@v4
  
  - name: Check for [skip ci]
    id: check
    run: |
      if grep -q "\[skip ci\]" <<< "${{ github.event.head_commit.message }}"; then
        echo "skip=true" >> $GITHUB_OUTPUT
      fi
  
  - name: Build
    if: steps.check.outputs.skip != 'true'
    run: npm run build
```

### Conditional Steps

```yaml
steps:
  - uses: actions/checkout@v4
  
  # Run only on main branch
  - name: Deploy to Production
    if: github.ref == 'refs/heads/main'
    run: ./deploy-prod.sh
  
  # Run on pull requests
  - name: Post PR Comment
    if: github.event_name == 'pull_request'
    uses: actions/github-script@v7
    with:
      script: |
        github.rest.issues.createComment({
          issue_number: context.issue.number,
          owner: context.repo.owner,
          repo: context.repo.repo,
          body: 'Build completed successfully!'
        })
```

### Error Handling

```yaml
steps:
  - name: Build
    continue-on-error: true
    run: npm run build
  
  - name: Report Results
    if: failure()
    run: echo "Build failed, continuing..."
  
  - name: Cleanup
    if: always()  # Run whether previous step succeeded or failed
    run: npm run cleanup
```

### Set Environment Variables

```yaml
steps:
  - name: Set variables
    run: |
      echo "APP_VERSION=$(cat version.txt)" >> $GITHUB_ENV
      echo "BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> $GITHUB_ENV
  
  - name: Use variables
    run: |
      echo "Version: $APP_VERSION"
      echo "Built: $BUILD_DATE"
```

## Workflow Visualization

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image_tag: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
  
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm test
  
  deploy:
    needs: [build, test]
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying version"
```

Job execution order:
1. `build` runs first
2. `test` waits for `build` to complete
3. `deploy` waits for both `build` and `test`

## Debugging Workflows

### Enable Debug Logging

Set secrets in repository:
- `ACTIONS_STEP_DEBUG: true` - Step debug logs
- `ACTIONS_RUNNER_DEBUG: true` - Runner debug logs

Then view in workflow logs:

```bash
# Example debug output:
##[debug] GITHUB_WORKSPACE=/home/runner/work/repo/repo
##[debug] RUNNER_WORKSPACE=/home/runner/work
```

### Workflow Syntax Check

```bash
# Validate workflow YAML
yamllint .github/workflows/*.yml
```

## Best Practices

1. **Cache dependencies**: Use caching for faster builds
2. **Use matrix for parallel testing**: Test multiple configurations
3. **Environment secrets**: Use per-environment secrets
4. **Fail fast**: Use `fail-fast: true` in matrix
5. **Security scanning**: Add security checks to pipeline
6. **Artifact retention**: Don't keep unnecessary artifacts
7. **Documentation**: Comment non-obvious workflow steps
8. **Testing**: Test workflows locally with act

## Next Steps

- [Advanced Workflows](../github-actions/matrix-builds.md)
- [Reusable Workflows](./reusable-workflows.md)
- [Security Best Practices](./secrets-management.md)
