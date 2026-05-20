---
sidebar_position: 1
description: Complete setup and deployment guide for DevOps Knowledge Bank
---

# Setup & Deployment Guide

## Initial Setup

### Prerequisites

- Node.js 18.0 or higher
- npm 8.0 or higher
- Git
- GitHub account (for deployment)

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/your-org/knowledge-bank.git
cd knowledge-bank
```

#### 2. Install Dependencies

```bash
npm install

# Verify installation
npm list
```

#### 3. Configure Site Metadata

Edit `docusaurus.config.ts`:

```typescript
const config: Config = {
  title: 'Your Company DevOps Knowledge Bank',
  tagline: 'Your custom tagline',
  url: 'https://your-domain.com',  // Change to your domain
  baseUrl: '/knowledge-bank/',      // Change if needed
  organizationName: 'your-org',     // Your GitHub org
  projectName: 'knowledge-bank',    // Repo name
};
```

#### 4. Start Development Server

```bash
npm start

# Site opens at http://localhost:3000
```

### Project Structure

```
knowledge-bank/
├── docs/                          # Documentation source
│   ├── kubernetes/
│   ├── github-actions/
│   ├── cicd/
│   ├── gcp/
│   ├── jenkins/
│   ├── runbooks/
│   └── troubleshooting/
├── blog/                          # Blog posts
├── src/                           # React components and CSS
│   ├── css/custom.css
│   ├── components/
│   └── pages/
├── .github/workflows/             # GitHub Actions
│   └── deploy.yml
├── docusaurus.config.ts           # Main config
├── sidebars.ts                    # Navigation structure
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript config
```

## Development Workflow

### Writing Documentation

#### 1. Create Markdown File

```bash
# Create new documentation
touch docs/kubernetes/my-guide.md

# Add frontmatter
cat > docs/kubernetes/my-guide.md << 'EOF'
---
sidebar_position: 10
description: Description of my guide
---

# My Guide Title

Content here...
EOF
```

#### 2. Update Navigation

Edit `sidebars.ts`:

```typescript
kubernetesNav: [
  'kubernetes/overview',
  'kubernetes/deployment',
  'kubernetes/my-guide',  // Add here
]
```

#### 3. Test Locally

```bash
npm start

# Navigate to http://localhost:3000/docs/kubernetes/my-guide
# Verify formatting, links, code blocks
```

#### 4. Commit Changes

```bash
git add docs/kubernetes/my-guide.md sidebars.ts
git commit -m "docs: add my guide to kubernetes section"
git push origin feature/my-guide
```

#### 5. Create Pull Request

- Push to feature branch
- Create PR on GitHub
- Request review
- Merge after approval

### Adding Blog Posts

```bash
# Create blog post with ISO date
touch blog/2024-01-15-my-post.md

# Add frontmatter
cat > blog/2024-01-15-my-post.md << 'EOF'
---
slug: my-post
title: My Blog Post Title
authors: [your-name]
tags: [devops, kubernetes]
---

Blog content here...
EOF
```

### Local Development Commands

```bash
# Start dev server
npm start

# Build static site
npm run build

# Serve build locally
npm run serve

# Clean cache
npm run clear

# Typecheck TypeScript
npm run typecheck
```

## Deployment

### GitHub Pages Setup

#### 1. Configure Repository

Go to repository Settings → Pages:

1. **Source**: Select "GitHub Actions"
2. **Branch**: Leave default (will use actions)
3. **Custom domain** (optional): Add if using custom domain

#### 2. GitHub Actions Workflow

The `.github/workflows/deploy.yml` handles automatic deployment:

```yaml
on:
  push:
    branches: ['main']  # Deploy on main branch push
  pull_request:         # Also build on PRs (for preview)
```

#### 3. Deploy Automatically

Simply push to main:

```bash
# Make changes
git add .
git commit -m "Update documentation"

# Push to trigger deployment
git push origin main

# Workflow starts automatically
# Check GitHub Actions tab for progress
# Site available at: https://your-org.github.io/knowledge-bank/
```

#### 4. Manual Deployment (if needed)

```bash
# Build locally
npm run build

# Deploy manually
npm run deploy
```

### Custom Domain Setup (Optional)

#### 1. Add Domain Record

In your DNS provider, add CNAME record:

```
Host: docs
Type: CNAME
Value: your-org.github.io
```

#### 2. Configure GitHub Pages

In repository Settings → Pages:

1. **Custom domain**: Enter `docs.your-domain.com`
2. Check "Enforce HTTPS"
3. Click "Save"

#### 3. Update Config

Edit `docusaurus.config.ts`:

```typescript
url: 'https://docs.your-domain.com',
baseUrl: '/',
```

## Maintenance

### Regular Updates

#### Monthly Review

```bash
# Update dependencies
npm update

# Check for security issues
npm audit

# Update major versions if needed
npm install docusaurus@latest
```

#### Quarterly Content Review

```bash
# Find outdated content
grep -r "2023" docs/

# Check for broken links
npm run build

# Update examples with new versions
# Review and refresh screenshots
```

### Backup & Recovery

```bash
# Everything is in Git
# Full history preserved
git log --oneline

# Restore previous version
git revert <commit-hash>

# View all branches/tags
git branch -a
git tag -l
```

### Performance Monitoring

```bash
# Build time
time npm run build

# Site size
du -sh build/

# Lighthouse score
# Use Lighthouse in browser DevTools
# Target: 90+ score
```

## Troubleshooting

### Build Fails Locally

```bash
# Clear Node cache
npm cache clean --force

# Remove dependencies
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Try build again
npm run build
```

### Site Not Updating After Push

```bash
# Check workflow status
# GitHub Actions tab → deploy workflow

# Check branch settings
# Settings → Pages → Source should be "GitHub Actions"

# Check custom domain
# Settings → Pages → Custom domain is correct

# Clear browser cache
# Ctrl+Shift+Delete or Cmd+Shift+Delete
```

### Search Not Working

```bash
# Rebuild with search
npm run build

# Restart dev server
npm run clear
npm start

# Check browser console for errors
```

### Link Errors

```bash
# Build catches broken links
npm run build

# Fix in output:
# Invalid internal link: /docs/invalid/page.md

# Verify file exists
# Update link reference
# Test locally
npm start
```

## Git Workflow

### Branching Strategy

```bash
# Main branch (production-ready)
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-kubernetes-guide

# Make changes
# Test locally
git add docs/kubernetes/new-guide.md
git commit -m "docs: add kubernetes guide"

# Push feature branch
git push origin feature/add-kubernetes-guide

# Create pull request on GitHub
# Wait for review and merge
```

### Commit Message Format

```
type: subject

body (optional)

footer (optional)
```

Types:
- `docs`: Documentation changes
- `style`: Formatting changes
- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance

Example:
```bash
git commit -m "docs: add kubernetes deployment guide

Add comprehensive deployment strategies section with examples for
rolling updates, blue-green, and canary deployments.

Fixes #123"
```

## Team Collaboration

### Code Review Process

1. Create pull request
2. Request reviewer(s)
3. Address feedback
4. Approve and merge

### Assign Responsibilities

```markdown
## Content Owners

- Kubernetes: @engineer1
- GitHub Actions: @engineer2
- GCP: @engineer3
- CI/CD: @engineer4
```

### Discussion & Planning

- Use GitHub Discussions for ideas
- Use GitHub Issues for bugs/improvements
- Use Slack for urgent items

## Analytics (Optional)

### Add Google Analytics

```typescript
// In docusaurus.config.ts
themeConfig: {
  gtag: {
    trackingID: 'G-XXXXXXXXXX',
    anonymizeIP: true,
  },
}
```

### Monitor Traffic

- Google Analytics dashboard
- GitHub traffic analytics
- Search console for SEO

## Security

### Secrets Management

Never commit secrets to Git:

```bash
# Good: Use environment variables
export DEPLOY_KEY=secret

# Bad: Never do this
echo "password=secret" > config.txt
git add config.txt
```

### Access Control

- Require branch protection for main
- Require code review (1 approver)
- Require status checks to pass
- Dismiss stale reviews on new commits

### Update Dependencies

```bash
# Check security vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Review and test
npm test
npm run build
```

## Support & Help

### Getting Help

1. Check existing documentation
2. Search GitHub issues
3. Review similar pages
4. Ask in Slack/Discord

### Reporting Issues

Create GitHub issue with:
- Title: Brief description
- Description: Detailed explanation
- Steps: How to reproduce
- Expected: What should happen
- Actual: What actually happened

### Contributing

See CONTRIBUTING.md for guidelines.

## Next Steps

1. **Customize content**: Update documentation for your organization
2. **Set up custom domain**: Use your organization's domain
3. **Enable analytics**: Monitor usage and traffic
4. **Train team**: Share knowledge bank with team
5. **Iterate**: Update content based on feedback

## Resources

- [Docusaurus Documentation](https://docusaurus.io/)
- [GitHub Pages Docs](https://pages.github.com/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Markdown Guide](https://www.markdownguide.org/)

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0  
**Status**: Production Ready ✅
