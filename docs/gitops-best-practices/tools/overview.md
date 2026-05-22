---
sidebar_position: 2
---

# GitOps Tools

Popular tools and platforms for implementing GitOps practices.

## GitOps Controllers

### ArgoCD
- **What**: Declarative GitOps continuous delivery tool for Kubernetes
- **Use Case**: Deploy applications to Kubernetes from Git repositories
- **Features**: Multi-tenancy, rollbacks, webhook integration, web UI

### Flux
- **What**: Open source GitOps toolkit for Kubernetes
- **Use Case**: Continuous delivery of container images and apps
- **Features**: Multi-tenancy, image automation, Helm integration

### Helm
- **What**: Package manager for Kubernetes
- **Use Case**: Template and manage complex Kubernetes applications
- **Features**: Charts, hooks, subcharts, values management

## Infrastructure as Code Tools

### Terraform
- **What**: Infrastructure as Code provisioning tool
- **Use Case**: Manage cloud infrastructure declaratively
- **Features**: Multi-cloud, state management, modules

### Pulumi
- **What**: Infrastructure as Code using programming languages
- **Use Case**: Define infrastructure using Python, Go, TypeScript, etc.
- **Features**: Multiple languages, SDK, state management

### CloudFormation
- **What**: AWS native IaC service
- **Use Case**: Manage AWS resources
- **Features**: AWS integration, drift detection, templates

## Git Platforms

### GitHub
- **What**: Git repository hosting platform
- **Use Case**: Version control and collaboration
- **Features**: Actions, Pages, security features

### GitLab
- **What**: Complete DevOps platform with built-in CI/CD
- **Use Case**: Git hosting and advanced CI/CD
- **Features**: Integrated CI/CD, runners, security scanning

### Gitea
- **What**: Lightweight self-hosted Git service
- **Use Case**: Self-managed Git repositories
- **Features**: Self-hosted, lightweight, simple

## Selecting Tools

When choosing GitOps tools, consider:
- **Environment**: Kubernetes, cloud platform, on-premises
- **Scale**: Single cluster vs multi-cluster
- **Team Size**: Solo vs large teams
- **Compliance**: Security and audit requirements
- **Integration**: Existing tools and workflows

See [Implementation Guide](./implementation-guide.md) for setup recommendations.
