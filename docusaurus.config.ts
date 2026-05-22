import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const {generateNavbarItems} = require('./genSidebars.js');
const autoNavbarItems = generateNavbarItems();

const config: Config = {
  title: 'DevOps Knowledge Bank',
  tagline: 'Comprehensive guide to modern DevOps practices, Kubernetes, GCP, and CI/CD',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://your-org.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/knowledge-bank/',
  organizationName: 'your-org',
  projectName: 'knowledge-bank',

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/your-org/knowledge-bank/tree/main/',
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/your-org/knowledge-bank/tree/main/',
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'All posts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        language: 'en',
        hashed: true,
        indexBlog: true,
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/social-card.png',
    navbar: {
      title: 'DevOps Knowledge Bank',
      logo: {
        alt: 'DevOps Logo',
        src: 'img/logo.svg',
      },
      items: [
        ...autoNavbarItems,
        {
          to: '/blog',
          label: 'Blog',
          position: 'left',
        },
        {
          href: 'https://github.com/your-org/knowledge-bank',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Kubernetes',
              to: '/docs/operations/kubernetes/overview',
            },
            {
              label: 'GCP',
              to: '/docs/ci-cd/gcp/overview',
            },
            {
              label: 'CI/CD',
              to: '/docs/ci-cd/cicd/overview',
            },
            {
              label: 'GitHub Actions',
              to: '/docs/ci-cd/github-actions/overview',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Runbooks',
              to: '/docs/operations/runbooks/overview',
            },
            {
              label: 'Troubleshooting',
              to: '/docs/operations/troubleshooting/overview',
            },
            {
              label: 'Jenkins Migration',
              to: '/docs/ci-cd/jenkins/overview',
            },
            {
              label: 'Blog',
              to: '/blog',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/your-org/knowledge-bank',
            },
            {
              label: 'Issues',
              href: 'https://github.com/your-org/knowledge-bank/issues',
            },
            {
              label: 'Discussions',
              href: 'https://github.com/your-org/knowledge-bank/discussions',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} DevOps Team. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'javascript', 'typescript', 'python', 'java', 'sql'],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
