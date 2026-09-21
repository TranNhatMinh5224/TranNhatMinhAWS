---
title: "Containerizing Applications & Pushing Images to Amazon ECR"
date: 2026-08-25
weight: 3
chapter: false
pre: " <b> 4.3. </b> "
---

# 4.3. Containerizing Applications & Pushing Images to Amazon ECR

### Lab Overview

To ensure the **Enterprise Knowledge AI RAG Assistant** operates reliably, uniformly, and scales seamlessly across environments, containerizing all service components with **Docker** is an industry standard.

Lab 4.3 focuses on modern DevOps automation workflows:
1. Setting up an **IAM Service User (`github-action`)** for programmatic CI/CD authentication.
2. Provisioning private container repositories on **Amazon Elastic Container Registry (Amazon ECR)** for both Backend and Frontend.
3. Constructing an automated **GitHub Actions CI/CD Pipeline** to build Docker images, apply release tags, and push artifacts to the cloud registry.

---

### Module Content:

1. [**4.3.1. Provisioning IAM User for CI/CD Automation**](#431-provisioning-iam-user-for-cicd-automation)
2. [**4.3.2. Amazon ECR Private Repositories Provisioning**](#432-amazon-ecr-private-repositories-provisioning)
3. [**4.3.3. Dockerfile Architecture & Automated GitHub Actions Pipeline**](#433-dockerfile-architecture--automated-github-actions-pipeline)

---

## 4.3.1. Provisioning IAM User for CI/CD Automation

### 1. Technical Objectives
* Create a dedicated programmatic **IAM Service User** named **`github-action`**.
* Decouple automated CI/CD processes from root/admin personal identities via Access Keys.
* Safely store credentials inside **GitHub Actions Secrets**, eliminating risk of accidental credential leakage in Git commits.

---

### 2. Step-by-Step Implementation & Live Evidence

#### Step 1: Navigate to IAM Users Console
Open **AWS Management Console** → Navigate to **IAM** → Click **IAM users** in the left navigation menu.

<div align="center">
  <img src="/images/4-Workshop/4.3/4.3.1-iam-users-nav.png" alt="Navigate to IAM Users in AWS Console" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 40%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.3.1.1: IAM Access Management menu selecting IAM users</em></p>
</div>

---

#### Step 2: Create User `github-action`
1. Click **Create user**.
2. Under **User details**, specify name: **`github-action`**.
3. Leave Console access unchecked (programmatic API access only).

<div align="center">
  <img src="/images/4-Workshop/4.3/4.3.1-create-github-action-user.png" alt="Specify username github-action" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.3.1.2: Specifying user name github-action for the CI/CD pipeline</em></p>
</div>

---

#### Step 3: Attach Direct Policies
1. On the **Set permissions** screen, select **Attach policies directly**.
2. Attach **`AdministratorAccess`** (or granular ECR and ECS execution policies).

<div align="center">
  <img src="/images/4-Workshop/4.3/4.3.1-github-action-set-permission.png" alt="Select Attach policies directly" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.3.1.3: Choosing Attach policies directly for the CI/CD user</em></p>
</div>

<div align="center">
  <img src="/images/4-Workshop/4.3/4.3.1-github-action-admin-policy.png" alt="Attach AdministratorAccess to github-action user" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.3.1.4: Granting deployment permissions allowing automated image pushing to Amazon ECR</em></p>
</div>

---

#### Step 4: Finalize User Creation & Generate Access Keys
1. Click **Create user**. The green banner `User created successfully` confirms completion.
2. Open `github-action` → **Security credentials** tab → Click **Create access key**.
3. Select Use case: **Third-party service (GitHub Actions)**.
4. Download the CSV containing **Access Key ID** and **Secret Access Key**.

<div align="center">
  <img src="/images/4-Workshop/4.3/4.3.1-github-action-user-created.png" alt="User created successfully confirmation" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.3.1.5: Confirmation banner confirming user github-action is ready</em></p>
</div>

5. Store these credentials in GitHub Repository Secrets:
   * `AWS_ACCESS_KEY_ID`: `AKIA...`
   * `AWS_SECRET_ACCESS_KEY`: `wJalr...`
   * `AWS_REGION`: `ap-southeast-1`

---

## 4.3.2. Amazon ECR Private Repositories Provisioning

### 1. Technical Objectives
* Provision 2 **Private Repositories** on **Amazon Elastic Container Registry (ECR)** in Singapore (`ap-southeast-1`).
* Manage tag immutability (`Mutable` for `latest` branch rollouts).
* Enable standard **AES-256** encryption to protect container layers at rest.

---

### 2. ECR Repository Specifications

| Repository Name | Workload Tier | Full ECR Repository URI | Tag Mutability | Encryption |
| :--- | :--- | :--- | :--- | :--- |
| **`enterprise-rag-backend`** | FastAPI RAG Engine & Celery Worker | `305068201208.dkr.ecr.ap-southeast-1.amazonaws.com/enterprise-rag-backend` | Mutable | AES-256 |
| **`enterprise-rag-frontend`** | Next.js Modern Web Interface | `305068201208.dkr.ecr.ap-southeast-1.amazonaws.com/enterprise-rag-frontend` | Mutable | AES-256 |

---

### 3. Step-by-Step Implementation & Live Evidence

#### Step 1: Provision Backend ECR Repository
1. Open **Amazon ECR Console** → **Repositories** → Click **Create repository**.
2. Visibility: **Private**.
3. Repository name: **`enterprise-rag-backend`**.
4. Tag mutability: **Mutable**.
5. Encryption configuration: **AES-256**.
6. Click **Create repository**.

<div align="center">
  <img src="/images/4-Workshop/4.3/4.3.2-create-ecr-repository.png" alt="Create Private Repository enterprise-rag-backend" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.3.2.1: Setting up the private ECR repository enterprise-rag-backend</em></p>
</div>

---

#### Step 2: Provision Frontend ECR Repository & Verify Repositories
Repeat the configuration for **`enterprise-rag-frontend`**. Both repositories will be listed in the dashboard:

<div align="center">
  <img src="/images/4-Workshop/4.3/4.3.2-ecr-repositories-list.png" alt="ECR Repositories List" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.3.2.2: Active private repositories enterprise-rag-backend and enterprise-rag-frontend on Amazon ECR</em></p>
</div>

---

## 4.3.3. Dockerfile Architecture & Automated GitHub Actions Pipeline

### 1. Optimized Backend Dockerfile
The backend container is constructed using a lean Python base image:

```dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "src.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### 2. Automated CI/CD Workflow (`.github/workflows/deploy.yml`)
The pipeline runs automatically upon each push to `main`:

```yaml
name: Deploy to Amazon ECR & EC2

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ap-southeast-1

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2

    - name: Build, Tag, and Push Backend Image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: enterprise-rag-backend
        IMAGE_TAG: latest
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -f src/backend/Dockerfile .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

    - name: Trigger EC2 Rolling Deployment
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ubuntu
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 305068201208.dkr.ecr.ap-southeast-1.amazonaws.com
          cd /home/ubuntu/RAG
          docker compose pull
          docker compose up -d
```

---

### Lab 4.3 Summary:
Upon completing Lab 4.3:
1. **IAM Service User `github-action`** is secured with granular permissions and connected to GitHub Secrets.
2. Two **Amazon ECR** private registries (`enterprise-rag-backend`, `enterprise-rag-frontend`) manage container versions.
3. The **CI/CD Pipeline** automatically builds and pushes container images to AWS upon code commits.

Next Module: **Lab 4.4: Deploying Compute Tier & Application Load Balancer (ALB)**.
