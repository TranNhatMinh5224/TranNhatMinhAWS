---
title: "Resource Teardown & Cleanup"
date: 2026-08-25
weight: 7
chapter: false
pre: " <b> 5.7. </b> "
aliases:
  - /5-workshop/5.7-cleanup/
  - /5-Workshop/5.7-cleanup/
  - /5-workshop/5.6-cleanup/
  - /5-Workshop/5.6-cleanup/
---

# 5.7. Resource Teardown & Cost Optimization

### Lab 5.7 Overview

Upon completing the practical implementation and validation phases of the **Enterprise Knowledge AI RAG Assistant** on AWS, de-provisioning active cloud infrastructure is an essential best practice:
* **Cost Optimization**: Eliminates ongoing runtime charges for compute and networking resources (EC2 instances, Application Load Balancers, RDS instances, etc.).
* **Infrastructure Health & Cleanliness**: Follows strict dependency hierarchies to avoid orphaned assets and lingering Elastic Network Interface (ENI) attachments.

---

### Standard Dependency Teardown Order:

```
[1. Load Balancer & Target Groups]
               │
               ▼
[2. Compute EC2 Instance]
               │
               ▼
[3. Amazon RDS PostgreSQL & Subnet Group]
               │
               ▼
[4. AWS Secrets Manager & Amazon ECR]
               │
               ▼
[5. Amazon S3 Data Lake & IAM Roles/Users]
               │
               ▼
[6. Security Groups & VPC Networking (IGW, Subnets, VPC)]
```

---

## 5.7.1. Step-by-Step AWS Management Console Guide

### Step 1: Delete Application Load Balancer & Target Groups
1. Open **EC2 Management Console** → select **Load Balancers** from the left navigation panel.
2. Select Load Balancer **`rag-lb`** → click **Actions** → select **Delete load balancer** → confirm deletion.
3. Switch to **Target Groups** → select **`rag-backend-tg`** and **`rag-frontend-tg`** → click **Actions** → select **Delete**.

> [!NOTE]
> Deleting the Load Balancer first releases the Elastic Network Interfaces (ENIs) provisioned across your Public Subnets.

---

### Step 2: Terminate Amazon EC2 RAG Server
1. Navigate to **EC2 Management Console** → **Instances**.
2. Select the compute instance **`enterprise-rag-server`** (`i-0e3f096f3de681aaa`).
3. Click **Instance state** → select **Terminate instance** → confirm **Terminate**.
4. The attached root EBS storage volume will automatically be deleted according to its `Delete on Termination` policy.

---

### Step 3: Delete Amazon RDS PostgreSQL Database
1. Open **RDS Management Console** → select **Databases**.
2. Select database instance **`rag-db`**.
3. Click **Actions** → select **Delete**.
4. In the confirmation dialog:
   * Uncheck **Create final snapshot** (to avoid recurring snapshot storage fees if retaining data is unnecessary).
   * Uncheck **Retain automated backups**.
   * Type the confirmation phrase `delete me` → click **Delete**.
5. Once the DB instance finishes deletion, navigate to **Subnet groups** → select **`rag-db-subnet-group`** → click **Delete**.

---

### Step 4: Delete Secrets Manager & Amazon ECR Repositories
1. **AWS Secrets Manager**:
   * Open **Secrets Manager Console** → select secret **`rag/production/credentials`**.
   * Click **Actions** → select **Delete secret** → check **Delete immediately without recovery** (if recovery is not required) → confirm **Delete**.
2. **Amazon ECR (Elastic Container Registry)**:
   * Open **Amazon ECR Console** → **Private registry** → **Repositories**.
   * Select repository **`enterprise-rag-backend`** → click **Delete** → type `delete` to confirm deleting all container image tags.
   * Repeat the exact deletion for repository **`enterprise-rag-frontend`**.

---

### Step 5: Empty and Delete Amazon S3 Bucket
1. Open **Amazon S3 Console** → select bucket **`enterprise-rag-storage-0117967`**.
2. Click **Empty** → type `permanently delete` to delete all objects and prefixes (`draff/`, `real/`).
3. Once empty, click **Delete** → type bucket name `enterprise-rag-storage-0117967` to permanently remove the bucket.

---

### Step 6: Delete Security Groups & VPC Networking
1. **Security Groups**:
   * Open **VPC Console** → **Security Groups**.
   * Select and delete: **`rag-rds-sg`**, **`rag-ec2-sg`**, **`rag-alb-sg`**.
2. **VPC Endpoints**:
   * Open **Endpoints** → select the S3 Gateway Endpoint → click **Actions** → **Delete VPC endpoint**.
3. **Internet Gateway**:
   * Open **Internet Gateways** → select **`rag-igw`** → click **Actions** → **Detach from VPC** → click **Actions** → **Delete internet gateway**.
4. **VPC**:
   * Open **Your VPCs** → select **`rag-vpc`** (`vpc-03228d0b15b9ea7be`).
   * Click **Actions** → select **Delete VPC**. AWS will automatically clean up all 4 associated subnets and route tables.

---

## 5.7.2. Automated Teardown with AWS CLI

For rapid teardown via the AWS CLI terminal, execute the following sequential commands:

```bash
# 1. Delete Application Load Balancer
ALB_ARN=$(aws elbv2 describe-load-balancers --names "rag-lb" --query "LoadBalancers[0].LoadBalancerArn" --output text)
aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN

# 2. Delete Target Groups
TG_BACKEND=$(aws elbv2 describe-target-groups --names "rag-backend-tg" --query "TargetGroups[0].TargetGroupArn" --output text)
TG_FRONTEND=$(aws elbv2 describe-target-groups --names "rag-frontend-tg" --query "TargetGroups[0].TargetGroupArn" --output text)
aws elbv2 delete-target-group --target-group-arn $TG_BACKEND
aws elbv2 delete-target-group --target-group-arn $TG_FRONTEND

# 3. Terminate EC2 RAG Server
aws ec2 terminate-instances --instance-ids "i-0e3f096f3de681aaa"

# 4. Delete RDS PostgreSQL instance
aws rds delete-db-instance \
  --db-instance-identifier "rag-db" \
  --skip-final-snapshot \
  --delete-automated-backups

# 5. Delete Secrets Manager credentials
aws secretsmanager delete-secret \
  --secret-id "rag/production/credentials" \
  --force-delete-without-recovery

# 6. Force-delete ECR repositories
aws ecr delete-repository --repository-name "enterprise-rag-backend" --force
aws ecr delete-repository --repository-name "enterprise-rag-frontend" --force

# 7. Empty and delete S3 Bucket
aws s3 rm s3://enterprise-rag-storage-0117967 --recursive
aws s3api delete-bucket --bucket enterprise-rag-storage-0117967 --region ap-southeast-1
```

---

### Workshop 5 Concluding Remarks

Congratulations on successfully completing **Workshop 5: Enterprise Knowledge AI RAG Assistant on AWS**!

Across Labs **5.1** through **5.6**, you have implemented end-to-end cloud engineering best practices:
* Multi-AZ VPC network architecture with public/private tiering and least-privilege security groups.
* Hybrid storage architectures spanning **Amazon S3**, KMS-encrypted **Amazon RDS PostgreSQL**, and **Qdrant Vector Database**.
* Automated containerization with **Amazon ECR** and **GitHub Actions CI/CD**.
* Compute scalability and intelligent path routing with **Amazon EC2** and **Application Load Balancer (ALB)**.
* Strict hallucination guardrails and unified telemetry observability via **Amazon CloudWatch Metrics**.
