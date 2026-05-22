---
sidebar_position: 1
---

# Adding Groups & Sub-Menus to Documentation

This guide explains how to add new documentation groups and sub-menus to the DevOps Knowledge Bank.

## Overview

The documentation system uses **auto-generation** to create navigation menus from folder structure. This means:
- ✅ No manual hardcoding needed
- ✅ Menus update automatically when folders are created
- ✅ Consistent naming and structure

## Quick Reference

| Task | Steps | Manual Config? |
|------|-------|----------------|
| Add sub-menu to existing group | Create folder in group → Add `.md` files | ❌ No |
| Add documentation files | Create `.md` files in existing folder | ❌ No |
| Add new group | Create group folder → Update labelMap in `genSidebars.js` | ✅ Yes |
| Customize menu labels | Update `labelMap` or `subfolderLabels` in `genSidebars.js` | ✅ Yes |
| Remove group/menu | Delete folder | ❌ No |

---

## Step-by-Step Guides

### ✨ Adding a New Sub-Menu to Existing Group

**Example:** Add "Security" sub-menu to "Operations" group

#### Step 1: Create the Folder Structure
```bash
mkdir -p docs/operations/security
```

#### Step 2: Create Documentation Files
```bash
# Create overview file (required - will be shown first)
touch docs/operations/security/overview.md

# Create additional pages (optional)
touch docs/operations/security/authentication.md
touch docs/operations/security/secrets-management.md
```

#### Step 3: Write Content
Edit `overview.md`:
```markdown
---
sidebar_position: 1
---

# Security Best Practices

Your content here...

## See Also
- [Authentication](./authentication.md)
- [Secrets Management](./secrets-management.md)
```

#### Step 4: Build & Test
```bash
# Clean cache
rm -rf .docusaurus node_modules/.cache

# Build
npm run build

# Test locally
npm run serve
```

**Result:** New "Security" menu appears under "Operations" dropdown in navbar

---

### 🆕 Adding a New Group

**Example:** Create "DevOps Tools" group with "Ansible" and "Terraform" sub-menus

#### Step 1: Create Group Folder Structure
```bash
# Create main group folder
mkdir -p docs/devops-tools

# Create sub-menu folders
mkdir -p docs/devops-tools/ansible
mkdir -p docs/devops-tools/terraform
```

**Naming Convention:**
- Use `kebab-case`: `my-group-name` → `My Group Name`
- Avoid spaces and special characters

#### Step 2: Create Documentation Files
```bash
# Create overview files for each sub-menu
touch docs/devops-tools/ansible/overview.md
touch docs/devops-tools/terraform/overview.md

# Add additional pages
touch docs/devops-tools/ansible/setup-guide.md
touch docs/devops-tools/terraform/state-management.md
```

#### Step 3: Update `genSidebars.js`

Edit `genSidebars.js` and add your group to the `labelMap`:

**Location:** Line ~130-135

```javascript
// Before
const labelMap = {
  'ci-cd': 'CI/CD Ecosystem',
  'operations': 'Operations',
  'gitops-best-practices': 'GitOps Best Practices',
};

// After
const labelMap = {
  'ci-cd': 'CI/CD Ecosystem',
  'operations': 'Operations',
  'gitops-best-practices': 'GitOps Best Practices',
  'devops-tools': 'DevOps Tools',  // ← Add your group here
};
```

**Format:** `'folder-name': 'Display Name'`

#### Step 4: Write Documentation

Example for `docs/devops-tools/ansible/overview.md`:
```markdown
---
sidebar_position: 1
---

# Ansible

Ansible is an open-source automation platform...

## Learn More
- [Setup Guide](./setup-guide.md)
- [Best Practices](../terraform/overview.md)
```

#### Step 5: Build & Test
```bash
# Clean cache
rm -rf .docusaurus node_modules/.cache

# Build
npm run build

# Test locally
npm run serve
```

**Result:** 
- New "DevOps Tools" dropdown appears in navbar
- Sub-menus: "Ansible", "Terraform"

---

### 🏷️ Customizing Sub-Menu Labels

By default, folder names are auto-formatted to titles. For custom labels, edit `genSidebars.js`:

**Location:** Line ~157-170

```javascript
// Format label for sub-folder
let subLabel;
if (subDir === 'ci') {
  subLabel = 'Continuous Integration';
} else if (subDir === 'cd') {
  subLabel = 'Continuous Delivery';
} else if (subDir === 'ansible') {
  subLabel = 'Ansible Automation';  // ← Add custom label
} else {
  subLabel = subDir
    .split('-')
    .map((word, index) => {
      if (word === 'gcp') return 'GCP';
      if (word === 'github') return 'GitHub';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
```

---

## File Structure Rules

### ✅ Valid Structure
```
docs/
├── operations/                 ← Group folder
│   ├── kubernetes/            ← Sub-menu folder
│   │   └── overview.md        ← Documentation file
│   ├── runbooks/
│   │   └── overview.md
│   └── security/
│       ├── overview.md
│       └── authentication.md
└── gitops-best-practices/      ← Another group
    ├── principles/
    │   └── overview.md
    └── tools/
        └── overview.md
```

### ❌ Invalid Structure
```
docs/
├── operations/
│   └── overview.md            ← ❌ No .md files directly in group
│       ├── kubernetes/
│       └── runbooks/
```

**Rule:** `.md` files must be in sub-menu folders, not directly in group folder.

---

## Markdown File Guidelines

### Required Front Matter
```markdown
---
sidebar_position: 1
---

# Page Title

Your content starts here...
```

### File Naming
- Use descriptive names: `overview.md`, `setup-guide.md`
- Use `kebab-case`: `my-topic.md` not `myTopic.md`
- `overview.md` should be first in each folder

### Cross-References
```markdown
# Link to another page in same folder
[Security Guide](./security-guide.md)

# Link to page in parent group
[Terraform](../terraform/overview.md)

# Link to page in different group
[Kubernetes Setup](../../operations/kubernetes/overview.md)
```

---

## Troubleshooting

### Menu doesn't appear after creating folder

**Check:**
1. Folder contains `.md` files? → Create at least `overview.md`
2. Group in `labelMap` in `genSidebars.js`? → Add it
3. Ran build? → Execute `npm run build`
4. Cleared cache? → Run `rm -rf .docusaurus node_modules/.cache`

### Sidebar ID error: "Can't find any sidebar with id 'xyz'"

**Solution:**
```bash
# This means labelMap has an unknown group
# Check genSidebars.js line 130-135
# Make sure group name is in labelMap
```

### Menu position is wrong

The position is determined by:
1. Folder creation order (alphabetical)
2. `sidebar_position` in markdown front matter

To change order, add `sidebar_position` to front matter:
```markdown
---
sidebar_position: 2
---
```

### Build fails after changes

```bash
# Try full cleanup
rm -rf .docusaurus node_modules/.cache build

# Reinstall dependencies
npm ci

# Rebuild
npm run build
```

---

## Development Workflow

### Typical Process
```bash
# 1. Create folder structure
mkdir -p docs/my-group/my-submenu

# 2. Create markdown files
touch docs/my-group/my-submenu/overview.md

# 3. Edit genSidebars.js if new group
# Add to labelMap

# 4. Clean and build
rm -rf .docusaurus node_modules/.cache
npm run build

# 5. Test locally
npm run serve

# 6. Open http://localhost:3000 and verify menu

# 7. Commit and push
git add .
git commit -m "Add my-group documentation"
git push origin main

# 8. GitHub Actions deploys automatically
```

### Automated Deployment

Once pushed to `main` branch:
- GitHub Actions workflow triggers
- Documentation builds automatically
- Deployed to GitHub Pages
- URL appears in job summary

---

## Common Patterns

### Pattern 1: Tool Documentation
```
docs/devops-tools/
├── docker/
│   ├── overview.md
│   ├── installation.md
│   ├── compose.md
│   └── best-practices.md
└── kubernetes/
    ├── overview.md
    ├── deployment.md
    └── networking.md
```

### Pattern 2: Process Documentation
```
docs/platform/
├── onboarding/
│   ├── overview.md
│   ├── setup-environment.md
│   └── first-deployment.md
└── troubleshooting/
    ├── overview.md
    ├── common-issues.md
    └── debugging-guide.md
```

### Pattern 3: Reference Documentation
```
docs/reference/
├── api/
│   ├── overview.md
│   ├── authentication.md
│   └── endpoints.md
└── configuration/
    ├── overview.md
    ├── environment-variables.md
    └── secrets.md
```

---

## Quick Commands

```bash
# Full rebuild after major changes
rm -rf .docusaurus node_modules/.cache && npm run build

# Start dev server (auto-reload)
npm start

# Serve production build
npm run serve

# Check for broken links
npm run docusaurus docs:version

# Generate new version
npm run docusaurus docs:version 1.0.0
```

---

## Best Practices

✅ **DO:**
- Create `overview.md` first in each folder
- Use descriptive folder and file names
- Add `sidebar_position` for custom ordering
- Test locally before pushing
- Write clear, concise documentation
- Cross-link related pages

❌ **DON'T:**
- Put `.md` files directly in group folders (use sub-folders)
- Use spaces in folder names (use kebab-case)
- Skip `overview.md` (it becomes the main page)
- Forget to update `labelMap` for new groups
- Push without building locally first

---

## Need Help?

Refer to:
- [genSidebars.js](../../genSidebars.js) - Auto-generation script
- [docusaurus.config.ts](../../docusaurus.config.ts) - Main configuration
- [Docusaurus Documentation](https://docusaurus.io/docs/category/guides) - Official docs
