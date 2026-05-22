---
sidebar_position: 1
description: Jenkins CI/CD server overview and migration guide
---

# Jenkins Overview

Jenkins is an open-source automation server commonly used for building, testing, and deploying software.

## When to Migrate from Jenkins

- Jenkins maintenance is becoming a burden
- Scalability challenges with agent management
- Outdated plugin ecosystem
- Security patching overhead
- Infrastructure management complexity

## Jenkins vs GitHub Actions

| Feature | Jenkins | GitHub Actions |
|---------|---------|----------------|
| **Hosting** | Self-hosted | Cloud or self-hosted |
| **Learning Curve** | Steep | Gentle |
| **Setup Time** | Hours/Days | Minutes |
| **Maintenance** | High | Low |
| **Cost** | Infrastructure costs | Per-minute billing |
| **Integration** | Plugins | Native GitHub |
| **Scaling** | Complex | Automatic |

## Migration Path

```
Phase 1: Evaluate
  ↓
Phase 2: Design
  ↓
Phase 3: Pilot (1-2 jobs)
  ↓
Phase 4: Parallel Run (old + new)
  ↓
Phase 5: Cutover
  ↓
Phase 6: Decommission
```

## Key Concepts Mapping

### Declarative Pipeline (Jenkins)

```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './deploy.sh'
            }
        }
    }
    
    post {
        always {
            junit 'test-results.xml'
        }
    }
}
```

### GitHub Actions Equivalent

```yaml
name: Build and Deploy

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run build
      - run: npm test
      - uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results.xml
      
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: ./deploy.sh
```

## Common Patterns

### Parameterized Builds

**Jenkins**:
```groovy
properties([
    parameters([
        string(name: 'VERSION', defaultValue: '1.0.0'),
        choice(name: 'ENV', choices: ['dev', 'staging', 'prod'])
    ])
])

stage('Deploy') {
    sh "./deploy.sh -v ${VERSION} -e ${ENV}"
}
```

**GitHub Actions**:
```yaml
on:
  workflow_dispatch:
    inputs:
      version:
        default: '1.0.0'
      environment:
        type: choice
        options: [dev, staging, prod]

jobs:
  deploy:
    steps:
      - run: ./deploy.sh -v ${{ github.event.inputs.version }} -e ${{ github.event.inputs.environment }}
```

### Credentials Management

**Jenkins** (via Jenkins UI):
```groovy
withCredentials([
    string(credentialsId: 'api-key', variable: 'API_KEY')
]) {
    sh 'curl -H "Authorization: $API_KEY" https://api.example.com'
}
```

**GitHub Actions** (via Settings):
```yaml
jobs:
  deploy:
    steps:
      - run: curl -H "Authorization: ${{ secrets.API_KEY }}" https://api.example.com
```

### Notifications

**Jenkins**:
```groovy
post {
    failure {
        mail to: 'team@example.com',
             subject: "Build Failed: ${env.JOB_NAME}",
             body: "Build ${env.BUILD_NUMBER} failed"
    }
}
```

**GitHub Actions**:
```yaml
- name: Notify on Failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

## Best Practices for Migration

1. **Start Small**: Migrate one job at a time
2. **Test Thoroughly**: Parallel run old and new
3. **Document Changes**: Record all differences
4. **Use Reusable Workflows**: Eliminate duplication
5. **Monitor Closely**: Track success rates
6. **Team Training**: Prepare team for new platform
7. **Keep Fallback**: Keep Jenkins available initially

## Tools for Migration

```bash
# Convert Jenkins to GitHub Actions
# GitHub's migration assistant: github.com/actions/jenkins-migrator

# Manual conversion tools:
npm install -g jenkins-to-github-actions

# Export Jenkins configuration
java -jar jenkins-cli.jar -s https://jenkins.example.com \
  get-job "MyJob" > job-config.xml
```

## Next Steps

- [Groovy to YAML Conversion](./groovy-to-yaml.md)
- [Plugin Equivalents](./plugin-equivalents.md)
- [Migration Guide](./migration-guide.md)
