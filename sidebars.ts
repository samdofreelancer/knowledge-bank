import type {SidebarsConfig} from '@docusaurus/types';

const sidebars: SidebarsConfig = {
  kubernetesNav: [
    {
      type: 'doc',
      id: 'kubernetes/overview',
      label: 'Kubernetes Overview',
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'kubernetes/deployment',
        'kubernetes/statefulsets',
        'kubernetes/services',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Topics',
      items: [
        'kubernetes/ingress',
        'kubernetes/storage',
        'kubernetes/networking',
      ],
    },
    {
      type: 'doc',
      id: 'kubernetes/troubleshooting',
      label: 'Troubleshooting',
    },
  ],

  gcpNav: [
    {
      type: 'doc',
      id: 'gcp/overview',
      label: 'GCP Overview',
    },
    {
      type: 'category',
      label: 'Compute Services',
      items: [
        'gcp/cloud-run',
        'gcp/gke',
        'gcp/compute-engine',
      ],
    },
    {
      type: 'category',
      label: 'Best Practices',
      items: [
        'gcp/security',
        'gcp/optimization',
        'gcp/monitoring',
      ],
    },
  ],

  cicdNav: [
    {
      type: 'doc',
      id: 'cicd/overview',
      label: 'CI/CD Overview',
    },
    {
      type: 'category',
      label: 'Pipeline Design',
      items: [
        'cicd/pipeline-design',
        'cicd/release-strategy',
        'cicd/version-control',
      ],
    },
    {
      type: 'category',
      label: 'Best Practices',
      items: [
        'cicd/security',
        'cicd/testing',
        'cicd/deployment-patterns',
      ],
    },
  ],

  githubActionsNav: [
    {
      type: 'doc',
      id: 'github-actions/overview',
      label: 'GitHub Actions Overview',
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'github-actions/workflow-basics',
        'github-actions/trigger-events',
        'github-actions/actions-marketplace',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Workflows',
      items: [
        'github-actions/self-hosted-runner',
        'github-actions/reusable-workflows',
        'github-actions/matrix-builds',
      ],
    },
    {
      type: 'category',
      label: 'Security',
      items: [
        'github-actions/secrets-management',
        'github-actions/permissions',
        'github-actions/oidc',
      ],
    },
  ],

  jenkinsNav: [
    {
      type: 'doc',
      id: 'jenkins/overview',
      label: 'Jenkins Overview',
    },
    {
      type: 'category',
      label: 'Migration to GitHub Actions',
      items: [
        'jenkins/migration-guide',
        'jenkins/groovy-to-yaml',
        'jenkins/plugin-equivalents',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'jenkins/declarative-pipeline',
        'jenkins/shared-libraries',
      ],
    },
  ],

  runbooksNav: [
    {
      type: 'doc',
      id: 'runbooks/overview',
      label: 'Runbooks Overview',
    },
    {
      type: 'category',
      label: 'Incident Response',
      items: [
        'runbooks/production-incident',
        'runbooks/rollback-procedure',
        'runbooks/emergency-scaling',
      ],
    },
    {
      type: 'category',
      label: 'Maintenance',
      items: [
        'runbooks/cluster-upgrade',
        'runbooks/database-maintenance',
        'runbooks/certificate-rotation',
      ],
    },
  ],

  troubleshootingNav: [
    {
      type: 'doc',
      id: 'troubleshooting/overview',
      label: 'Troubleshooting Overview',
    },
    {
      type: 'category',
      label: 'Container Issues',
      items: [
        'troubleshooting/pod-crashloopbackoff',
        'troubleshooting/imagepullbackoff',
        'troubleshooting/oomkilled',
      ],
    },
    {
      type: 'category',
      label: 'Cluster Issues',
      items: [
        'troubleshooting/node-not-ready',
        'troubleshooting/persistent-volume-pending',
        'troubleshooting/network-connectivity',
      ],
    },
    {
      type: 'category',
      label: 'Application Issues',
      items: [
        'troubleshooting/high-cpu-usage',
        'troubleshooting/high-memory-usage',
        'troubleshooting/slow-queries',
      ],
    },
  ],
};

export default sidebars;
