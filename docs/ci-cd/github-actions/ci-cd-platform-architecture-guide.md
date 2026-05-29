# CI/CD Platform Architecture Guide (GitHub Actions)

## 1. Overview
This document summarizes a scalable CI/CD architecture using GitHub Actions, designed with Clean Architecture principles and platform engineering mindset.

Goal:
- Separate Product / Platform / Actions / Scripts / Infra

---

## 2. Core Mental Model

Product Workflow → Reusable Workflow → Composite Action → Script → Infrastructure

Principle:
Product defines WHAT, Platform defines HOW

---

## 3. Layer Responsibilities

### Product Workflow
- Defines pipeline flow
- Service orchestration
- Environment selection
- Trigger logic

Not responsible for:
- Docker, GCP auth, kubectl

---

### Reusable Workflow
- Standard CI/CD flow
- Orchestrates actions
- Defines pipeline structure

---

### Composite Actions
- Atomic reusable capability
- auth-gcp, setup-java, build-docker, deploy-gke

Rule: one action = one responsibility

---

### Scripts
Use when:
- logic > 10 lines
- retry / loop / parsing
- complex validation

---

## 4. CI Pipeline Example

Steps:
checkout → build → test → docker build → push GAR

---

## 5. Deployment Flow

core → frontend-api → frontend (sequential)

---

## 6. Naming Convention

### Reusable Workflow
wf-build-java.yml
wf-test-java.yml
wf-deploy-gke.yml

### Composite Action
act-auth-gcp
act-setup-java
act-build-docker

### Script
deploy.sh
verify.sh

---

## 7. When to use Script vs Action

Script:
- complex logic
- retry / parsing
- reusable outside CI

Action:
- simple infra operation
- atomic capability

---

## 8. When to use Action vs Workflow

Action:
- reusable capability
- infra abstraction

Workflow:
- full pipeline orchestration
- CI/CD flow definition

---

## 9. Platform vs Product

Product:
- defines flow

Platform:
- implements execution

---

## 10. Golden Rules

- Product defines WHAT
- Platform defines HOW
- Avoid infra logic in product repo
- Prefer reuse over duplication
- Naming = capability, not implementation

---

## 11. Final Architecture

Product Repo
→ Reusable Workflow
→ Composite Action
→ Script
→ Infrastructure

---

End of document.
