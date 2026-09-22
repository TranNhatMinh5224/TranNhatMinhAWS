---
title: "Worklog Week 5"
date: 2026-08-31
weight: 5
chapter: false
pre: " <b> 1.5. </b> "
---

# Worklog Week 5: Comprehensive Infrastructure Observability with CloudWatch & CloudTrail Auditing

### 1. General Information & Core Technical Objectives
* **Timeline:** From 31/08/2026 to 06/09/2026 (Week 5).
* **Alignment with [TTTN-02.docx] Syllabus:** Week 5 Objective — *AWS CloudWatch (Monitoring) & CloudTrail (Activity Tracking)*.
* **Internship Mentor (CBHD):** Pham Van Phong (Solutions Architect).
* **Host Supervisor:** Nguyen Gia Hung (Senior Solutions Architect - AWS Vietnam).
* **Core Technical Objectives:**
  1. Master core **Observability** and **Operational Governance** tooling on AWS:
     - **Amazon CloudWatch:** Performance metrics aggregation, centralized log management (Log Groups, Log Streams), metric alarms thresholding, and customized real-time dashboards.
     - **AWS CloudTrail:** Continuous management event logging (capturing who made API calls, when, from which IP, and under what IAM principal context).
  2. Architectural delineation: CloudWatch drives operational health and capacity performance (*Health & Performance*); CloudTrail ensures forensic auditing and compliance governance (*Security & Compliance Auditing*).
  3. Deploy and configure the **Amazon CloudWatch Unified Agent** on Ubuntu to capture deep Guest OS memory (`mem_used_percent`) and disk storage (`disk_used_percent`) invisible to the underlying hypervisor.
  4. Establish automated incident response: Configure **CloudWatch Metric Alarms** integrated with **Amazon SNS** to push real-time critical incident emails to engineers upon CPU/RAM breaches (>80%).

---

### 2. Daily Technical Execution Log

| Day | Tasks & Architecture Objectives | Deliverables & Verified Evidence |
| :--- | :--- | :--- |
| **Mon (31/08)** | • Enabled AWS CloudTrail **Multi-Region Trail** `Enterprise-Audit-Trail`.<br>• Directed all management events (Read/Write) to a dedicated encrypted S3 audit bucket secured with SSE-KMS.<br>• Enforced cryptographic Log File Integrity Validation using SHA-256 hash chains. | Global infrastructure actions logged immutably, ensuring tamper-evident operational compliance. |
| **Tue (01/09)** | • Installed the **Amazon CloudWatch Unified Agent** package across the EC2 compute node.<br>• Authored `amazon-cloudwatch-agent.json` configuring 60s metric collection intervals for RAM, disk, and swap.<br>• Attached `CloudWatchAgentServerPolicy` to the EC2 IAM Instance Profile. | Custom namespace `CWAgent` populated in CloudWatch Console with live memory utilization telemetry. |
| **Wed (02/09)** | • Advanced Self-Directed Study (National Day holiday):<br>• Mastered **CloudWatch Logs Insights** query syntax: Filtered HTTP 5xx error events and computed request frequencies per source IP.<br>• Investigated CloudWatch Composite Alarms architecture. | Developed rapid log forensic querying skills eliminating the need to download large raw log files. |
| **Thu (03/09)** | • Deployed CloudWatch Metric Alarm `EC2-CPU-High-Utilization` monitoring `CPUUtilization` (>80% over two consecutive 5-minute evaluation periods).<br>• Deployed secondary alarm `EC2-Memory-High-Utilization` monitoring `mem_used_percent` (>85%).<br>• Bound both alarms to Amazon SNS Topic `System-Critical-Alerts`. | Automated alerting framework primed to protect the Capstone production node. |
| **Fri (04/09)** | • Executed Synthetic Load Testing: Installed `stress-ng` on the EC2 host and triggered 95% CPU load for 15 minutes.<br>• Monitored CloudWatch telemetry: Observed status transition from `OK` to `ALARM` after 10 minutes.<br>• Verified email delivery: Received real-time SNS incident notification containing exact breach metrics. | End-to-end incident detection and notification workflow verified with 100% precision. |
| **Sat - Sun (05-06/09)** | • Built executive **CloudWatch Operational Dashboard** integrating 4 primary telemetry widgets: CPU, Memory, Disk Space, and Network I/O.<br>• Documented configurations and compiled Week 5 technical worklog. | Delivered complete infrastructure observability framework meeting TTTN-02 criteria. |

---

### 3. Hands-on CLI & Configuration Code Snippets

#### 3.1. CloudWatch Unified Agent Configuration (`amazon-cloudwatch-agent.json`):
```json
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "metrics": {
    "namespace": "CWAgent",
    "metrics_collected": {
      "mem": {
        "measurement": [
          "mem_used_percent",
          "mem_total",
          "mem_used"
        ]
      },
      "disk": {
        "measurement": [
          "used_percent",
          "free"
        ],
        "resources": [
          "/"
        ]
      }
    }
  }
}
```

#### 3.2. Agent Bootstrapping via CLI:
```bash
# Download and install agent package on Ubuntu
wget https://s3.ap-southeast-1.amazonaws.com/amazoncloudwatch-agent-ap-southeast-1/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# Launch agent with target configuration
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

# Verify running daemon status
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status
```

#### 3.3. Log Auditing with CloudWatch Logs Insights:
```sql
fields @timestamp, @message
| filter @message like /ERROR/ or @message like /500/
| parse @message "* [*] * *" as timestamp, log_level, module, error_detail
| stats count(*) by bin(5m)
| sort @timestamp desc
| limit 50
```

#### 3.4. Triggering Synthetic CPU Stress for Alarm Verification:
```bash
# Install stress testing utility
sudo apt-get update && sudo apt-get install -y stress-ng

# Stress 2 virtual cores at 100% capacity for 15 minutes (900 seconds)
stress-ng --cpu 2 --timeout 900s --metrics-brief
```

---

### 4. Technical Challenges & Troubleshooting (Root Cause Analysis)

* **Issue 1: Missing Memory (RAM) and Disk metrics in CloudWatch.**
  * *Symptom:* The standard EC2 CloudWatch metrics page rendered `CPUUtilization` and `NetworkIn`, but lacked any telemetry regarding system RAM or free disk space.
  * *Root Cause Analysis:* The AWS Hypervisor operates outside the virtualized hardware boundary. To uphold guest security and isolation boundaries, the hypervisor cannot inspect in-memory data or the local OS file system.
  * *Resolution:* Installed the **CloudWatch Unified Agent** directly inside the Guest OS and attached `CloudWatchAgentServerPolicy` to the host IAM Instance Profile to publish custom metrics securely.

* **Issue 2: SNS Email notification stuck in `PendingConfirmation`.**
  * *Symptom:* The metric alarm transitioned into `ALARM` state during stress testing, but no incident notification emails were received.
  * *Root Cause Analysis:* Creating an email subscription does not activate delivery immediately. AWS enforces explicit opt-in verification: until the recipient clicks the verification link sent by AWS, the subscription remains suspended in `PendingConfirmation`.
  * *Resolution:* Checked inbox for email from `no-reply@sns.amazonaws.com` titled *AWS Notification - Subscription Confirmation* and confirmed the endpoint. The subscription transitioned to an active ARN, enabling instant alerting.

---

### 5. Verified Deliverables & Architecture Takeaways
1. **Full-Stack Observability:** Implemented CloudWatch Metrics, structured CloudWatch Logs, and executive Dashboards.
2. **Automated Incident Alerting:** Deployed 2 metric alarms tied to Amazon SNS email notifications, verified via synthetic load testing.
3. **Audited Infrastructure Governance:** Multi-Region CloudTrail active with KMS encryption and SHA-256 integrity validation.
