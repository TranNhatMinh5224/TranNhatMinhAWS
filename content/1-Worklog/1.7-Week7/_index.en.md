---
title: "Worklog Week 7"
date: 2026-09-14
weight: 7
chapter: false
pre: " <b> 1.7. </b> "
---

### 1. Technical Objectives - Week 7
* **Standardized Multi-Stage Docker Builds:** Design lean Dockerfiles for the core components of NexusDoc AI (FastAPI Web Service, Celery Ingestion Worker, and Next.js Standalone Frontend), maximizing layer caching and minimizing image footprints.
* **Amazon Elastic Container Registry (ECR) Management:** Provision private ECR repositories, configure IAM fine-grained push/pull authentication, enable automated vulnerability scanning on push, and establish Lifecycle Policies to purge untagged images.
* **AWS Elastic Container Service (ECS) Orchestration:** Compare AWS Fargate (Serverless compute) vs EC2 Launch Types; formulate Task Definitions defining CPU/Memory limits, container networking, and CloudWatch log drivers (`awslogs`).
* **Decoupled Asynchronous Worker Architecture:** Implement an asynchronous microservices pipeline separating the interactive FastAPI Web API from the Celery Background Ingestion Worker via a Redis Message Broker to prevent long-running OCR/Embedding operations from blocking user HTTP requests.

---

### 2. Detailed Technical Log

| Day | Technical Deep-Dive Focus | Start Date | End Date | References & Documentation | Deliverables & Milestones |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Mon** | **Containerization Principles & AWS ECS Architecture**<br>- Analyzed Docker Engine primitives: Linux namespaces, cgroups, and overlay2 storage drivers.<br>- Compared AWS ECS entities: Clusters, Task Definitions, Tasks, and Services.<br>- Selected compute model: AWS Fargate for Web API and Frontend (serverless auto-management), dedicated EC2 capacity for heavy AI ingestion workers. | 14/09/2026 | 14/09/2026 | • [Amazon ECS Concepts & Architecture](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)<br>• [AWS Fargate vs EC2 Launch Type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html) | - Microservices container topology documentation for NexusDoc AI.<br>- Compute allocation matrix defining CPU/RAM ratios per service. |
| **Tue** | **Multi-Stage Dockerfile Engineering & Size Optimization**<br>- Backend/Worker: Implemented multi-stage build on `python:3.11-slim`, pre-building wheel dependencies for `paddleocr`, `opencv-python-headless`, and `sentence-transformers`, discarding compilers (`gcc`, `g++`) from the final runtime stage.<br>- Frontend: Applied Next.js standalone output, shrinking image size from 1.2GB to 145MB.<br>- Ran Trivy security scans locally before pushing images. | 15/09/2026 | 15/09/2026 | • [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)<br>• [Next.js Output Standalone Mode](https://nextjs.org/docs/advanced-features/output-file-tracing) | - Production `Dockerfile.backend` (1.1GB, reduced from 4.8GB).<br>- `Dockerfile.frontend` (145MB).<br>- Functional `docker-compose.local.yml` for unified local staging. |
| **Wed** | **Amazon ECR Repositories & Automated Push Pipelines**<br>- Created 2 private ECR repositories: `nexusdoc-backend` and `nexusdoc-frontend`.<br>- Applied ECR Lifecycle Policies: Retain only the 5 most recent images tagged `release-*`, expire untagged images after 7 days to eliminate hidden S3 storage costs.<br>- Enabled automated CVE vulnerability scanning on push via AWS Inspector. | 16/09/2026 | 16/09/2026 | • [Amazon ECR User Guide](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html)<br>• [Amazon ECR Lifecycle Policies](https://docs.aws.amazon.com/AmazonECR/latest/userguide/LifecyclePolicies.html) | - 2 Private ECR repositories configured with fine-grained IAM push policies.<br>- Shell automation scripts authenticating Docker CLI against AWS ECR tokens. |
| **Thu** | **ECS Task Definition Modeling & CloudWatch Logging**<br>- Formulated JSON Task Definitions for Backend: 1 vCPU, 4GB RAM (sufficient for BAAI/bge-m3 embedding weight residency).<br>- Parameterized Container Definitions: Injected production database credentials securely from AWS Secrets Manager.<br>- Configured `awslogs` driver sending stdout/stderr to CloudWatch Log Group `/ecs/nexusdoc-backend`. | 17/09/2026 | 17/09/2026 | • [Amazon ECS Task Definitions](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html)<br>• [Using AWS Secrets in ECS Task Definitions](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-secrets.html) | - `task-definition-backend.json` and `task-definition-frontend.json`.<br>- Configured `ecsTaskExecutionRole` with `AmazonECSTaskExecutionRolePolicy`. |
| **Fri** | **ECS Cluster Provisioning, Service Deployment & Health Verifications**<br>- Provisioned ECS Cluster `nexusdoc-cluster-prod` configured with AWS Fargate capacity providers.<br>- Deployed ECS Service `nexusdoc-backend-service` attached directly to the Layer 7 ALB Target Group created in Week 6.<br>- Configured Rolling Updates (Min Healthy: 100%, Max: 200%) ensuring Zero-Downtime deployment.<br>- Verified traffic: Tasks transitioned to RUNNING, passed ALB health checks, and accepted live traffic. | 18/09/2026 | 18/09/2026 | • [Creating Amazon ECS Services](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_services.html)<br>• [Cloud Journey Containers Module](https://cloudjourney.awsstudygroup.com/) | - ECS Service running continuously across 2 Availability Zones.<br>- ALB endpoint `/api/v1/health` returning HTTP 200 OK from ECS tasks.<br>- CloudWatch Logs aggregating application metrics seamlessly. |

---

### 3. Key AWS CLI Execution & Configurations

#### Amazon ECR Management & Container Image Push
```bash
# 1. Authenticate Docker CLI to Amazon ECR
aws ecr get-login-password --region ap-southeast-1 | \
    docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com

# 2. Create Private ECR Repository with Scan-on-Push
aws ecr create-repository \
    --repository-name nexusdoc-backend \
    --image-scanning-configuration scanOnPush=true \
    --region ap-southeast-1

# 3. Tag and Push Image to ECR
docker tag nexusdoc-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/nexusdoc-backend:v1.0.0
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/nexusdoc-backend:v1.0.0
```

#### ECS Task Definition Registration & Service Deployment
```bash
# 1. Register Task Definition
aws ecs register-task-definition \
    --cli-input-json file://task-definition-backend.json

# 2. Deploy ECS Service linked to ALB Target Group
aws ecs create-service \
    --cluster nexusdoc-cluster-prod \
    --service-name nexusdoc-backend-service \
    --task-definition nexusdoc-backend:1 \
    --desired-count 2 \
    --launch-type FARGATE \
    --platform-version LATEST \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-0789app1a,subnet-0abcdefapp1b],securityGroups=[sg-0ec2backend],assignPublicIp=DISABLED}" \
    --load-balancers targetGroupArn=<BACKEND_TG_ARN>,containerName=fastapi-backend,containerPort=8000 \
    --health-check-grace-period-seconds 120
```

---

### 4. Technical Troubleshooting & Root Cause Analysis

#### Incident 1: Container Termination with Exit Code 137 (OOMKilled)
* **Symptom:** ECS Tasks repeatedly failed and transitioned to `STOPPED (OutOfMemoryException: Container killed due to memory usage)` roughly 20 seconds after launch.
* **Root Cause Analysis (RCA):** The initial Task Definition allocated only `1024MB` (1GB) of memory. Loading the `BAAI/bge-m3` embedding model into RAM requires approximately 2.4GB during startup, triggering the Linux kernel Out-Of-Memory killer (SIGKILL, exit code 137).
* **Remediation:** Updated the Task Definition memory allocation to `4096MB` (4GB) with 1 vCPU. Created revision `nexusdoc-backend:2` and deployed the updated task. Container memory settled at 58% utilization (~2.3GB) under steady state.

#### Incident 2: Slow Docker Builds and Image Bloat (4.8GB)
* **Symptom:** Docker image build times exceeded 18 minutes on local runners due to recompiling C-extensions for `paddleocr` and `torch`, producing an unmanageable 4.8GB image that delayed deployment cycles.
* **Root Cause Analysis (RCA):** Single-stage builds retained compilation dependencies, intermediate build artifacts, and pip wheel caches in the final image layer.
* **Remediation:** Refactored into a Multi-stage Dockerfile: a build stage compiles binary wheels into `/wheels`, while a clean `python:3.11-slim` runner stage installs only the pre-compiled wheels with `--no-cache-dir`. Final image size dropped by 77% down to 1.1GB, and subsequent build times dropped below 3 minutes thanks to Docker BuildKit layer reuse.

---

### 5. Summary & Key Outcomes - Week 7
* Standardized enterprise container delivery pipelines utilizing lean multi-stage Docker builds and automated vulnerability scanning on Amazon ECR.
* Successfully orchestrated container workloads via AWS ECS Fargate, abstracting physical host maintenance and ensuring resilient multi-AZ deployment.
* Unified container telemetry and logging via CloudWatch Container Insights, enabling fine-grained operational visibility into AI inference workloads.
