---
title: "Environment Preparation & Zero-Trust VPC Infrastructure"
date: 2026-08-25
weight: 1
chapter: false
pre: " <b> 4.1. </b> "
aliases:
  - /4-workshop/4.1-vpc-network/
  - /4-Workshop/4.1-vpc-network/
---

# 4.1. Environment Preparation & Zero-Trust VPC Infrastructure

### Lab Overview

In the **Enterprise Knowledge AI RAG Assistant** architecture, network infrastructure serves as the primary perimeter defense, protecting internal corporate document repositories, vector indices, and backend AI services from unauthorized external threats.

Lab 4.1 focuses on building an isolated cloud networking environment adhering strictly to **Zero-Trust Network Architecture** and **Multi-AZ (Multi-Availability Zone)** principles to ensure High Availability (HA) and Fault Tolerance.

---

### Module Content:

1. [**4.1.1. Multi-AZ VPC Provisioning & Subnet Segmentation**](#411-multi-az-vpc-provisioning--subnet-segmentation)
2. [**4.1.2. Security Groups & IAM Role Configuration**](#412-security-groups--iam-role-configuration) *(In progress)*
3. [**4.1.3. Amazon S3 Document Lake Provisioning & Encryption**](#413-amazon-s3-document-lake-provisioning--encryption) *(In progress)*

---

## 4.1.1. Multi-AZ VPC Provisioning & Subnet Segmentation

### 1. Technical Objectives
* Provision a dedicated **Virtual Private Cloud (VPC)** with IPv4 address space `10.0.0.0/16` (providing 65,536 private IP addresses) in Asia Pacific (**ap-southeast-1 - Singapore**).
* Architect a **Multi-AZ** network layout spanning 2 Availability Zones (`ap-southeast-1a` and `ap-southeast-1b`).
* Isolate security boundaries into two distinct subnet tiers:
  * **Public Subnet Tier**: Ingests traffic from internet clients via an Internet Gateway (IGW) to the Application Load Balancer (ALB).
  * **Private Subnet Tier**: Houses core workloads (RAG FastAPI Backend, Next.js Frontend, Qdrant Vector Engine, RDS PostgreSQL), fully shielded from inbound public internet.
* Attach a **VPC Gateway Endpoint for Amazon S3** (`project-vpce-s3`) allowing private subnet workloads to access document storage over AWS internal backbones without incurring NAT data transfer fees.

---

### 2. Network CIDR Allocation Table

| Resource Name | Subnet Type | Availability Zone (AZ) | IPv4 CIDR Block | Usable IPs | Assigned Service / Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MyProjectVPC** | VPC | ap-southeast-1 | `10.0.0.0/16` | 65,531 | Overall isolated virtual cloud network |
| **project-subnet-public1-ap-southeast-1a** | Public | ap-southeast-1a | `10.0.0.0/20` | 4,091 | ALB Listener node 1, Bastion host |
| **project-subnet-public2-ap-southeast-1b** | Public | ap-southeast-1b | `10.0.16.0/20` | 4,091 | ALB Listener node 2 (High Availability) |
| **project-subnet-private1-ap-southeast-1a** | Private | ap-southeast-1a | `10.0.128.0/20` | 4,091 | RAG Server (EC2 App, FastAPI, Next.js) |
| **project-subnet-private2-ap-southeast-1b** | Private | ap-southeast-1b | `10.0.144.0/20` | 4,091 | RDS Database Subnet Group, Qdrant Node |

> [!NOTE]
> AWS reserves 5 IP addresses in each subnet: Network address (.0), VPC Router (.1), DNS Server (.2), Future use (.3), and Broadcast (.255). Therefore, a `/20` prefix yields 4,091 usable IPs.

---

### 3. Step-by-Step Implementation & Live Evidence

#### Step 1: Select Target AWS Region
Before creating resources, verify the active console region is set to **Asia Pacific (Singapore) - `ap-southeast-1`** for optimal low-latency connectivity (RTT < 40ms from Vietnam).

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.1-region.png" alt="Select AWS Region Singapore ap-southeast-1" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 50%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.1.1: Selected Region ap-southeast-1 (Singapore) in the AWS Management Console navigation bar</em></p>
</div>

---

#### Step 2: Provision VPC using "VPC and more"
1. Navigate to **VPC Dashboard** → Click **Create VPC**.
2. Select configuration mode: **VPC and more** (creates interconnected VPC, Subnets, Route Tables, Internet Gateway, and Endpoints in one visual workflow).
3. Configure settings:
   * **Name tag auto-generation**: `project` (or `MyProjectVPC`).
   * **IPv4 CIDR block**: `10.0.0.0/16`.
   * **Number of Availability Zones (AZs)**: `2` (`ap-southeast-1a`, `ap-southeast-1b`).
   * **Number of public subnets**: `2`.
   * **Number of private subnets**: `2`.
   * **NAT Gateways**: `None` (or configured per budget).
   * **VPC Endpoints**: Check **S3 Gateway** (Zero-cost secure S3 connectivity).
   * **DNS Options**: Enable both:
     * `Enable DNS hostnames`
     * `Enable DNS resolution`
4. Click **Create VPC** and wait for the automated workflow to complete.

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.1-create-vpc-workflow.png" alt="Create VPC workflow success verification" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.1.2: Create VPC workflow execution verifying successful creation of all 18 network resources</em></p>
</div>

**Captured Cloud Identifiers:**
* **VPC ID**: `vpc-03228d0b15b9ea7be`
* **Internet Gateway ID**: `igw-0073a2eaacf097953`
* **S3 Gateway Endpoint**: `vpce-0678e967918a415a9`

---

#### Step 3: Verify VPC Resource Map
Inspect the topological Resource Map to confirm infrastructure integrity:
* 4 Subnets symmetrically distributed across 2 Availability Zones (`ap-southeast-1a` and `ap-southeast-1b`).
* Public subnets associated with `project-rtb-public` pointing to Internet Gateway `project-igw`.
* Private subnets associated with `project-rtb-private1` and `project-rtb-private2`, routing S3 traffic directly via `project-vpce-s3`.

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.1-vpc-resource-map.png" alt="VPC Resource Map visual overview" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.1.3: Visual topology diagram of the deployed Enterprise RAG VPC network</em></p>
</div>

---

#### Step 4: Validate Provisioned Subnets
Navigate to **Subnets** in the VPC Console filtered by VPC ID `vpc-03228d0b15b9ea7be`:

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.1-subnets-list.png" alt="List of Subnets in VPC" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.1.4: Validation of all 4 subnets in Available state with accurate CIDR blocks</em></p>
</div>

* Subnet ID Mapping:
  * `project-subnet-public1-ap-southeast-1a`: `subnet-06025e767c9a9773f` (`10.0.0.0/20`)
  * `project-subnet-public2-ap-southeast-1b`: `subnet-0cf27fbea7085c1bd` (`10.0.16.0/20`)
  * `project-subnet-private1-ap-southeast-1a`: `subnet-04cde8fcdfa2085c1` (`10.0.128.0/20`)
  * `project-subnet-private2-ap-southeast-1b`: `subnet-046b6b0378aee9b2a` (`10.0.144.0/20`)

---

#### Step 5: Route Tables Configuration & Verification
Check the Route Tables dashboard:

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.1-route-tables-list.png" alt="List of Route Tables" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.1.5: 4 Route Tables associated with their corresponding subnets and VPC</em></p>
</div>

1. **Public Route Table (`project-rtb-public` - `rtb-0ec121079ba5f5110`)**:
   * Inspect **Routes** tab: `0.0.0.0/0` must point to Internet Gateway `igw-0073a2eaacf097953` with state `Active`.
   * Internal `10.0.0.0/16` routes locally within the VPC.

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.1-public-rtb-routes.png" alt="Public Route Table Routes to Internet Gateway" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.1.6: Public Route Table routes verifying default 0.0.0.0/0 routing to the Internet Gateway</em></p>
</div>

2. **Private Route Tables (`project-rtb-private1-ap-southeast-1a` & `project-rtb-private2-ap-southeast-1b`)**:
   * No `0.0.0.0/0` default route to the IGW.
   * Auto-populated S3 Prefix List route redirecting S3 traffic through `vpce-0678e967918a415a9`.

---

#### Step 6: CLI Verification via Terminal
Verify VPC provisioning status programmatically using the AWS CLI:

```bash
aws ec2 describe-vpcs \
  --region ap-southeast-1 \
  --query "Vpcs[].{VpcId:VpcId,Cidr:CidrBlock,State:State}" \
  --output table
```

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.1-cli-vpc-verify.png" alt="VPC Status Verification via AWS CLI" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.1.7: AWS CLI query confirming VPC vpc-03228d0b15b9ea7be is active and available</em></p>
</div>

* Live terminal response:
```text
---------------------------------------------------------
|                     DescribeVpcs                      |
+--------------+------------+---------------------------+
|     Cidr     |   State    |           VpcId           |
+--------------+------------+---------------------------+
|  10.0.0.0/16 |  available |  vpc-03228d0b15b9ea7be    |
+--------------+------------+---------------------------+
```

---

---

## 4.1.2. Security Groups & IAM Role Configuration

### 1. Technical Objectives
* Design a multi-layered (**Defense-in-Depth / Zero-Trust**) network security model using **Security Groups (Stateful Firewalls)** to tightly govern inbound and outbound traffic across service tiers.
* Enforce strict isolation: Relational Databases (RDS PostgreSQL) and Vector Stores (Qdrant) only accept direct ingress connections from the application tier (EC2 RAG Server), blocking any public internet routing.
* Provision an **IAM Role `EC2-S3-RAG`** following the **Principle of Least Privilege**, allowing the EC2 server to securely interact with Amazon S3 and Amazon ECR via AWS Security Token Service (STS) without embedding static credentials in code.

---

### 2. Zero-Trust Security Group Matrix

| Security Group Name | Target Workload | Inbound Rules (Port / Protocol) | Allowed Source | Architectural Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **rag-alb-sg** | Application Load Balancer | Port 80 (HTTP)<br>Port 443 (HTTPS) | `0.0.0.0/0` (Internet) | Public client ingress endpoint |
| **rag-ec2-sg**<br>(`sg-0c1e9bf71b2ec5149`) | EC2 RAG App Server<br>(`enterprise-rag-server`) | Port 22 (SSH)<br>Port 3000 (Next.js)<br>Port 8000 (FastAPI)<br>Port 6333 (Qdrant) | My IP / Personal IP<br>`rag-alb-sg` / VPC CIDR<br>`rag-alb-sg` / VPC CIDR<br>VPC CIDR (`10.0.0.0/16`) | Secure terminal administration<br>Frontend web UI access<br>FastAPI RAG Inference Engine<br>Internal Qdrant vector queries |
| **rag-rds-sg**<br>(`sg-0e06a5a9265f5c77d`) | Amazon RDS PostgreSQL<br>(`rag-db`) | Port 5432 (PostgreSQL) | **`rag-ec2-sg` strictly** | Database isolation, restricted to RAG Server |

> [!IMPORTANT]
> **Security Group Chaining Principle**: By referencing `rag-ec2-sg` directly in the ingress rule of `rag-rds-sg` instead of hardcoding IP addresses, database access remains securely tethered even if the EC2 instance IP dynamically changes across reboots or auto-scaling cycles.

---

### 3. Step-by-Step Implementation & Live Evidence

#### Step 1: Survey and Create Security Groups
Navigate to **EC2 Console** → **Security Groups** filtered by VPC `vpc-03228d0b15b9ea7be`:

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.2-security-groups-list.png" alt="Security Groups Overview" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.2.1: Summary of Security Groups protecting each architectural tier within the VPC</em></p>
</div>

* Key Security Group IDs:
  * `rag-ec2-sg`: ID `sg-0c1e9bf71b2ec5149` (Protects RAG application compute node).
  * `rag-rds-sg`: ID `sg-0e06a5a9265f5c77d` (Protects relational PostgreSQL database).

---

#### Step 2: Configure Inbound Rules for RAG Server (`rag-ec2-sg`)
1. Select `rag-ec2-sg` → Open **Inbound rules** tab → Click **Edit inbound rules**.
2. Specify ports required for the RAG Assistant stack:
   * **Port 22 (SSH)**: Scoped to administrator personal IP for secure terminal access.
   * **Port 3000 (Custom TCP)**: Open for Next.js Web Frontend.
   * **Port 8000 (Custom TCP)**: Open for FastAPI RAG Core Backend API.
   * **Port 6333 (Custom TCP)**: Open for Qdrant Vector Engine semantic similarity search.

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.2-ec2-sg-inbound-rules.png" alt="Configure Inbound Rules for rag-ec2-sg" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.2.2: Live configuration of Inbound Rules on the EC2 Server Security Group</em></p>
</div>

---

#### Step 3: Configure Inbound Rules for RDS Database (`rag-rds-sg`)
1. Select `rag-rds-sg` (ID: `sg-0e06a5a9265f5c77d`) → Open **Inbound rules** tab.
2. Establish strict access controls on the relational database listener:
   * **Type**: `PostgreSQL`
   * **Protocol**: `TCP`
   * **Port range**: `5432`
   * **Rule ID**: `sgr-0b5ff64975fd5ba9c`
   * **Source**: Scoped strictly to the RAG application tier / authorized admin subnet, fully blocking untrusted internet ingress.

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.2-rds-sg-inbound-rules.png" alt="Configure Inbound Rules for rag-rds-sg" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.2.3: Verification of Port 5432 Inbound Rule on rag-rds-sg protecting PostgreSQL</em></p>
</div>

---

#### Step 4: Provision IAM Role for EC2 Server
1. Navigate to **IAM Console** → **Roles** → Click **Create role**.
2. Under **Trusted entity type**, select **AWS service**.
3. Under **Use case**, select **EC2** (Allows EC2 instances to call AWS services on your behalf).

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.2-iam-role-select-service.png" alt="Select EC2 Use Case in IAM Role" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.2.4: Selecting Trusted entity type AWS service with EC2 use case</em></p>
</div>

4. Set Role name to **`EC2-S3-RAG`**, description to `role cho EC2 cua du an RAG`.
5. Verify Trust Policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sts:AssumeRole"
            ],
            "Principal": {
                "Service": [
                    "ec2.amazonaws.com"
                ]
            }
        }
    ]
}
```

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.2-iam-role-name-trust-policy.png" alt="Name and Verify IAM Role Trust Policy" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.2.5: Naming role EC2-S3-RAG and inspecting Trust Policy relationships</em></p>
</div>

---

#### Step 5: Attach Permission Policies
To support end-to-end RAG ingestion and automated CI/CD container pulls, attach two AWS Managed Policies:
1. **`AmazonS3FullAccess`**: Provides read/write access to Document Lake S3 (`enterprise-rag-storage-0117967`) for Celery Worker & FastAPI pipelines.
2. **`AmazonEC2ContainerRegistryReadOnly`**: Authorizes Docker on EC2 to authenticate and pull container images from Amazon ECR without static keys.

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.2-iam-role-s3-policy.png" alt="Attach AmazonS3FullAccess Policy" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.2.6: Attaching S3 Document Lake access permissions to the IAM Role</em></p>
</div>

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.2-iam-role-completed-policies.png" alt="Completed IAM Role Permission Policies" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.2.7: Verification banner showing AmazonS3FullAccess and AmazonEC2ContainerRegistryReadOnly attached</em></p>
</div>

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.2-iam-roles-list.png" alt="IAM Roles List in Console" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.2.8: IAM Role EC2-S3-RAG active in the IAM Roles directory</em></p>
</div>

---

#### Step 6: Attach IAM Role to EC2 Server (`enterprise-rag-server`)
1. Navigate to **EC2 Console** → **Instances** → Select `enterprise-rag-server` (`i-0e3f096f3de681aaa`).
2. Click **Actions** → **Security** → **Modify IAM role**.
3. Under **IAM role**, select **`EC2-S3-RAG`**.
4. Click **Update IAM role** to save.

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.2-attach-iam-role-to-ec2.png" alt="Attach IAM Role to EC2 Instance" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.2.9: Successfully attaching EC2-S3-RAG to the instance profile via the Modify IAM role modal</em></p>
</div>

---

## 4.1.3. Amazon S3 Document Lake Provisioning & Encryption

### 1. Technical Objectives
* Provision an **Amazon S3 Bucket** to serve as the unified unstructured Data Lake for all enterprise knowledge files (PDF policies, DOCX contracts, TXT files).
* Enforce cloud data privacy by enabling **Block Public Access (100% Private)** and encrypting data at rest using **Server-Side Encryption (SSE-S3 / AES-256)**.
* Establish a multi-stage folder prefix structure:
  * `documents/draff/` (or `draft/`): Staging area for freshly uploaded files pending preprocessing.
  * `documents/real/`: Production repository for indexed documents embedded into Qdrant.

---

### 2. S3 Document Lake Specifications

| Property | Configured Value | Security & Architectural Rationale |
| :--- | :--- | :--- |
| **Bucket Name** | `enterprise-rag-storage-0117967` | Globally unique namespace identifier |
| **AWS Region** | `ap-southeast-1` (Singapore) | Co-located with VPC and compute nodes for low-latency endpoint routing |
| **Block Public Access** | **On (Block ALL public access)** | Prevents any accidental public exposure of corporate knowledge |
| **Bucket Versioning** | Disabled / Suspended | Storage cost optimization |
| **Default Encryption** | **SSE-S3 (AES-256)** | Automatic hardware-accelerated encryption at rest |
| **Bucket Policy / Endpoint** | Restricted to VPC Endpoint | Strictly accessible via internal Gateway Endpoint `vpce-0678e967918a415a9` |

---

### 3. Step-by-Step Implementation & Live Evidence

#### Step 1: Create S3 Bucket via AWS Console
1. Navigate to **Amazon S3 Console** → Click **Create bucket**.
2. Configure settings:
   * **Bucket name**: `enterprise-rag-storage-0117967`.
   * **AWS Region**: `Asia Pacific (Singapore) ap-southeast-1`.
   * **Object Ownership**: ACLs disabled (recommended).
   * **Block Public Access settings**: Check `Block all public access`.
   * **Default encryption**: SSE-S3, Bucket Key: Enable.
3. Click **Create bucket**.

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.3-s3-bucket-created.png" alt="Successfully created S3 Bucket enterprise-rag-storage-0117967" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.3.1: AWS Management Console confirmation banner for bucket enterprise-rag-storage-0117967</em></p>
</div>

---

#### Step 2: Validate Block Public Access Configuration (100% Private)
Navigate to the **Permissions** tab of bucket `enterprise-rag-storage-0117967`:
* **Block all public access**: Confirmed **`On`**.
* This policy shields all corporate internal knowledge assets from unauthorized public discovery.

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.3-s3-block-public-access.png" alt="Validate S3 Block Public Access" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.3.2: Verification of Block all public access: On on the S3 Permissions dashboard</em></p>
</div>

---

#### Step 3: Configure Multi-Stage Prefix Folder Structure
Open the **Objects** tab of bucket `enterprise-rag-storage-0117967` to verify operational folders:
* `draff/`: Temporary landing folder for newly uploaded documents undergoing chunking.
* `real/`: Production repository containing clean documents whose vector embeddings are indexed in Qdrant.

<div align="center">
  <img src="/images/4-Workshop/4.1/4.1.3-s3-folder-structure.png" alt="S3 Prefix Folder Structure" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 4.1.3.3: Hierarchical prefix structure showing draff/ and real/ folders for RAG ingestion</em></p>
</div>

---

#### Step 4: Validate S3 Access from EC2 via IAM Instance Profile
Connect via SSH to `enterprise-rag-server` and verify bucket accessibility:

```bash
# List all buckets in the account
aws s3 ls

# Inspect contents within the Document Lake bucket
aws s3 ls s3://enterprise-rag-storage-0117967/
```

* Live verification confirming credential-less access:
```text
2026-09-13 16:20:15 enterprise-rag-storage-0117967
PRE draff/
PRE real/
```

---

### Lab 4.1 Summary:
With Lab 4.1 complete, the core **Zero-Trust Enterprise** cloud foundation is operational:
1. **Multi-AZ VPC** `10.0.0.0/16` provides network perimeter isolation across 2 availability zones.
2. **Security Groups** and **IAM Role** `EC2-S3-RAG` enforce least-privilege access and eliminate hard-coded secrets.
3. **S3 Document Lake** `enterprise-rag-storage-0117967` securely stores enterprise documents, linked via internal VPC Gateway Endpoint.

Next Module: **Lab 4.2: Deploying Data Layer & Vector Database (RDS PostgreSQL & Qdrant)**.


---

### Lab 4.1 Summary:
With Lab 4.1 complete, the core **Zero-Trust Enterprise** cloud foundation is operational:
1. **Multi-AZ VPC** `10.0.0.0/16` provides network perimeter isolation across 2 availability zones.
2. **Security Groups** and **IAM Role** `EC2-S3-RAG` enforce least-privilege access and eliminate hard-coded secrets.
3. **S3 Document Lake** `enterprise-rag-storage-0117967` securely stores enterprise documents, linked via internal VPC Gateway Endpoint.

Next Module: **Lab 4.2: Deploying Data Layer & Vector Database (RDS PostgreSQL & Qdrant)**.

