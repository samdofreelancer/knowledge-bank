import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/kubernetes/overview">
            Get Started with Kubernetes →
          </Link>
        </div>
      </div>
    </header>
  );
}

const FeatureList = [
  {
    title: '☸️ Kubernetes',
    description: 'Master container orchestration with comprehensive Kubernetes guides covering deployments, networking, storage, and production troubleshooting.',
    link: '/docs/kubernetes/overview',
  },
  {
    title: '🔄 GitHub Actions',
    description: 'Modern CI/CD automation with GitHub Actions. Learn workflows, reusable workflows, self-hosted runners, and security best practices.',
    link: '/docs/github-actions/overview',
  },
  {
    title: '🏗️ CI/CD',
    description: 'Continuous integration and deployment fundamentals. Pipeline design, testing strategies, deployment patterns, and best practices.',
    link: '/docs/cicd/overview',
  },
  {
    title: '☁️ GCP',
    description: 'Google Cloud Platform services and patterns. Cloud Run, GKE, BigQuery, Pub/Sub, and integration with CI/CD pipelines.',
    link: '/docs/gcp/overview',
  },
  {
    title: '🚨 Runbooks',
    description: 'Operational procedures for incident response. Step-by-step guides for production issues, rollbacks, scaling, and maintenance.',
    link: '/docs/runbooks/overview',
  },
  {
    title: '🔧 Troubleshooting',
    description: 'Diagnostic guides for common DevOps issues. Kubernetes problems, container issues, network troubleshooting, and more.',
    link: '/docs/troubleshooting/overview',
  },
];

function Feature({title, description, link}) {
  return (
    <div className={clsx('col col--4', styles.feature)}>
      <Link to={link} className={styles.featureLink}>
        <div className="text--center padding-horiz--md">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Comprehensive DevOps Knowledge Bank for Kubernetes, GCP, CI/CD, and more">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {FeatureList.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.highlights}>
          <div className="container">
            <h2>Why This Knowledge Bank?</h2>
            <div className="row">
              <div className={clsx('col col--6')}>
                <h3>📚 Comprehensive</h3>
                <p>Complete coverage of modern DevOps practices, tools, and patterns based on production experience.</p>
              </div>
              <div className={clsx('col col--6')}>
                <h3>🎯 Practical</h3>
                <p>Real-world examples, copy-paste ready commands, and proven patterns from engineering teams.</p>
              </div>
            </div>
            <div className="row">
              <div className={clsx('col col--6')}>
                <h3>⚡ Quick Access</h3>
                <p>Fast search, organized navigation, and clear troubleshooting guides for quick problem solving.</p>
              </div>
              <div className={clsx('col col--6')}>
                <h3>🔄 Living Document</h3>
                <p>Continuously updated with latest best practices, tools, and techniques in the DevOps ecosystem.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.quickLinks}>
          <div className="container">
            <h2>Quick Navigation</h2>
            <div className="row">
              <div className={clsx('col col--3')}>
                <Link to="/docs/kubernetes/deployment" className="button button--outline">
                  Deploy with K8s
                </Link>
              </div>
              <div className={clsx('col col--3')}>
                <Link to="/docs/github-actions/workflow-basics" className="button button--outline">
                  Build with Actions
                </Link>
              </div>
              <div className={clsx('col col--3')}>
                <Link to="/docs/runbooks/production-incident" className="button button--outline">
                  Incident Runbook
                </Link>
              </div>
              <div className={clsx('col col--3')}>
                <Link to="/docs/troubleshooting/overview" className="button button--outline">
                  Troubleshoot
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
