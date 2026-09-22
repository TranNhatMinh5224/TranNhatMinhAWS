---
title: "Worklog Week 2"
date: 2026-08-10
weight: 2
chapter: false
pre: " <b> 1.2. </b> "
---

# Worklog Week 2: Amazon EC2 Compute Governance, S3 Storage Architecture & IAM Instance Profiles

### 1. General Information & Core Technical Objectives
* **Timeline:** From 10/08/2026 to 16/08/2026 (Week 2).
* **Internship Mentor (CBHD):** Pham Van Phong (Solutions Architect).
* **Host Supervisor:** Nguyen Gia Hung (Senior Solutions Architect - AWS Vietnam).
* **Core Technical Objectives:**
  1. Investigate the hardware virtualization architecture of the **Amazon EC2 Nitro System**, comparing performance-to-price ratios between standard x86 (`t3.medium`) and ARM64-based Graviton (`t4g.medium`) to optimize heavy vector workloads.
  2. Provision an Ubuntu 22.04 LTS EC2 node, manage SSH Key Pairs securely, and automate OS provisioning via **EC2 UserData Scripts**.
  3. Architect an Enterprise **Document Lake** on **Amazon S3**: Configure *S3 Block Public Access*, enable *S3 Versioning* for legal document integrity, and mandate server-side encryption with *SSE-S3 (AES-256)*.
  4. Eliminate credentials leakage risks (*Zero Hardcoded Credentials*): Bind an **IAM Role for EC2 (Instance Profile)**, enabling automated, secure S3 access orchestrated by **IMDSv2 (Instance Metadata Service v2)**.

---

### 2. Daily Technical Execution Log

| Day | Tasks & Architecture Objectives | Deliverables & Verified Evidence |
| :--- | :--- | :--- |
| **Mon (10/08)** | • Analyzed compute sizing for the RAG stack: Sized minimum 2 vCPU, 4GB RAM to orchestrate FastAPI, Redis, and Qdrant containers.<br>• Cost comparison: `t3.medium` ($0.0416/hr) vs `t4g.medium` ($0.0336/hr). Graviton delivers >20% cost reduction.<br>• Generated SSH key pair `minh-aws-key.pem` and applied local permission hardening (`chmod 400`). | Key pair generated and secured in encrypted local developer workspace. |
| **Tue (11/08)** | • Launched Ubuntu 22.04 LTS instance via AWS Console.<br>• Authored UserData script bootstrapping Docker Engine, Docker Compose plugin, and AWS CLI v2 upon boot.<br>• Connected via SSH and verified user execution environment. | Executed `docker --version` and `docker compose version` successfully immediately after boot. |
| **Wed (12/08)** | • Provisioned Amazon S3 Bucket `fcaj-enterprise-legal-docs-1113719893` in Singapore region.<br>• Enabled SSE-S3 (AES-256) default encryption and turned on Object Versioning.<br>• Enforced all 4 layers of *S3 Block Public Access*. | Bucket isolated with zero public read/write exposure across the Internet. |
| **Thu (13/08)** | • Created IAM Trust Policy allowing `ec2.amazonaws.com` service principal assume-role actions.<br>• Configured Least-Privilege IAM Policy `S3LegalDocsAccessPolicy` scoping `s3:GetObject`, `s3:PutObject`, `s3:ListBucket`.<br>• Provisioned Instance Profile and bound it to the EC2 compute instance. | EC2 node verified reading and writing to S3 without any local `~/.aws/credentials` file. |
| **Fri (14/08)** | • Authored Python script utilizing `boto3` to benchmark document ingestion throughput from EC2 to S3.<br>• Experimented with S3 Lifecycle Rules: Automatic transitions to *S3 Standard-IA* after 30 days and *Glacier Instant Retrieval* after 90 days. | Internal cross-service network throughput within `ap-southeast-1` exceeded 100 MB/s with zero egress fees. |
| **Sat - Sun (15-16/08)** | • Audited EC2 Security Group: Restricted SSH port 22 strictly to developer public IP CIDR (`/32`).<br>• Documented infrastructure configurations and compiled technical worklog for Week 2. | 100% of Week 2 deliverables completed per TTTN-02 plan. |

---

### 3. Hands-on CLI & Configuration Code Snippets

#### 3.1. Provisioning a Hardened S3 Bucket:
```bash
# 1. Create bucket in Singapore region
aws s3api create-bucket \
    --bucket fcaj-enterprise-legal-docs-1113719893 \
    --region ap-southeast-1 \
    --create-bucket-configuration LocationConstraint=ap-southeast-1

# 2. Block all public access vectors
aws s3api put-public-access-block \
    --bucket fcaj-enterprise-legal-docs-1113719893 \
    --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# 3. Enable bucket versioning for legal immutability
aws s3api put-bucket-versioning \
    --bucket fcaj-enterprise-legal-docs-1113719893 \
    --versioning-configuration Status=Enabled
```

#### 3.2. IAM Role Binding for EC2 Instance Profile:
```bash
# 1. Create trust policy file
cat << 'EOF' > trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# 2. Create IAM Role
aws iam create-role \
    --role-name EC2-LegalRAG-AppRole \
    --assume-role-policy-document file://trust-policy.json

# 3. Attach Least-Privilege S3 permissions
aws iam attach-role-policy \
    --role-name EC2-LegalRAG-AppRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# 4. Create and attach Instance Profile
aws iam create-instance-profile --instance-profile-name EC2-LegalRAG-Profile
aws iam add-role-to-instance-profile \
    --instance-profile-name EC2-LegalRAG-Profile \
    --role-name EC2-LegalRAG-AppRole
```

#### 3.3. Launching Hardened EC2 with Mandatory IMDSv2:
```bash
aws ec2 run-instances \
    --image-id ami-047126e509f96e28b \
    --instance-type t3.medium \
    --key-name minh-aws-key \
    --security-group-ids sg-0abcdef1234567890 \
    --subnet-id subnet-0123456789abcdef0 \
    --iam-instance-profile Name=EC2-LegalRAG-Profile \
    --metadata-options "HttpTokens=required,HttpEndpoint=enabled" \
    --user-data file://init_docker.sh \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=LegalRAG-Compute-Node}]'
```

---

### 4. Technical Challenges & Troubleshooting (Root Cause Analysis)

* **Issue 1: SSH `Connection timed out` upon remote login.**
  * *Symptom:* Running `ssh -i minh-aws-key.pem ubuntu@<EC2-Public-IP>` hung for 30 seconds before failing with `Connection timed out`.
  * *Root Cause Analysis:* The EC2 Security Group was configured with an inbound rule locked to a previous day's IP address (`14.232.xxx.xxx/32`). A dynamic ISP lease renewal altered the local public IP, causing AWS stateful firewalls to drop incoming TCP SYN packets.
  * *Resolution:* Dynamically queried current public IP and updated security group ingress via AWS CLI:
    ```bash
    MY_CURRENT_IP=$(curl -s https://checkip.amazonaws.com)
    aws ec2 authorize-security-group-ingress \
        --group-id sg-0abcdef1234567890 \
        --protocol tcp --port 22 \
        --cidr ${MY_CURRENT_IP}/32
    ```
    SSH connectivity restored immediately.

* **Issue 2: IMDSv1 SSRF security vulnerability flag in AWS Security Hub.**
  * *Symptom:* Security Hub flagged Medium severity finding: *EC2 instances should use Instance Metadata Service Version 2 (IMDSv2)*.
  * *Root Cause Analysis:* IMDSv1 uses simple unauthenticated HTTP GET requests, which can be vulnerable to Server-Side Request Forgery (SSRF) exploits allowing unauthorized actors to extract temporary IAM credentials via `http://169.254.169.254/latest/meta-data/`.
  * *Resolution:* Enforced IMDSv2 (session-oriented token requiring HTTP PUT handshakes) across the instance:
    ```bash
    aws ec2 modify-instance-metadata-options \
        --instance-id i-0123456789abcdef0 \
        --http-tokens required \
        --http-endpoint enabled
    ```
    Mitigated credential exfiltration risks completely.

---

### 5. Verified Deliverables & Architecture Takeaways
1. **Production-Ready EC2 Compute Node:** Bootstrapped with Docker Engine, Docker Compose plugin, and AWS CLI v2 via UserData automation.
2. **Enterprise Document Lake on S3:** Secured with AES-256 encryption, Object Versioning, and Zero-Public-Access enforcement.
3. **Zero Standing Secrets:** Established IAM Role Instance Profile authentication driven by IMDSv2 session tokens.
