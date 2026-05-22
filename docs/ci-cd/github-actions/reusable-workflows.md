---
sidebar_position: 6
description: Reusable workflows in GitHub Actions for reducing duplication
---

# Reusable Workflows

Reusable workflows let you avoid copying and pasting workflow code. Instead, you create a workflow that can be used by other workflows.

## Creating a Reusable Workflow

### Basic Structure

```yaml
# .github/workflows/build-and-test.yml
name: Reusable Build and Test

on:
  workflow_call:
    inputs:
      node-version:
        description: Node version to use
        required: false
        default: '18'
        type: string
      run-tests:
        description: Whether to run tests
        required: false
        default: true
        type: boolean
    secrets:
      NPM_TOKEN:
        description: NPM authentication token
        required: false
    outputs:
      version:
        description: Application version
        value: ${{ jobs.build.outputs.version }}
      artifact-id:
        description: Build artifact ID
        value: ${{ jobs.build.outputs.artifact-id }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.VERSION }}
      artifact-id: ${{ steps.build.outputs.ARTIFACT_ID }}
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ inputs.node-version }}
          cache: npm
          registry-url: https://npm.pkg.github.com
      
      - name: Install dependencies
        run: npm ci
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Build
        id: build
        run: |
          npm run build
          echo "ARTIFACT_ID=$(date +%s)" >> $GITHUB_OUTPUT
      
      - name: Get version
        id: version
        run: echo "VERSION=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT
      
      - name: Run tests
        if: ${{ inputs.run-tests }}
        run: npm test
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: build-${{ steps.build.outputs.ARTIFACT_ID }}
          path: dist/
```

## Using a Reusable Workflow

### From Same Repository

```yaml
name: CI

on: [push, pull_request]

jobs:
  build-and-test:
    uses: ./.github/workflows/build-and-test.yml
    with:
      node-version: '20'
      run-tests: true
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### From Another Repository

```yaml
name: CI

on: [push, pull_request]

jobs:
  build-and-test:
    uses: your-org/shared-workflows/.github/workflows/build-and-test.yml@v1
    with:
      node-version: '20'
      run-tests: true
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Reusable Deploy Workflow

```yaml
# .github/workflows/deploy.yml
name: Reusable Deploy

on:
  workflow_call:
    inputs:
      environment:
        description: Deployment environment
        required: true
        type: string
      version:
        description: Version to deploy
        required: true
        type: string
      docker-image:
        description: Docker image to deploy
        required: true
        type: string
    secrets:
      DEPLOY_KEY:
        description: Deployment SSH key
        required: true
      KUBECONFIG:
        description: Kubernetes config
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        env:
          KUBECONFIG_B64: ${{ secrets.KUBECONFIG }}
        run: |
          echo "$KUBECONFIG_B64" | base64 -d > $HOME/.kube/config
          chmod 600 $HOME/.kube/config
      
      - name: Deploy to ${{ inputs.environment }}
        run: |
          kubectl set image deployment/app \
            app=${{ inputs.docker-image }}:${{ inputs.version }} \
            -n ${{ inputs.environment }}
      
      - name: Verify rollout
        run: |
          kubectl rollout status deployment/app \
            -n ${{ inputs.environment }} \
            --timeout=5m
      
      - name: Run smoke tests
        run: ./scripts/smoke-tests.sh ${{ inputs.environment }}
      
      - name: Slack notification
        if: always()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "Deployment to ${{ inputs.environment }} ${{ job.status }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Result*\nEnvironment: ${{ inputs.environment }}\nVersion: ${{ inputs.version }}\nStatus: ${{ job.status }}"
                  }
                }
              ]
            }
```

## Calling With Matrix

```yaml
name: Multi-environment Deploy

on:
  push:
    tags: ['v*']

jobs:
  deploy-all:
    strategy:
      matrix:
        environment: [staging, production]
    uses: ./.github/workflows/deploy.yml
    with:
      environment: ${{ matrix.environment }}
      version: ${{ github.ref_name }}
      docker-image: ghcr.io/my-org/my-app
    secrets:
      DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
      KUBECONFIG: ${{ secrets.KUBECONFIG }}
```

## Chaining Workflows

```yaml
name: Complete CI/CD Pipeline

on:
  push:
    branches: [main]

jobs:
  # Step 1: Build
  build:
    uses: ./.github/workflows/build-and-test.yml
    with:
      node-version: '20'
      run-tests: true
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
  
  # Step 2: Build Docker image
  docker:
    needs: build
    uses: ./.github/workflows/build-docker.yml
    with:
      version: ${{ needs.build.outputs.version }}
    secrets:
      REGISTRY_TOKEN: ${{ secrets.REGISTRY_TOKEN }}
  
  # Step 3: Deploy to staging
  deploy-staging:
    needs: [build, docker]
    uses: ./.github/workflows/deploy.yml
    with:
      environment: staging
      version: ${{ needs.build.outputs.version }}
      docker-image: ${{ needs.docker.outputs.image }}
    secrets:
      DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
      KUBECONFIG: ${{ secrets.KUBECONFIG }}
  
  # Step 4: Deploy to production
  deploy-prod:
    needs: [build, docker, deploy-staging]
    uses: ./.github/workflows/deploy.yml
    with:
      environment: production
      version: ${{ needs.build.outputs.version }}
      docker-image: ${{ needs.docker.outputs.image }}
    secrets:
      DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
      KUBECONFIG: ${{ secrets.KUBECONFIG }}
```

## Passing Secrets

### Inherit All Secrets

```yaml
jobs:
  reusable:
    uses: ./.github/workflows/shared.yml
    secrets: inherit
```

### Pass Specific Secrets

```yaml
jobs:
  reusable:
    uses: ./.github/workflows/shared.yml
    secrets:
      API_KEY: ${{ secrets.API_KEY }}
      DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

### In Reusable Workflow

```yaml
on:
  workflow_call:
    secrets:
      API_KEY:
        required: true
      DB_PASSWORD:
        required: false

jobs:
  do-something:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Using API: ${{ secrets.API_KEY }}"
```

## Best Practices

1. **Version your workflows**: Use tags or branches
2. **Document inputs**: Clear descriptions for all inputs
3. **Validate inputs**: Check required parameters
4. **Error handling**: Provide helpful error messages
5. **Reusability**: Design for broad use cases
6. **Security**: Minimize secret exposure
7. **Testing**: Test workflows in pull requests
8. **Examples**: Provide clear usage examples

## Limitations

- Cannot call a reusable workflow from another reusable workflow
- Cannot use `env` context in `with` inputs
- Limited nesting depth
- Variables not passed between workflows

## Debugging

### Check Workflow Runs

```bash
# View all runs
gh run list --repo your-org/repo

# View specific run details
gh run view <run-id>

# Download logs
gh run download <run-id>
```

### Log Output

```yaml
steps:
  - name: Debug
    run: echo "Input version: ${{ inputs.version }}"
```

## Next Steps

- [Security Best Practices](./secrets-management.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CI/CD Pipeline Design](../cicd/pipeline-design.md)
