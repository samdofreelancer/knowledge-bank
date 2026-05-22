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
 * Returns object with auto-generated navs for each directory (top-level and nested)
 */
function generateAllSidebars() {
  const docsDir = path.join(__dirname, 'docs');
  const result = {};
  const topLevelDirs = fs.readdirSync(docsDir).filter(file => {
    const stat = fs.statSync(path.join(docsDir, file));
    return stat.isDirectory();
  });

  topLevelDirs.forEach(dir => {
    const dirPath = path.join(docsDir, dir);
    const children = fs.readdirSync(dirPath);
    
    // Check if this is a group folder with subdirectories
    const subDirs = children.filter(f => {
      const stat = fs.statSync(path.join(dirPath, f));
      return stat.isDirectory();
    });
    
    if (subDirs.length > 0) {
      // For group folders, create sidebar for each subdirectory
      subDirs.forEach(subDir => {
        const subDirPath = path.join(dirPath, subDir);
        const files = fs.readdirSync(subDirPath);
        const hasMdFiles = files.some(f => f.endsWith('.md'));
        
        // Skip subdirectories without markdown files
        if (!hasMdFiles) return;
        
        const camelCaseSubDir = kebabToCamel(subDir);
        const navKey = camelCaseSubDir + 'Nav';
        const items = generateSidebars(subDirPath);
        
        if (items.length > 0) {
          result[navKey] = items;
        }
      });
    } else {
      // For non-group folders, create sidebar as before
      const camelCaseDir = kebabToCamel(dir);
      const navKey = camelCaseDir + 'Nav';
      const items = generateSidebars(dirPath);

      if (items.length > 0) {
        result[navKey] = items;
      }
    }
  });

  return result;
}

/**
 * Generate navbar items from docs folder structure
 * Returns array of navbar items auto-generated from top-level directories
 * Creates dropdown menus for group folders with sub-folders
 */
function generateNavbarItems() {
  const docsDir = path.join(__dirname, 'docs');
  const items = [];
  
  // Get top-level directories
  const topLevelDirs = fs.readdirSync(docsDir)
    .filter(file => {
      const stat = fs.statSync(path.join(docsDir, file));
      return stat.isDirectory();
    })
    .sort();

  // Custom label mappings for group folders
  const labelMap = {
    'ci-cd': 'CI/CD Ecosystem',
    'operations': 'Operations',
  };

  topLevelDirs.forEach(dir => {
    const dirPath = path.join(docsDir, dir);
    
    // Check if this is a group folder (has subdirectories)
    const children = fs.readdirSync(dirPath);
    const subDirs = children.filter(f => {
      const stat = fs.statSync(path.join(dirPath, f));
      return stat.isDirectory();
    });
    
    // If it's a group folder with subdirectories, create dropdown
    if (subDirs.length > 0) {
      const groupLabel = labelMap[dir];
      if (!groupLabel) return; // Skip unknown group folders
      
      const dropdownItems = [];
      
      subDirs.forEach(subDir => {
        const subDirPath = path.join(dirPath, subDir);
        const files = fs.readdirSync(subDirPath);
        const hasMdFiles = files.some(f => f.endsWith('.md'));
        
        // Skip subdirectories without markdown files
        if (!hasMdFiles) return;
        
        const camelCaseSubDir = kebabToCamel(subDir);
        const navKey = camelCaseSubDir + 'Nav';
        
        // Format label for sub-folder
        const subLabel = subDir
          .split('-')
          .map((word, index) => {
            // Special cases
            if (word === 'gcp') return 'GCP';
            if (word === 'ci' && index === 0) return 'CI/CD';
            if (word === 'github') return 'GitHub';
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(' ');
        
        dropdownItems.push({
          type: 'docSidebar',
          sidebarId: navKey,
          label: subLabel,
        });
      });
      
      // Only add group if it has sub-items with content
      if (dropdownItems.length > 0) {
        items.push({
          label: groupLabel,
          position: 'left',
          items: dropdownItems,
        });
      }
    }
  });

  return items;
}

module.exports = {
  generateSidebars,
  generateAllSidebars,
  generateNavbarItems,
};
