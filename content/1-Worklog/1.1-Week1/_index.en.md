---
title: "Worklog Week 1"
date: 2026-08-03
weight: 1
chapter: false
pre: " <b> 1.1. </b> "
---

# Worklog Week 1: Environment Provisioning, IAM Identity Governance & AWS Cloud Foundations

### 1. General Information & Core Technical Objectives
* **Timeline:** From 03/08/2026 to 09/08/2026 (Week 1).
* **Internship Mentor (CBHD):** Pham Van Phong (Solutions Architect).
* **Host Supervisor:** Nguyen Gia Hung (Senior Solutions Architect - AWS Vietnam).
* **Core Technical Objectives:**
  1. Provision a hands-on AWS account adhering strictly to the **AWS Well-Architected Security Pillar**: Enable Virtual MFA on the Root user and completely eliminate active Root Access Keys.
  2. Architect an **AWS IAM (Identity and Access Management)** governance structure based on the **Principle of Least Privilege**.
  3. Standardize local development environments using **AWS CLI v2**, setting Default Region to `ap-southeast-1` (Singapore).
  4. Establish automated cost guardrails: Configure **AWS Budgets** and a **CloudWatch Billing Alarm** integrated with **Amazon SNS** to trigger email alerts when estimated charges exceed $5 USD.
  5. Analyze the **Shared Responsibility Model** and cloud deployment models (IaaS, PaaS, SaaS) in the context of production-grade Enterprise RAG deployment.

---

### 2. Work Breakdown Structure & Daily Technical Execution Log

| Day | Technical Tasks & Architecture Objectives | Start Date | End Date | References & Documentation | Deliverables & Verified Evidence |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Mon** | • Initialized AWS account under First Cloud AI Journey (FCAJ).<br>• Enabled Virtual MFA for Root User via authenticator application.<br>• Audited IAM credentials report confirming zero standing Root Access Keys. | 03/08/2026 | 03/08/2026 | • [Cloud Journey Training Portal](https://cloudjourney.awsstudygroup.com/)<br>• [AWS Account Setup & Root MFA Best Practices](https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-root-user.html) | Account verified; Level 1 compliance achieved per CIS AWS Foundations Benchmark. |
| **Tue** | • Installed and configured AWS CLI v2 on Windows 11 workstation.<br>• Provisioned administrative IAM User `dev-admin` managed under `CloudDevelopers` group.<br>• Initialized local credential profiles in `~/.aws/credentials` and `~/.aws/config`. | 04/08/2026 | 04/08/2026 | • [AWS CLI v2 Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)<br>• [IAM Best Practices & Least Privilege](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) | Executed `aws sts get-caller-identity` returning verified IAM User identity under `ap-southeast-1`. |
| **Wed** | • Activated *Receive CloudWatch Billing Alerts* in Billing Preferences.<br>• Created an AWS Budget capped at $10/month across the account.<br>• Built a CloudWatch Metric Alarm monitoring `EstimatedCharges` threshold at $5.00 USD in `us-east-1`. | 05/08/2026 | 05/08/2026 | • [AWS Budgets Documentation](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)<br>• [CloudWatch Billing Alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html) | Configured Amazon SNS Topic `Billing-Alerts-Topic`; confirmed email subscription endpoint. |
| **Thu** | • Investigated AWS Global Infrastructure: Regions, Availability Zones (AZs), and Edge Locations.<br>• Conducted network latency (RTT) profiling from Vietnam to regional data centers (`ap-southeast-1`, `ap-east-1`).<br>• Studied *AWS Well-Architected Framework: Security & Cost Optimization Pillars*. | 06/08/2026 | 06/08/2026 | • [AWS Global Infrastructure](https://aws.amazon.com/about-aws/global-infrastructure/)<br>• [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) | Selected Singapore (`ap-southeast-1`) as the primary region offering minimal latency (~35ms). |
| **Fri** | • Attended Technical Orientation Briefing with AWS Senior Solutions Architects.<br>• Pitched Capstone proposal: *Enterprise Legal & Knowledge RAG Assistant on AWS*.<br>• Received feedback on multi-tier network isolation for sensitive enterprise data. | 07/08/2026 | 07/08/2026 | • [Cloud Journey Community Guide](https://cloudjourney.awsstudygroup.com/)<br>• [Generative AI on AWS Reference Architecture](https://aws.amazon.com/generative-ai/) | Capstone topic approved; finalized architectural baseline combining Multi-AZ VPC, Qdrant, and FastAPI. |
| **Sat - Sun** | • Completed foundational assessments on the Cloud Journey training portal.<br>• Deep-dived into EC2 Nitro System virtualization concepts and EBS block storage architecture. | 08/08/2026 | 09/08/2026 | • [AWS Skill Builder Training](https://explore.skillbuilder.aws/)<br>• [Amazon EC2 Nitro Architecture](https://aws.amazon.com/ec2/nitro/) | Scored 100% on foundational cloud computing entrance evaluation. |

---

### 3. Hands-on CLI & Configuration Code Snippets

#### 3.1. AWS CLI v2 Environment Initialization:
```bash
# Configure default region and output format
aws configure set default.region ap-southeast-1
aws configure set default.output json

# Verify active security principal
aws sts get-caller-identity
```
*Output response:*
```json
{
    "UserId": "AIDAXAMPLEMINHJOURNEY",
    "Account": "1113719893XX",
    "Arn": "arn:aws:iam::1113719893XX:user/dev-admin"
}
```

#### 3.2. IAM User & Group Provisioning per Least Privilege:
```bash
# 1. Create development group
aws iam create-group --group-name CloudDevelopers

# 2. Attach PowerUserAccess policy (avoiding unnecessary root privileges)
aws iam attach-group-policy --group-name CloudDevelopers \
    --policy-arn arn:aws:iam::aws:policy/PowerUserAccess

# 3. Create developer user and assign to group
aws iam create-user --user-name dev-admin
aws iam add-user-to-group --user-name dev-admin --group-name CloudDevelopers
```

#### 3.3. Automated Cost Monitoring via CloudWatch & Amazon SNS:
```bash
# Create SNS Topic for billing notifications (Global billing metrics reside in us-east-1)
aws sns create-topic --name Billing-Alerts-Topic --region us-east-1

# Subscribe email endpoint
aws sns subscribe \
    --topic-arn arn:aws:sns:us-east-1:1113719893XX:Billing-Alerts-Topic \
    --protocol email \
    --notification-endpoint nhatminh5224.forwork@gmail.com \
    --region us-east-1

# Deploy CloudWatch Metric Alarm for estimated charges > $5 USD
aws cloudwatch put-metric-alarm \
    --alarm-name "Billing-Threshold-Over-5USD" \
    --metric-name EstimatedCharges \
    --namespace AWS/Billing \
    --statistic Maximum \
    --period 21600 \
    --threshold 5.0 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=Currency,Value=USD \
    --evaluation-periods 1 \
    --alarm-actions arn:aws:sns:us-east-1:1113719893XX:Billing-Alerts-Topic \
    --region us-east-1
```

---

### 4. Technical Challenges & Troubleshooting (Root Cause Analysis)

* **Issue 1: `SignatureDoesNotMatch` during local AWS CLI operations.**
  * *Symptom:* Executing `aws ec2` or `aws s3` resulted in: `An error occurred (SignatureDoesNotMatch) when calling the ListBuckets operation: Signature expired: 20260804T071520Z is now earlier than 20260804T072045Z`.
  * *Root Cause Analysis:* AWS Signature Version 4 enforces strict replay attack prevention by rejecting requests with timestamps skewed by more than 15 minutes relative to AWS NTP servers. The local Windows workstation clock had drifted by 5 minutes.
  * *Resolution:* Resynchronized Windows Time Service via elevated PowerShell:
    ```powershell
    net start w32time
    w32tm /resync /force
    ```
    CLI operations succeeded immediately post-synchronization.

* **Issue 2: Metric `EstimatedCharges` missing from CloudWatch.**
  * *Symptom:* CloudWatch Alarm creation failed stating that metric `EstimatedCharges` does not exist in namespace `AWS/Billing`.
  * *Root Cause Analysis:* AWS billing metric collection is disabled by default. Furthermore, global billing metrics are exclusively aggregated in `us-east-1` (N. Virginia), not regional endpoints like `ap-southeast-1`.
  * *Resolution:* Logged into Root User console ➔ Billing Preferences ➔ Checked `Receive CloudWatch Billing Alerts` ➔ Targeted CloudWatch CLI commands explicitly to `--region us-east-1`. Metric rendered accurately within 15 minutes.

---

### 5. Verified Deliverables & Architecture Takeaways
1. **Hardened AWS Foundation:** 100% aligned with CIS Benchmarks (Root MFA enforced, zero active root access keys, dedicated IAM user).
2. **Automated Cost Control:** Multi-tier alarms guarantee strict adherence to the Free Tier envelope without unexpected budget spillover.
3. **Standardized Toolchain:** AWS CLI v2 and SDK configurations initialized for infrastructure automation.
4. **Capstone Blueprint Approved:** Validated problem statement and architectural boundaries for the Enterprise Legal RAG platform.
