---
title: "Proposal"
date: 2026-08-25
weight: 2
chapter: false
pre: " <b> 2. </b> "
---
# Enterprise Knowledge AI RAG — Autonomous Knowledge Assistant for Enterprise Internal Documents
## Enterprise Cloud Architecture on AWS: Multi-AZ Resiliency, Zero-Trust Security, Serverless Containers & Cost Optimization

---

### 1. Business Context, Problem Statement & Proposal Objectives

#### 1.1. Challenges in Managing and Querying Internal Enterprise Documents
*   **Fragmented & Rapidly Accumulating Internal Knowledge**: In any enterprise, operational knowledge assets (Company Charters, Financial & Procurement Regulations, Internal Labor Codes, Employee Handbooks, Standard Operating Procedures - SOPs, Commercial & Labor Contracts, Technical Reports) continually grow across diverse formats (`.pdf`, `.docx`, `.xlsx`, `.pptx`, scanned receipts/images).
*   **Substantial Search & Onboarding Overhead**: New hires, operational staff, and management expend substantial hours each week attempting to locate specific rules or thresholds (e.g., *"Equipment purchase approval limits exceeding 50M VND"*, *"Remote work policy and annual leave eligibility conditions"*).
*   **Severe Data Privacy & Leakage Risks with Public AI**: Organizations **strictly cannot upload** proprietary documents (trade secrets, personnel records, internal financial audits, confidential contracts) to external public AI services without end-to-end encryption and guaranteed multi-tenant data isolation (**Multi-Tenancy**).
*   **The Hallucination Dilemma in Generic LLMs**: Public foundation models lack visibility into company-private governance policies; when queried, they easily fabricate plausible-sounding answers that contradict internal governance rules.
*   **Hierarchical Structure of Corporate Governance Documents**: Core governance papers are formally organized in nested hierarchical layers (`Chapter -> Article -> Clause`) and frequently include internal cross-citations (*"Pursuant to Article 15 of this Regulation..."*). Conventional token-based chunking truncates clauses arbitrarily, stripping vital parent context.

#### 1.2. Cloud Modernization Objectives on AWS
This proposal focuses on **modernizing and transitioning** the containerized application prototype into a production-ready **Enterprise Cloud Architecture on Amazon Web Services (AWS)** to achieve:
1.  **High Availability (Multi-AZ Resiliency)**: Resilient operation across multiple Availability Zones with automated hardware failover.
2.  **Enterprise-Grade Security (Zero-Trust Model)**: Isolated database subnets, IAM least-privilege roles, and end-to-end data-at-rest encryption via AWS KMS.
3.  **Elastic Scalability (Auto-Scaling Serverless Containers)**: Amazon ECS Fargate decoupling high-speed REST APIs from heavy background ingestion workers (Celery + Redis).
4.  **Cost-Optimized Total Cost of Ownership (TCO)**: Leveraging **AWS Graviton3 (ARM64)** for vector search and **Amazon S3 Lifecycle** tiering to achieve **65% – 75%** monthly infrastructure cost savings over traditional architectures.

---

### 2. System Architecture & Real Tech Stack

The application follows Clean Architecture principles, packaged as modular microservices:

*   **Project Source Code (GitHub Repository)**: [https://github.com/TranNhatMinh5224/RAG](https://github.com/TranNhatMinh5224/RAG)
*   **Live Deployment / Product URL (ALB)**: [http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com/](http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com/)
*   **Frontend UI**: React 18 / Next.js — Modern, responsive interface delivering an interactive *"NotebookLM-style"* multi-document analysis experience.
*   **Backend API**: FastAPI (Python 3.10+) — High-concurrency asynchronous RESTful API with OAuth2 / JWT authentication (30-minute Access Token, 7-day Refresh Token) and Clean Architecture repository patterns.
*   **Relational Database**: PostgreSQL — Stores user credentials, session threads, chat histories, and document chunk metadata.
*   **Vector Database**: Qdrant — High-speed vector similarity engine hosting 1024-dimensional embeddings, supporting instantaneous Hard-Filter payload execution filtered by `user_id` and `document_ids`.
*   **Asynchronous Processing**: Celery Worker + Redis — Offloads compute-heavy ingestion jobs (OCR extraction, hierarchical chunking, and embedding generation) from the main API thread.
*   **AI Pipeline (LangChain)**:
    *   *Embedding Model*: `BAAI/bge-m3` — Dense embedding model with native Vietnamese multilingual support, running locally with 1024 dimensions.
    *   *Re-ranking Model*: `BAAI/bge-reranker-v2-m3` — Cross-Encoder precision filter isolating the top 3 relevant context passages.
    *   *Foundation LLM*: `Google Gemini 2.5 Flash` (with hybrid local fallback via Ollama and Amazon Bedrock).
    *   *Optical Character Recognition (OCR)*: `PaddleOCR PP-OCRv4` — Fallback engine for extracting Vietnamese text from scanned paperwork, receipts, and images.

---

### 3. Core System Capabilities

#### 3.1. Identity Management, Access Control & Multi-Tenancy
*   Robust OAuth2 / JWT user authentication with cryptographically hashed passwords.
*   **Absolute Multi-Tenant Data Isolation**: Every vector chunk in Qdrant is partitioned with `user_id` metadata. Queries issued by one employee or department can never cross over into another tenant's vector space.

#### 3.2. Multi-Format Processing & Structured Clause Parsing
*   **Broad Office File Support**: Ingests `.pdf`, `.docx`, `.xlsx`, `.pptx`, `.png`, and `.jpg`.
*   **Hierarchical Parsing**: Automatically identifies governance documents with `Chapter -> Article -> Clause` structures, preserving complete parent breadcrumb context (`[Document Title] > [Chapter X] > [Article Y]`).
*   **Integrated PaddleOCR**: Automatically engages OCR when scanned documents or raster image files are uploaded.
*   **Excel to Markdown Conversion**: Converts numerical spreadsheets and tables into clean Markdown Tables so the LLM can easily reason over tabular data.
*   **Cascading Lifecycle Deletion**: Deleting a document from the interface purges the database record in PostgreSQL, deletes the physical file, and cleans up all related vector embeddings in Qdrant.

#### 3.3. Scoped Knowledge Spaces ("NotebookLM-Style")
*   Users can attach individual chat sessions to a **specific list of selected documents** (e.g., one chat focused solely on *"Financial Regulations 2026"*, another on *"Vendor Contract A"*).
*   Locks the AI within that specific knowledge scope, preventing cross-contamination from unrelated documents.

---

### 4. Deep-Dive AI RAG Pipeline Analysis

The system operates a specialized 3-stage intelligence pipeline:

<div style="text-align: center; margin: 30px 0;">
  <img src="/images/2-Proposal/pipeline_rag.png" alt="Deep-Dive AI RAG 3-Stage Pipeline Diagram" style="width: 100%; max-width: 1050px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); border: 1px solid #E2E8F0; margin: 0 auto; display: block;" />
  <p style="font-style: italic; color: #666; margin-top: 10px; font-size: 0.9em;">Deep-Dive AI RAG 3-Stage Pipeline: Ingestion Pipeline, Agentic Retrieval & Generation</p>
</div>

#### Stage 1: Ingestion Pipeline (Intake & Pre-processing)
*   **Dual-Engine Extraction**: Digital PDFs and DOCX are parsed via PyMuPDF; scanned documents trigger PaddleOCR.
*   **Smart Segmentation**: Regex-based hierarchical parsing handles charters and contracts; non-structured prose uses `SemanticChunker` (80th percentile threshold).
*   **Vector Ingestion**: Chunks are embedded via `BAAI/bge-m3` into Qdrant alongside rich metadata (`source`, `page`, `chuong`, `dieu`, `user_id`).

#### Stage 2: Retrieval Pipeline (Agentic-Grade Context Gathering)
*   **Tier 1 Guardrail (Pre-flight Fast Check)**: Intercepts raw user inputs via input validation rules and regex/keyword filters, neutralizing Prompt Injections, Jailbreaks (DAN, System Overrides), and domain-divergent queries before consuming retrieval resources.
*   **Self-Query Retriever**: Distills user intent and attributes (document category, effective year) into hard filters executed directly against Qdrant payloads.
*   **Hybrid Search**: Merges dense semantic vector similarity and sparse keyword search (BM25) over candidate pools, discarding boilerplate table of contents.
*   **Cross-Encoder Re-ranking**: `BAAI/bge-reranker-v2-m3` re-scores candidate pairs to isolate the top 3 most relevant segments.
*   **Cross-Reference Agent (Second-Hop Search)**: Detects statutory citations (*"Pursuant to Article 12..."*). If absent from the initial context, it executes a second-hop search to append the referenced clause into context.

#### Stage 3: Generation Pipeline (Synthesis with Tier 2 Guardrail)
*   **Tier 2 Guardrail (Deep Grounding & Prompt Hardening)**: Hardens system prompts to strictly eliminate hallucination; mandates factual answers grounded exclusively in retrieved evidence, disallows speculative extrapolations, and neutralizes indirect injection attacks.
*   **Hierarchical Breadcrumb Injection & Citations**: Prepends document structure to every chunk and mandates verified in-line citations with exact source filenames and page numbers (`[Source: ... - Page ...]`).
*   **LLM Synthesis**: Dispatches payload to Google Gemini 2.5 Flash for high-speed streaming via SSE.

---

### 5. Production Application Screenshots

{{% notice tip %}}
**Live Application Experience (AWS Application Load Balancer):**  
🔗 **Live Product Endpoint:** [http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com/](http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com/)  
*The NexusDoc AI (Enterprise Legal & Knowledge RAG) system is actively operational in production on AWS, distributed via Layer 7 Application Load Balancer.*
{{% /notice %}}

Below are actual production screenshots from the operational **NexusDoc AI (Deep Research Pro)** document assistant on AWS:

<div style="text-align: center; margin: 25px 0;">
  <img src="/images/2-Proposal/nexusdoc_chat_citation.png" alt="NexusDoc AI Assistant Interface with Exact Source Citation" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 25px;" />
  <p style="font-style: italic; color: #666; margin-top: -15px; margin-bottom: 30px;">Figure 1: NexusDoc AI extracting exact entity data (Bitexco Floor 36) paired with verifiable source citations (TTTN-01.docx - Page 1)</p>

  <img src="/images/2-Proposal/nexusdoc_chat_product.png" alt="NexusDoc AI Knowledge Synthesis and Capstone Objectives" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 25px;" />
  <p style="font-style: italic; color: #666; margin-top: -15px; margin-bottom: 30px;">Figure 2: Grounded Q&A experience pairing answers with real-time reasoning status, BAAI/bge-m3 embeddings, and Re-ranking</p>

  <img src="/images/2-Proposal/nexusdoc_guardrail_demo.png" alt="2-Tier Security Guardrails and Zero-Hallucination Testing" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto;" />
  <p style="font-style: italic; color: #666; margin-top: 10px;">Figure 3: 2-Tier Security Guardrails gracefully refusing out-of-scope enterprise queries (Amazon stock forecasts), eliminating hallucination</p>
</div>

---

### 6. Deep-Dive Enterprise Cloud Architecture on AWS

To transition the **Enterprise Knowledge AI RAG** system from local Docker environments into an enterprise-ready, production-grade cloud solution, the proposed AWS architecture adheres to High Availability (HA), Zero-Trust, and Serverless Containerization standards:

#### 6.1. High-Level AWS Architecture Diagram:

<div style="text-align: center; margin: 30px 0;">
  <img src="/images/2-Proposal/enterprise_aws_architecture.png" alt="Enterprise AWS Cloud Architecture Diagram" style="width: 100%; max-width: 1050px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); border: 1px solid #E2E8F0; margin: 0 auto; display: block;" />
  <p style="font-style: italic; color: #666; margin-top: 10px; font-size: 0.9em;">Figure 5: Detailed Production Architecture of Enterprise Knowledge AI RAG on AWS (Multi-AZ Resilient & Zero-Trust Security)</p>
</div>

---

#### 6.2. Multi-AZ VPC Network Planning & Subnet Partitioning

The architecture operates inside VPC `10.0.0.0/16` spanning across **2 Availability Zones** (`ap-southeast-1a` and `ap-southeast-1b`) in AWS Singapore Region:

| Subnet Tier | Availability Zone | CIDR Block | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **Public Subnet 1** | `ap-southeast-1a` | `10.0.1.0/24` | Application Load Balancer Node 1, NAT Gateway 1, Internet Gateway ingress. |
| **Public Subnet 2** | `ap-southeast-1b` | `10.0.2.0/24` | Application Load Balancer Node 2, NAT Gateway 2 (Failover Resiliency). |
| **Private App Subnet 1** | `ap-southeast-1a` | `10.0.10.0/24` | ECS Fargate API Container, Celery Worker Node 1, ElastiCache Redis Primary. |
| **Private App Subnet 2** | `ap-southeast-1b` | `10.0.20.0/24` | ECS Fargate API Replica, ElastiCache Redis Read Replica (Auto-failover). |
| **Isolated Data Subnet 1**| `ap-southeast-1a` | `10.0.100.0/24`| RDS PostgreSQL Primary Instance, Qdrant Vector Store on EC2 Graviton (No Internet Inbound/Outbound). |
| **Isolated Data Subnet 2**| `ap-southeast-1b` | `10.0.200.0/24`| RDS PostgreSQL Standby Replica (Multi-AZ Synchronous), EBS Snapshots. |

> [!IMPORTANT]
> **AWS PrivateLink Integration (VPC Endpoints)**:
> Eliminates data leakage vectors when interacting with internal AWS services:
> *   **Gateway Endpoint**: For **Amazon S3** (zero data egress cost, direct connection from private subnets).
> *   **Interface Endpoints**: For **Amazon ECR**, **AWS Secrets Manager**, and **Amazon Bedrock**. Model inference queries never traverse the public Internet.

---

#### 6.3. Security Groups Least-Privilege Matrix

Enforcing a **Zero-Trust Network Model** where no tier trusts another without explicitly defined firewall parameters:

| Security Group | Protocol / Port | Allowed Source | Technical Purpose |
| :--- | :--- | :--- | :--- |
| **`sg-alb`** | TCP `443` (HTTPS)<br/>TCP `80` (HTTP) | `0.0.0.0/0` (via CloudFront) | Accepts incoming user traffic, redirects HTTP to HTTPS. |
| **`sg-ecs-api`** | TCP `8000` | Only `sg-alb` | Restricts API access solely to the ALB, rejecting direct internet traffic. |
| **`sg-ecs-worker`** | No Inbound | None | Worker acts strictly as an outbound consumer pulling jobs from Redis. |
| **`sg-elasticache`**| TCP `6379` | Only `sg-ecs-api` & `sg-ecs-worker` | Guards Celery queue broker and session storage against unauthorized access. |
| **`sg-rds`** | TCP `5432` | Only `sg-ecs-api` & `sg-ecs-worker` | Restricts database access strictly to authorized application containers. |
| **`sg-qdrant`** | TCP `6333` | Only `sg-ecs-api` & `sg-ecs-worker` | Shields the vector engine, blocking external vector manipulation. |

---

#### 6.4. Application Module to AWS Service Mapping:

| Application Source Component | AWS Service Equivalent | Architectural Role |
| :--- | :--- | :--- |
| **Frontend Web (React / Next.js)** | **Amazon S3 + CloudFront** | S3 hosts static artifacts; CloudFront CDN distributes globally with free SSL via ACM. |
| **Edge Firewall & Load Balancer** | **AWS WAF + ALB** | WAF inspects traffic with `AWSManagedRulesCommonRuleSet`; ALB balances loads across Multi-AZ targets. |
| **Backend API (FastAPI)** | **Amazon ECS Fargate** | Serverless API containers auto-scaling based on CPU utilization thresholds (70%). |
| **Background Processing (Celery)** | **Amazon ECS Fargate Worker** | Specialized asynchronous containers executing OCR, hierarchical parsing, and vector embeddings. |
| **Queue Broker & Session Cache** | **Amazon ElastiCache Redis** | Multi-AZ Redis cluster with automated failover and sub-millisecond latency. |
| **Relational Database (PostgreSQL)** | **Amazon RDS PostgreSQL** | `db.t4g.medium` Multi-AZ with daily automated backups and storage auto-scaling. |
| **Vector Database (Qdrant)** | **Qdrant on EC2 Graviton (ARM64)** | `c7g.xlarge` powered by AWS Graviton3, equipped with `gp3` storage (3000 IOPS, 125 MB/s throughput). |
| **Raw Storage (Document Lake)** | **Amazon S3 (Standard + Glacier)** | Automated S3 Lifecycle transitioning documents older than 90 days to Glacier Instant Retrieval; SSE-KMS encrypted. |
| **Foundation Models (LLM)** | **Amazon Bedrock / Google Gemini** | Connects to Bedrock via VPC Interface Endpoint; Gemini 2.5 Flash via NAT Gateway. |
| **Secrets & Observability** | **AWS Secrets Manager & CloudWatch** | Centralizes secrets management with rotation; CloudWatch collects logs and triggers SNS alerts. |

---

#### 6.5. IAM Governance & Zero-Trust Security Framework

Strict separation of duties enforced through granular IAM Roles:

1.  **ECS Task Execution Role (`ecsTaskExecutionRole`)**:
    *   Grants ECS Agent permissions to pull container images from **Amazon ECR**.
    *   Grants rights to create log streams in **Amazon CloudWatch Logs**.
    *   Grants permission to decrypt sensitive environment variables (DB secrets, API keys) from **AWS Secrets Manager** (`secretsmanager:GetSecretValue`).
2.  **ECS Task Role (`ecsLegalRAGTaskRole`)**:
    *   Grants FastAPI runtime permissions to read/write objects in **Amazon S3 Document Lake** (`s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`).
    *   Grants cryptographic access to **AWS KMS Customer Managed Keys** (`kms:Decrypt`, `kms:GenerateDataKey`).
    *   Grants model invocation privileges on **Amazon Bedrock** (`bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream`).
3.  **End-to-End Cryptography**:
    *   *In-Transit*: Enforces TLS 1.3 encryption across all client, CDN, ALB, and container hops.
    *   *At-Rest*: All S3 Buckets, RDS PostgreSQL data volumes, and Qdrant EBS drives are encrypted using AWS KMS Customer Managed Keys.

---

#### 6.6. CI/CD GitOps Pipeline & Telemetry Observability

<div style="text-align: center; margin: 30px 0;">
  <img src="/images/2-Proposal/cicd_observability.png" alt="CI/CD GitOps Pipeline & Telemetry Observability Diagram" style="width: 100%; max-width: 1050px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); border: 1px solid #E2E8F0; margin: 0 auto; display: block;" />
  <p style="font-style: italic; color: #666; margin-top: 10px; font-size: 0.9em;">Figure 6: CI/CD GitOps Automated Pipeline & Comprehensive Observability Architecture on AWS</p>
</div>

*   **Zero-Downtime Rolling Deployments**: ECS Fargate provisions new container tasks, waits for healthy ALB target responses (`/api/health`), and only then terminates obsolete tasks.
*   **Deep Observability**:
    *   **CloudWatch Container Insights**: Tracks container CPU, memory utilization, and network traffic.
    *   **AWS X-Ray**: Distributed tracing isolates latency bottlenecks across embedding generation, vector querying, and LLM inference.

---

### 7. Cost Analysis & Investment Optimization (AWS Cost Breakdown & TCO)

#### 7.1. Itemized Monthly AWS Service Bill Estimate:

| AWS Service | Selected Configuration | Pricing Methodology | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Amazon ECS Fargate (API)** | 2 Always-on Tasks (0.5 vCPU, 1 GB RAM) | ~$0.024/hr x 730 hrs x 2 | ~$35.00 |
| **Amazon ECS Fargate (Worker)**| 1 On-demand Task (1.0 vCPU, 2 GB RAM) | Runs ~120 hrs/mo on intake spikes | ~$6.50 |
| **EC2 Qdrant (Graviton3)** | 1x `c7g.xlarge` (4 vCPU, 8 GB RAM) + 100GB gp3 | ~$0.145/hr x 730 hrs + 100GB gp3 | ~$115.00 |
| **Amazon RDS PostgreSQL** | `db.t4g.medium` (2 vCPU, 4 GB RAM) Multi-AZ | ~$0.068 x 2 x 730 hrs + 50GB storage | ~$58.00 |
| **Amazon ElastiCache Redis** | `cache.t4g.micro` (0.5 GB RAM) Single-node | ~$0.016/hr x 730 hrs | ~$11.50 |
| **Amazon S3 Document Lake** | 200 GB S3 Standard + 500 GB S3 Glacier Tier | Storage + PUT/GET Request charges | ~$12.00 |
| **CloudFront & AWS WAF** | 1TB Egress Data Transfer + WAF Rule Group | 1TB Free Tier + WAF Web ACL ($5/mo) | ~$6.00 |
| **Networking & Telemetry** | 1x ALB + 1x NAT Gateway + CloudWatch Logs | ALB base + NAT Gateway data processing | ~$35.00 |
| **TOTAL ESTIMATED MONTHLY** | **AWS Serverless & Graviton Model** | **Production-Grade Infrastructure** | **~$270 – $280 / month** |

#### 7.2. Traditional Dedicated Architecture vs. Proposed AWS Model:

| Comparison Metric | Traditional Dedicated Model (24/7 x86 EC2) | Proposed AWS Model (Serverless & Graviton) | Optimization Level |
| :--- | :--- | :--- | :--- |
| **Compute Efficiency** | Servers run at 100% capacity overnight | Fargate scales dynamically during office hours | **~73% Savings** |
| **Vector Store Efficiency** | Expensive, power-hungry x86 Intel/AMD nodes | AWS Graviton3 ARM64 optimizes price-performance | **~25% Savings** |
| **Document Storage** | Fixed-capacity expensive EBS block drives | S3 Standard paired with automated S3 Glacier lifecycle | **~80% Savings** |
| **Maintenance & Operations** | Dedicated DevOps staff required for OS patching | Fully managed services (RDS, Fargate) automate patching | **Substantial reduction in human operational overhead** |
| **TOTAL MONTHLY TCO** | **~$600 – $800 / month** | **~$240 – $280 / month** | **~65% – 70% Overall Savings** |

---

### 8. Full Alignment with the 6 Pillars of the AWS Well-Architected Framework

1.  **Operational Excellence**: Infrastructure provisioned as code (IaC); automated testing and deployment pipelines managed through GitHub Actions and Amazon ECR; centralized telemetry with CloudWatch and AWS X-Ray.
2.  **Security (Zero-Trust Model)**: Complete network isolation of databases in Isolated Subnets; IAM least-privilege policies separating Execution and Task roles; end-to-end encryption at-rest and in-transit via AWS KMS and TLS 1.3.
3.  **Reliability**: Dual-AZ distribution across 2 Availability Zones; automated failover with RDS Multi-AZ and ElastiCache; self-healing container task recovery on ECS Fargate.
4.  **Performance Efficiency**: Matrix-optimized **AWS Graviton3 ARM64** processors for Qdrant Vector DB; in-memory caching via ElastiCache Redis; edge caching via CloudFront CDN.
5.  **Cost Optimization**: Pay-as-you-go serverless billing eliminating idle runtime waste; automated S3 Lifecycle tiering transitioning stale files to S3 Glacier.
6.  **Sustainability (Green Cloud)**: Adopting **AWS Graviton3** chips reduces energy consumption by **up to 60%** compared to equivalent x86 instances, while serverless computing eliminates idle server carbon footprints.

---

### 9. Implementation Roadmap & Quality Verification Metrics (KPIs)

*   **5-Phase Cloud Deployment Roadmap**:
    1.  *Phase 1 (Networking & Security Baseline)*: Provision VPC `10.0.0.0/16`, configure Public/Private/Isolated Subnets across 2 AZs, establish Security Groups and VPC Endpoints.
    2.  *Phase 2 (Storage & Database Infrastructure)*: Set up KMS-encrypted S3 Document Lake, provision RDS PostgreSQL Multi-AZ, and launch Graviton EC2 for Qdrant.
    3.  *Phase 3 (Compute Tier Packaging & Rollout)*: Build Docker containers for FastAPI and Celery Worker, push to Amazon ECR, configure ECS Task Definitions, and launch ECS Fargate behind ALB.
    4.  *Phase 4 (Frontend & Edge Distribution)*: Deploy React build to Amazon S3, configure CloudFront CDN distribution, bind ACM SSL certificates, and activate AWS WAF rules.
    5.  *Phase 5 (End-to-End Verification & Benchmarking)*: Ingest sample internal enterprise regulations and policies; validate recursive cross-reference resolution and measure latency under load.
*   **Target Key Performance Indicators (KPIs)**:
    *   **Context Precision**: Over **95%** accuracy in retrieving correct internal policy clauses.
    *   **Filter Accuracy**: Over **98%** precision in Self-Query extraction of metadata filters.
    *   **Cross-Reference Resolution Rate**: Over **95%** success rate in autonomously fetching cross-statutory citations.
    *   **Response Latency (TTFT)**: Time to First Token under **2.5 seconds** for streaming output.
    *   **Service Uptime SLA**: Guaranteed **99.9%** availability powered by Multi-AZ infrastructure.