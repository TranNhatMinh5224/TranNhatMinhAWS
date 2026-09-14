---
title: "Workshop"
date: 2026-08-25
weight: 5
chapter: false
pre: " <b> 5. </b> "
aliases:
  - /5-workshop/
  - /5-Workshop/
---

# Hands-on Guide: Building & Deploying Enterprise Knowledge AI RAG on AWS

#### Workshop Overview

This workshop provides a comprehensive step-by-step hands-on guide to architecting, configuring, and deploying the **Enterprise Knowledge AI RAG Assistant** on Amazon Web Services (AWS), adhering to enterprise standards with Multi-AZ, Zero-Trust security, and Serverless Containers.

> [!NOTE]
> * **Project**: Enterprise Knowledge AI RAG Assistant
> * **GitHub Repository**: [https://github.com/TranNhatMinh5224/RAG](https://github.com/TranNhatMinh5224/RAG)
> * **Core Architecture**: Multi-AZ VPC, Amazon S3 Document Lake, Amazon RDS PostgreSQL, Qdrant Vector Store on EC2 Graviton (ARM64), Amazon ECS Fargate Serverless, Application Load Balancer (ALB), and LLM integration (Amazon Bedrock / Gemini API).

---

#### Hands-on Workshop Modules:

1. [**5.1. Environment Preparation & Zero-Trust VPC Infrastructure**](5.1-vpc-network/)
   * 5.1.1. Multi-AZ VPC Provisioning & Subnet Segmentation (Public, Private App, Isolated DB)
   * 5.1.2. Security Groups & IAM Role Configuration (`EC2-S3-RAG`)
   * 5.1.3. Amazon S3 Document Lake Provisioning, Block Public Access & Folder Prefixes
2. [**5.2. Data Layer & Vector Database Deployment**](5.2-database-vector/)
   * 5.2.1. Centralized Secret Management with AWS Secrets Manager (`DATABASE_URL`, `S3_BUCKET_NAME`...)
   * 5.2.2. Amazon RDS PostgreSQL Deployment in Isolated Subnet (AWS Graviton `db.t4g.micro`, KMS Encryption)
   * 5.2.3. Qdrant Vector Store Container Deployment (HNSW Graph, Cosine Metric, `BAAI/bge-m3`)
3. [**5.3. Containerizing Applications & Pushing Images to Amazon ECR**](5.3-container-ecr/)
   * 5.3.1. Provisioning IAM User (`github-action`) for CI/CD Automation
   * 5.3.2. Amazon ECR Private Repositories Provisioning (`enterprise-rag-backend`, `enterprise-rag-frontend`)
   * 5.3.3. Dockerfile Architecture & Automated GitHub Actions Pipeline
4. [**5.4. Deploying Application Server & Application Load Balancer (ALB)**](5.4-ecs-fargate-alb/)
   * 5.4.1. EC2 Compute Node Provisioning & Remote Administration (`enterprise-rag-server`, Ubuntu 24.04, SSH Key)
   * 5.4.2. Application Load Balancer (`rag-lb`) & Target Groups Configuration (`rag-backend-tg`, `rag-frontend-tg`)
   * 5.4.3. Path-Based Routing Implementation (`/api/*`, `/docs*`, `/*`)
   * 5.4.4. End-to-End Verification via ALB Public DNS Endpoint
5. [**5.5. End-to-End RAG Pipeline Testing & Security Guardrails**](5.5-testing-rag/)
   * 5.5.1. End-to-End Ingestion & Factual Knowledge Retrieval (NexusDoc AI, Grounded Citations)
   * 5.5.2. 2-Tier Enterprise Security Guardrail Testing (Zero-Hallucination Policy)
6. [**5.6. Operational Monitoring & Incident Alerting with Amazon CloudWatch**](5.6-cloudwatch-monitoring/)
   * 5.6.1. Application Load Balancer Network Telemetry (`RequestCount`, `2XX`, `ResponseTime`)
   * 5.6.2. Centralized Observability Dashboard (`Dashboard-RAG`)
   * 5.6.3. Automated Alerting with Amazon SNS (`RAG-Server-High-CPU-Alarm`)
7. [**5.7. Resource Teardown & Cost Optimization**](5.7-cleanup/)
   * 5.7.1. Step-by-Step AWS Management Console Guide
   * 5.7.2. Automated Teardown with AWS CLI
