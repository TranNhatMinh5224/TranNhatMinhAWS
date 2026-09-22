---
title: "Workshop"
date: 2026-08-25
weight: 4
chapter: false
pre: " <b> 4. </b> "
---
# Hands-on Guide: Building & Deploying Enterprise Knowledge AI RAG on AWS

#### Workshop Overview

This workshop provides a comprehensive step-by-step hands-on guide to architecting, configuring, and deploying the **Enterprise Knowledge AI RAG Assistant** on Amazon Web Services (AWS), adhering to enterprise standards with Multi-AZ, Zero-Trust security, and Serverless Containers.

> [!NOTE]
> * **Project**: Enterprise Knowledge AI RAG Assistant
> * **GitHub Repository**: [https://github.com/TranNhatMinh5224/RAG](https://github.com/TranNhatMinh5224/RAG)
> * **Core Architecture**: Multi-AZ VPC, Amazon S3 Document Lake, Amazon RDS PostgreSQL, Qdrant Vector Store, EC2 Compute Container Runtime (Docker Compose), Application Load Balancer (ALB), and LLM integration (Amazon Bedrock / Gemini API).

---

#### Hands-on Workshop Modules:

1. [**4.1. Environment Preparation & Zero-Trust VPC Infrastructure**](4.1-vpc-network/)
   * 4.1.1. Multi-AZ VPC Provisioning & Subnet Segmentation (Public, Private App, Isolated DB)
   * 4.1.2. Security Groups & IAM Role Configuration (`EC2-S3-RAG`)
   * 4.1.3. Amazon S3 Document Lake Provisioning, Block Public Access & Folder Prefixes
2. [**4.2. Data Layer & Vector Database Deployment**](4.2-database-vector/)
   * 4.2.1. Centralized Secret Management with AWS Secrets Manager (16 Parameters: DB, S3, Bedrock Mantle...)
   * 4.2.2. Amazon RDS PostgreSQL Deployment in Isolated Subnet (AWS Graviton `db.t4g.micro`, KMS Encryption)
   * 4.2.3. Qdrant Vector Store Container Deployment (HNSW Graph, Cosine Metric, `BAAI/bge-m3`)
3. [**4.3. Containerizing Applications & Pushing Images to Amazon ECR**](4.3-container-ecr/)
   * 4.3.1. Provisioning IAM User (`github-action`) for CI/CD Automation
   * 4.3.2. Amazon ECR Private Repositories Provisioning (`enterprise-rag-backend`, `enterprise-rag-frontend`)
   * 4.3.3. Dockerfile Architecture & Automated GitHub Actions Pipeline
4. [**4.4. Deploying Application Server & Application Load Balancer (ALB)**](4.4-ecs-fargate-alb/)
   * 4.4.1. EC2 Compute Node Provisioning & Remote Administration (`enterprise-rag-server`, Ubuntu 24.04, SSH Key)
   * 4.4.2. Application Load Balancer (`rag-lb`) & Target Groups Configuration (`rag-backend-tg`, `rag-frontend-tg`)
   * 4.4.3. Path-Based Routing Implementation (`/api/*`, `/docs*`, `/*`)
   * 4.4.4. End-to-End Verification via ALB Public DNS Endpoint
5. [**4.5. End-to-End RAG Pipeline Testing & Security Guardrails**](4.5-testing-rag/)
   * 4.5.1. Amazon Bedrock Mantle Endpoint, Model Catalog & Workbench Playground Validation
   * 4.5.2. End-to-End RAG Pipeline Testing via ALB DNS on Real Enterprise Documents (9 Evaluation Scenarios)
   * 4.5.3. 2-Tier Enterprise Security Guardrails & Zero-Hallucination Testing
6. [**4.6. Operational Monitoring & Incident Alerting with Amazon CloudWatch**](4.6-cloudwatch-monitoring/)
   * 4.6.1. Application Load Balancer Network Telemetry (`RequestCount`, `2XX`, `ResponseTime`)
   * 4.6.2. Centralized Observability Dashboard (`Dashboard-RAG`)
   * 4.6.3. Automated Alerting with Amazon SNS (`RAG-Server-High-CPU-Alarm`)
7. [**4.7. Resource Teardown & Cost Optimization**](4.7-cleanup/)
   * 4.7.1. Step-by-Step AWS Management Console Guide
   * 4.7.2. Automated Teardown with AWS CLI
