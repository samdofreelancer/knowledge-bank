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
        'kubernetes/ingress',
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
      ],
    },
    {
      type: 'category',
      label: 'Advanced Workflows',
      items: [
        'github-actions/self-hosted-runner',
        'github-actions/reusable-workflows',
      ],
    },
  ],

  jenkinsNav: [
    {
      type: 'doc',
      id: 'jenkins/overview',
      label: 'Jenkins Overview',
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
      ],
    },
  ],
};

export default sidebars;
