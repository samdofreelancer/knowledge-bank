# DevOps Knowledge Bank

A comprehensive, production-ready documentation platform for modern DevOps practices, built with Docusaurus and hosted on GitHub Pages.

[![Deploy to GitHub Pages](https://github.com/your-org/knowledge-bank/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-org/knowledge-bank/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-brightgreen)](https://your-org.github.io/knowledge-bank/)

## Overview

This is a comprehensive knowledge base covering:

- **Kubernetes** - Container orchestration and management
- **GCP** - Google Cloud Platform services and patterns
- **CI/CD** - Continuous integration and delivery practices
- **GitHub Actions** - Workflow automation and CI/CD
- **Jenkins** - Legacy CI/CD migration guide
- **Runbooks** - Operational procedures and incident response
- **Troubleshooting** - Diagnostic guides and solutions

## Features

✨ **Modern Documentation**
- Built with Docusaurus 3.0
- Dark mode support
- Responsive design
- Fast loading

🔍 **Great UX**
- Full-text search
- Sidebar navigation
- Breadcrumbs
- Last updated timestamps
- Blog for announcements

🚀 **Production Ready**
- GitHub Pages hosting
- Automated deployment via GitHub Actions
- Version control with Git
- Collaborative editing via pull requests

🛡️ **Secure**
- Minimal dependencies
- No external scripts
- Static site generation
- Content integrity via Git

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/knowledge-bank.git
cd knowledge-bank

# Install dependencies
npm install

# Start development server
npm start

# Open in browser: http://localhost:3000
```

### Writing Documentation

Add new markdown files to the appropriate folder:

```
docs/
  kubernetes/
    deployment.md
  github-actions/
    workflow-basics.md
```

Update sidebars.ts to include new pages:

```typescript
kubernetesNav: [
  'kubernetes/overview',
  'kubernetes/deployment',  // Add new page
]
```

### Building

```bash
# Build static site
npm run build

# Serve locally
npm run serve
```

## Project Structure

```
knowledge-bank/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD
├── docs/
│   ├── kubernetes/                 # Kubernetes documentation
│   ├── github-actions/             # GitHub Actions guides
│   ├── cicd/                       # CI/CD concepts
│   ├── gcp/                        # GCP services
│   ├── jenkins/                    # Jenkins migration
│   ├── runbooks/                   # Operational runbooks
│   └── troubleshooting/            # Troubleshooting guides
├── src/
│   ├── css/
│   │   └── custom.css              # Custom styling
│   └── components/                 # React components
├── blog/                           # Blog posts
├── docusaurus.config.ts            # Main configuration
├── sidebars.ts                     # Navigation structure
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
└── README.md                       # This file
```

## Configuration

### Update Site Metadata

Edit `docusaurus.config.ts`:

```typescript
const config: Config = {
  title: 'Your Company DevOps Knowledge Bank',
  tagline: 'Your tagline here',
  url: 'https://your-domain.com',
  baseUrl: '/knowledge-bank/',
  organizationName: 'your-org',
  projectName: 'knowledge-bank',
};
```

### Customize Navigation

Edit `sidebars.ts` to reorganize sections and pages.

### Customize Styling

Edit `src/css/custom.css` for theme customization.

## Deployment

### Automatic Deployment (Recommended)

The site automatically deploys to GitHub Pages when you push to `main`:

1. Push changes to `main` branch
2. GitHub Actions workflow starts automatically
3. Docusaurus builds the site
4. Site deploys to GitHub Pages
5. Available at `https://your-org.github.io/knowledge-bank/`

### Manual Deployment

```bash
# Build and deploy manually
npm run build
npm run deploy
```

### GitHub Pages Configuration

1. Go to repository Settings
2. Navigate to Pages
3. Set source to "GitHub Actions"
4. Set custom domain (optional)

## Content Guidelines

### Documentation Standards

All documentation should include:

- Clear description at the top
- Table of contents for long documents
- Real-world examples
- Shell commands (copy-paste ready)
- Troubleshooting sections
- Best practices
- Next steps/related topics

### Example Structure

```markdown
---
sidebar_position: 1
description: Brief description of the page
---

# Page Title

## Introduction
Context and overview.

## Core Concepts

### Concept 1
Explanation with examples.

```bash
# Code example
command here
```

## Common Patterns

Real-world usage patterns.

## Best Practices

Key recommendations.

## Troubleshooting

Common issues and solutions.

## Next Steps

Links to related pages.
```

### Markdown Features

**Callouts**:
```markdown
:::info Information
This is an information callout.
:::

:::warning Warning
This is a warning.
:::

:::danger Danger
This is critical information.
:::
```

**Code Blocks**:
```markdown
```bash
# Shell commands
kubectl get pods
```

```yaml
# YAML configuration
apiVersion: v1
kind: Pod
```
```

**Tables**:
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |
```

## Contributing

### Adding Documentation

1. Create feature branch: `git checkout -b docs/new-feature`
2. Add markdown files to appropriate folder
3. Update `sidebars.ts`
4. Test locally: `npm start`
5. Create pull request
6. Review and merge

### Pull Request Process

- Ensure changes build locally
- Update table of contents if needed
- Check links are working
- Follow documentation guidelines
- Request review from team

## Maintenance

### Regular Updates

- Monthly review of accuracy
- Update examples with new versions
- Add new best practices
- Remove outdated content
- Refresh screenshots

### Monitoring

Monitor via GitHub Actions:

```bash
# Check deployment status
gh run list --repo your-org/knowledge-bank

# View latest deployment
gh run view --repo your-org/knowledge-bank
```

### Backups

Documentation is version controlled in Git. All history is preserved.

## Troubleshooting

### Build Fails Locally

```bash
# Clear cache
npm run clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Site Not Updating

1. Verify changes pushed to `main`
2. Check GitHub Actions workflow status
3. Clear browser cache
4. Check GitHub Pages settings
5. Verify custom domain (if used)

### Search Not Working

- Ensure npm dependencies installed
- Rebuild documentation
- Check browser console for errors

## Performance

### Build Time

Current: ~30 seconds

### Site Size

- Static files: ~2-3 MB
- Includes all documentation and assets

### Optimization

- CSS minification: Automatic
- JS minification: Automatic
- Image optimization: Manual (use imagemin)
- Lazy loading: Automatic for images

## Security

- No external dependencies required for runtime
- Content served as static files
- No database or API backend
- All secrets in GitHub Actions (encrypted)
- Regular dependency updates via Dependabot

## Analytics

To add analytics (optional):

```typescript
// In docusaurus.config.ts
themeConfig: {
  gtag: {
    trackingID: 'G-XXXXXXX',
  },
}
```

## Support

### Getting Help

- Check existing documentation
- Search GitHub issues
- Review similar pages
- Check GitHub Actions logs

### Reporting Issues

Create GitHub issue with:
- Description of problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details

## License

MIT License - See LICENSE file for details

## Authors

- DevOps Team
- Engineering Leadership

## Acknowledgments

- Built with [Docusaurus](https://docusaurus.io/)
- Deployed via [GitHub Pages](https://pages.github.com/)
- CI/CD by [GitHub Actions](https://github.com/features/actions)

## Resources

### Official Documentation

- [Docusaurus Docs](https://docusaurus.io/docs)
- [Markdown Guide](https://docusaurus.io/docs/markdown-features)
- [API Reference](https://docusaurus.io/docs/api)

### Related Documentation

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Google Cloud Documentation](https://cloud.google.com/docs)

---

**Last updated**: {{ date.now() | date('yyyy-MM-dd') }}

**Contributing**: We welcome contributions! Please see CONTRIBUTING.md

**Status**: Production Ready ✅
