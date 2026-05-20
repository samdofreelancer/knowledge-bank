import type {SidebarsConfig} from '@docusaurus/types';
const {generateAllSidebars} = require('./genSidebars.js');

// Auto-generate sidebars from docs folder structure
const autoSidebars = generateAllSidebars();

const sidebars: SidebarsConfig = autoSidebars;

export default sidebars;
