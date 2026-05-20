const fs = require('fs');
const path = require('path');

/**
 * Auto-generate sidebar from docs folder structure
 * Recursively scans directories and creates categories with documents
 */
function generateSidebars(dir) {
  const items = [];
  const files = fs.readdirSync(dir).sort();

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const docId = path.relative(path.join(__dirname, 'docs'), filePath).replace(/\\/g, '/').slice(0, -3);

    if (stat.isDirectory()) {
      // Recursively process subdirectory
      const subItems = generateSidebars(filePath);
      if (subItems.length > 0) {
        const categoryLabel = file
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        items.push({
          type: 'category',
          label: categoryLabel,
          items: subItems,
          collapsed: true,
        });
      }
    } else if (file.endsWith('.md') && file !== 'index.md') {
      // Add markdown file as document
      const label = file
        .slice(0, -3)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      items.push({
        type: 'doc',
        id: docId,
        label: label,
      });
    }
  });

  return items;
}

/**
 * Convert kebab-case to camelCase
 * github-actions → githubActionsNav
 */
function kebabToCamel(str) {
  return str.replace(/-./g, x => x[1].toUpperCase());
}

/**
 * Generate complete sidebar configuration
 * Returns object with auto-generated navs for each top-level directory
 */
function generateAllSidebars() {
  const docsDir = path.join(__dirname, 'docs');
  const result = {};
  const topLevelDirs = fs.readdirSync(docsDir).filter(file => {
    const stat = fs.statSync(path.join(docsDir, file));
    return stat.isDirectory();
  });

  topLevelDirs.forEach(dir => {
    const camelCaseDir = kebabToCamel(dir);
    const navKey = camelCaseDir + 'Nav';
    const dirPath = path.join(docsDir, dir);
    const items = generateSidebars(dirPath);

    if (items.length > 0) {
      result[navKey] = items;
    }
  });

  return result;
}

module.exports = {
  generateSidebars,
  generateAllSidebars,
};
