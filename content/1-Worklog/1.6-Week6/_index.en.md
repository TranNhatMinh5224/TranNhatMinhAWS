---
title: "Worklog Week 6"
date: 2026-09-07
weight: 6
chapter: false
pre: " <b> 1.6. </b> "
---

### 1. Technical Objectives - Week 6
* **Layer 7 Application Load Balancer (ALB) Architecture:** Design and deploy an internet-facing Application Load Balancer across Public Subnets in two Availability Zones (`ap-southeast-1a`, `ap-southeast-1b`), supporting SSL/TLS termination and Path-based Routing.
* **Microservices Routing across Multiple Target Groups:** Separate user traffic between the Frontend (Next.js - Port 3000) and API Backend (FastAPI - Port 8000) using deterministic HTTP request path rules (`/api/*` vs `/*`).
* **Elastic Auto Scaling Group (ASG) Infrastructure:** Build a standardized Launch Template (Amazon Linux 2023, IMDSv2, UserData bootstrap scripts) and configure a Multi-AZ Auto Scaling Group with Target Tracking Policy (70% CPU threshold).
* **Stress & Chaos Testing:** Simulate burst traffic using Apache Bench (`ab`) and `stress-ng` to validate the Instance Lifecycle (Pending -> InService -> Terminating), Target Deregistration Delay (Connection Draining), and automatic self-healing capabilities.

---

### 2. Detailed Technical Log

| Day | Technical Deep-Dive Focus | Deliverables & Milestones |
| :--- | :--- | :--- |
| **Mon<br>(07/09)** | **ELB Architecture (ALB vs NLB) & Health Check Design**<br>- Evaluated OSI Layer 7 (HTTP/HTTPS) ALB features vs Layer 4 (TCP/UDP) NLB throughput.<br>- Standardized microservice health check parameters: Protocol `HTTP`, Path `/health`, Healthy Threshold `3`, Unhealthy Threshold `2`, Timeout `5s`, Interval `15s`.<br>- Configured Security Group Chaining: Instances only accept inbound traffic from `sg-alb`, completely closing direct public access. | - Layer 7 ALB architecture flow design.<br>- Security Groups: `sg-alb` (Inbound 80/443 from `0.0.0.0/0`) and `sg-ec2-backend` (Inbound 8000 restricted to `sg-alb`). |
| **Tue<br>(08/09)** | **ALB Deployment & Path-Based Routing Implementation**<br>- Provisioned internet-facing ALB across two Public Subnets (`subnet-public-1a`, `subnet-public-1b`).<br>- Created 2 distinct Target Groups: `tg-nexusdoc-frontend` (Port 3000) and `tg-nexusdoc-backend` (Port 8000).<br>- Configured Listener Rules on Port 80/443: Forward `/api/*` and `/docs` to `tg-nexusdoc-backend`; Forward default `/*` traffic to `tg-nexusdoc-frontend`. | - Active ALB ARN with AWS-managed DNS Name.<br>- Verified path-based routing via cURL: `/api/v1/health` reached FastAPI; `/` reached Next.js UI. |
| **Wed<br>(09/09)** | **Launch Template Provisioning & Auto Scaling Group Setup**<br>- Created Launch Template (`lt-nexusdoc-backend-v1`): Amazon Linux 2023, `t3.medium`, IAM Instance Profile for CloudWatch & S3 Read.<br>- Embedded UserData bootstrap script to pull container images, set environment variables, and start FastAPI container on boot.<br>- Configured Auto Scaling Group (`asg-nexusdoc-backend`): Min = 2, Desired = 2, Max = 5, spanning Private App Subnets across 2 AZs. | - Versioned Launch Template in AWS EC2.<br>- Multi-AZ ASG successfully registered 2 EC2 instances into the backend Target Group. |
| **Thu<br>(10/09)** | **Target Tracking Scaling Policy & CloudWatch Alarms**<br>- Implemented dynamic Target Tracking Policy: maintain `ASGAverageCPUUtilization` at 70%.<br>- Configured 180s Instance Warmup period to account for embedding model weights initialization.<br>- Tuned Target Group Deregistration Delay from 300s to 60s for timely resource decommissioning without dropping active HTTP connections. | - CloudWatch Metric Alarms linked to ASG policies.<br>- Production-ready auto-scaling configuration prepared for chaos testing. |
| **Fri<br>(11/09)** | **Stress Testing, Auto-Scaling Validation & Chaos Drill**<br>- Executed Apache Bench workload: `ab -n 50000 -c 200 http://<alb-dns>/api/v1/health`.<br>- Injected CPU stress on an instance: `stress-ng --cpu 4 --timeout 300s`.<br>- Observed ASG metrics: Average CPU peaked at 92% -> Alarm fired -> ASG dynamically scaled out to 4 instances.<br>- Performed chaos drill by terminating 1 instance manually: ASG detected unhealthy status and spawned a replacement within 90 seconds. | - Auto-scaling metrics validation report & load balance distribution graphs.<br>- Confirmed 99.9% High Availability architecture compliance. |

---

### 3. Key AWS CLI Execution & Configurations

#### Application Load Balancer & Target Group Setup
```bash
# 1. Create Target Group for Backend API
aws elbv2 create-target-group \
    --name tg-nexusdoc-backend \
    --protocol HTTP \
    --port 8000 \
    --vpc-id vpc-0a1b2c3d4e5f \
    --health-check-protocol HTTP \
    --health-check-path /api/v1/health \
    --health-check-interval-seconds 15 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 2 \
    --target-type instance

# 2. Deploy Internet-Facing ALB across 2 Public Subnets
aws elbv2 create-load-balancer \
    --name alb-nexusdoc-enterprise \
    --subnets subnet-0123pub1a subnet-0456pub1b \
    --security-groups sg-0albsecuritygroup \
    --scheme internet-facing \
    --type application \
    --ip-address-type ipv4

# 3. Create HTTP Listener & Path-based Routing Rules
aws elbv2 create-listener \
    --load-balancer-arn <ALB_ARN> \
    --protocol HTTP --port 80 \
    --default-actions Type=forward,TargetGroupArn=<FRONTEND_TG_ARN>

aws elbv2 create-rule \
    --listener-arn <LISTENER_ARN> \
    --priority 10 \
    --conditions Field=path-pattern,Values='/api/*' \
    --actions Type=forward,TargetGroupArn=<BACKEND_TG_ARN>
```

#### Auto Scaling Group & Target Tracking Policy Setup
```bash
# Provision Auto Scaling Group attached to Target Group
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name asg-nexusdoc-prod \
    --launch-template LaunchTemplateName=lt-nexusdoc-backend,Version='$Latest' \
    --min-size 2 \
    --max-size 5 \
    --desired-capacity 2 \
    --vpc-zone-identifier "subnet-0789app1a,subnet-0abcdefapp1b" \
    --target-group-arns <BACKEND_TG_ARN> \
    --health-check-type ELB \
    --health-check-grace-period 180

# Attach Target Tracking CPU Scaling Policy
aws autoscaling put-scaling-policy \
    --auto-scaling-group-name asg-nexusdoc-prod \
    --policy-name target-tracking-cpu-70 \
    --policy-type TargetTrackingScaling \
    --target-tracking-configuration file://scaling-policy-config.json
```

---

### 4. Technical Troubleshooting & Root Cause Analysis

#### Incident 1: HTTP 502 Bad Gateway upon ALB Ingestion
* **Symptom:** Inbound requests via ALB DNS to `/api/v1/health` resulted in HTTP 502 Bad Gateway. The Target Group marked all EC2 targets as `unhealthy` with message `Health checks failed with these codes: [404]`.
* **Root Cause Analysis (RCA):** The FastAPI app declared the endpoint prefix `/api/v1/health`, whereas the default Target Group Health Check configuration requested `/`. The container correctly replied with `404 Not Found`, prompting the ALB to mark targets as down.
* **Remediation:** Updated the health check path via `aws elbv2 modify-target-group --health-check-path /api/v1/health`. Target status returned to `healthy` within two consecutive check cycles.

#### Incident 2: In-Flight Connection Terminations during ASG Scale-In
* **Symptom:** When traffic subsiding after stress testing triggered ASG Scale-In (reducing instances from 4 to 2), several active RAG document queries failed with `504 Gateway Timeout`.
* **Root Cause Analysis (RCA):** The default deregistration delay was set to 300 seconds, but instances were abruptly terminated before long-running embedding calls completed their keep-alive cycle.
* **Remediation:** Tuned Target Group `deregistration_delay.timeout_seconds` to 60 seconds and implemented an Auto Scaling Lifecycle Hook (`autoscaling:EC2_INSTANCE_TERMINATING`) giving tasks graceful exit time to drain existing connections before server termination.

---

### 5. Summary & Key Outcomes - Week 6
* Architected a High Availability (HA) load balancing topology adhering to the AWS Well-Architected Framework, eliminating Single Points of Failure (SPOF).
* Successfully decoupled frontend and backend traffic via Layer 7 Path-Based Routing rules on a unified domain entrance.
* Verified real-time elasticity through stress-testing: dynamic scale-out occurred within 60 seconds of spike detection, and safe scale-in minimized unnecessary idle compute costs.
