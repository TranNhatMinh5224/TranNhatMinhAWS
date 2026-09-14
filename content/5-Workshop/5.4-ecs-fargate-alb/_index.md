---
title: "Deploying Application Server & Application Load Balancer (ALB)"
date: 2026-08-25
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
aliases:
  - /5-workshop/5.4-ecs-fargate-alb/
  - /5-Workshop/5.4-ecs-fargate-alb/
---

# 5.4. Deploying Application Server & Application Load Balancer (ALB)

### Lab Overview

In modern enterprise architectures, compute workloads (FastAPI RAG Core, Next.js Web Interface) should be decoupled from direct client exposure and shielded behind a centralized traffic management layer. An **Application Load Balancer (ALB)** acts as the unified Single Entrypoint, receiving client requests over HTTP/HTTPS, balancing load across redundant compute targets, and routing traffic intelligently via Layer 7 URL path conditions (**Path-Based Routing**).

Lab 5.4 provides a complete deployment guide:
1. Provisioning the **Amazon EC2 application host (`enterprise-rag-server`)** within a secured VPC network, validating administrative access over SSH.
2. Setting up an **Application Load Balancer (`rag-lb`)** spanning two Availability Zones (`ap-southeast-1a`, `ap-southeast-1b`) for High Availability (HA).
3. Configuring two separate **Target Groups** with automated Health Checks.
4. Implementing **Path-Based Routing Rules**: seamlessly partitioning `/api/*` and `/docs*` traffic to the FastAPI backend while serving all default `/*` traffic to the Next.js frontend.
5. Performing end-to-end integration validation using the public DNS name of the Load Balancer.

---

### Module Content:

1. [**5.4.1. EC2 Compute Node Provisioning & Remote Administration**](#541-ec2-compute-node-provisioning--remote-administration)
2. [**5.4.2. Application Load Balancer & Target Groups Configuration**](#542-application-load-balancer--target-groups-configuration)
3. [**5.4.3. Path-Based Routing Implementation**](#543-path-based-routing-implementation)
4. [**5.4.4. End-to-End Verification via ALB Public DNS**](#544-end-to-end-verification-via-alb-public-dns)

---

## 5.4.1. EC2 Compute Node Provisioning & Remote Administration

### 1. Technical Objectives
* Provision an **Amazon EC2** virtual server providing the Container Runtime host for the RAG microservices stack (FastAPI, Next.js, Qdrant, Celery Worker).
* Deploy **Ubuntu Server 24.04 LTS (64-bit x86)** for maximum reliability and PyTorch/AI dependency support.
* Associate the compute instance with **VPC `vpc-03228d0b15b9ea7be`** and protect it via **Security Group `rag-ec2-sg`**.
* Secure SSH administration using the dedicated **`Key_RAG-AWS.pem`** private key pair.

---

### 2. Step-by-Step Implementation & Live Evidence

#### Step 1: Launch Instance & Configure Network Settings
1. Open **EC2 Management Console** → **Instances** → Click **Launch instances**.
2. **Name and tags**: Set name to **`enterprise-rag-server`**.
3. **Application and OS Images**: Select **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type** (64-bit x86).
4. **Instance type**: Select **`t3.small`** (2 vCPU, 2 GiB RAM) to balance computational power and memory.
5. **Key pair (login)**: Select **`Key_RAG-AWS`**.
6. **Network settings**: Click **Edit**:
   * **VPC**: Select project VPC **`vpc-03228d0b15b9ea7be`** (`MyProjectRAGVPC`).
   * **Subnet**: Select public subnet **`project-subnet-public2-ap-southeast-1b`**.
   * **Auto-assign public IP**: Set to **Enable** to receive a reachable public IPv4 address.
   * **Firewall (security groups)**: Choose **Select existing security group** → assign **`rag-ec2-sg`** (`sg-0c1e9bf71b2ec5149`).
7. **Configure storage**: Allocate 30 GiB gp3 General Purpose SSD root volume.

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.1-ec2-network-settings.png" alt="EC2 Network Settings Configuration" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.1.1: Binding EC2 instance to project VPC and applying rag-ec2-sg firewall rules</em></p>
</div>

---

#### Step 2: Verify Instance Operational State
Click **Launch instance**. Once booted, the server transitions to the **Running** state with active health checks:
* **Instance ID**: `i-0e3f096f3de681aaa` (`enterprise-rag-server`)
* **Instance State**: `Running`
* **Instance Type**: `t3.small`
* **Availability Zone**: `ap-southeast-1b`
* **Public IPv4**: `13.250.121.137`
* **Private IPv4**: `10.0.24.186`

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.1-ec2-instances-list.png" alt="EC2 Instances List" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.1.2: EC2 Instances dashboard confirming enterprise-rag-server (i-0e3f096f3de681aaa) running with public IP 13.250.121.137</em></p>
</div>

---

#### Step 3: Verify Administrative SSH Access
Open a local terminal and authenticate via the private SSH key:

```bash
ssh -i "Key_RAG-AWS.pem" ubuntu@13.250.121.137
```

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.1-ssh-terminal-ec2.png" alt="SSH Terminal Connection to EC2" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.1.3: Successful SSH terminal connection to enterprise-rag-server with private IP ip-10-0-24-186</em></p>
</div>

> [!NOTE]
> * **Cost Optimization Rationale**: The EC2 compute node is placed in `project-subnet-public2-ap-southeast-1b` (Internal IP `10.0.24.186`) with an auto-assigned public IP to avoid NAT Gateway operational costs (~$32/month under AWS Free Tier constraints). Security is maintained by strictly binding inbound ports through the `rag-ec2-sg` security group.
> * Due to AWS dynamic public IP allocation upon instance stops and restarts, the public IP may change (e.g. from `13.215.207.214` to `13.250.121.137`), while the internal private IP `10.0.24.186` remains permanently consistent within the VPC.

---

## 5.4.2. Application Load Balancer & Target Groups Configuration

### 1. Technical Objectives
* Provision an **Application Load Balancer (ALB)** named **`rag-lb`** with an **Internet-facing** scheme in Singapore (`ap-southeast-1`).
* Distribute listener traffic across **2 Availability Zones** (`ap-southeast-1a`, `ap-southeast-1b`) via Public Subnets to guarantee multi-datacenter fault tolerance.
* Establish two distinct **Target Groups**:
  * **`rag-backend-tg`**: Forwards API traffic to port `8000` on the EC2 host.
  * **`rag-frontend-tg`**: Forwards Web UI traffic to port `3000` on the EC2 host.
* Configure periodic **Health Checks** sending HTTP GET probes to `/` every 30 seconds to maintain an accurate view of application container health.

---

### 2. Step-by-Step Implementation & Live Evidence

#### Step 1: Provision Application Load Balancer
1. Navigate to **EC2 Console** → **Load Balancers** → Click **Create load balancer**.
2. Select **Application Load Balancer (ALB)** (intelligent Layer 7 routing).
3. Configure basic settings:
   * Load balancer name: **`rag-lb`**.
   * Scheme: **Internet-facing**.
   * IP address type: **IPv4**.
4. Network mapping:
   * VPC: Select `vpc-03228d0b15b9ea7be`.
   * Subnets: Select public subnets across both AZs (`subnet-06025e767c9a9773f` in `1a` and `subnet-0cf27fbea7085c1bd` in `1b`).
5. Security groups: Attach the public ALB security group permitting port 80 (HTTP).

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.2-create-alb-wizard.png" alt="Create Application Load Balancer Wizard" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.2.1: Selection of Application Load Balancer (ALB) type in AWS Management Console</em></p>
</div>

---

#### Step 2: Provision 2 Target Groups
Open **Target Groups** → Click **Create target group**:
1. **Backend Target Group (`rag-backend-tg`)**:
   * Target type: `Instances`.
   * Protocol: `HTTP`, Port: `8000`.
   * VPC: `vpc-03228d0b15b9ea7be`.
   * Health check path: `GET /` (Status code 200).
   * Register targets: Add `enterprise-rag-server` on port 8000.
2. **Frontend Target Group (`rag-frontend-tg`)**:
   * Target type: `Instances`.
   * Protocol: `HTTP`, Port: `3000`.
   * VPC: `vpc-03228d0b15b9ea7be`.
   * Health check path: `GET /` (Status code 200).
   * Register targets: Add `enterprise-rag-server` on port 3000.

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.2-target-groups-list.png" alt="Target Groups Management Table" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.2.2: Summary of Target Groups rag-backend-tg (port 8000) and rag-frontend-tg (port 3000)</em></p>
</div>

---

#### Step 3: Verify Active ALB Status
Once AWS finishes provisioning the elastic network interfaces, the Load Balancer switches to **Active**:
* **Load balancer name**: `rag-lb`
* **Status**: `Active`
* **DNS name**: `rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com`
* **Hosted zone**: `Z1LMS91P8CMLE5`

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.2-alb-details-active.png" alt="ALB Active Status Details" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.2.3: Operational overview of rag-lb confirming Active state and canonical DNS hostname</em></p>
</div>

---

#### Step 4: Validate Target Health Check Metrics
Inspect the **Resource map** tab of `rag-lb`:
* Both registered targets under `rag-backend-tg` (port 8000) and `rag-frontend-tg` (port 3000) report **Healthy (1/1)**.
* This proves both FastAPI and Next.js services are responding promptly with HTTP 200 codes.

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.2-alb-targets-healthy-map.png" alt="ALB Resource Map Healthy Status" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.2.4: Resource map confirming healthy target instances across both backend and frontend targets</em></p>
</div>

---

## 5.4.3. Path-Based Routing Implementation

### 1. Technical Objectives
* Instead of running redundant load balancers or managing fragmented host headers, the architecture leverages Layer 7 **Path-Based Routing**.
* Requests prefixed with `/api/*` or documentation endpoints `/docs*` are routed to the FastAPI backend.
* Default traffic (`/*`) routes to the Next.js web user interface.

---

### 2. Routing Rules Matrix

| Priority | Path Condition | Action | Target Group |
| :--- | :--- | :--- | :--- |
| **Rule 1** (Highest) | **`Path is /api/* or /docs*`** | **Forward to** | `rag-backend-tg` (Port 8000) |
| **Default Rule** | Any other request (`/*`) | **Forward to** | `rag-frontend-tg` (Port 3000) |

---

### 3. Step-by-Step Implementation & Live Evidence

#### Step 1: Inspect HTTP:80 Listener
On the `rag-lb` management screen, select **Listeners and rules**. The `HTTP:80` listener intercepts all incoming client connections.

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.3-alb-listener-overview.png" alt="HTTP:80 Listener Overview" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.3.1: HTTP:80 listener configuration dashboard before defining advanced routing rules</em></p>
</div>

---

#### Step 2: Define Path Conditions
1. Click **Manage rules** → Select **Add rule**.
2. **Step 1: Add rule conditions**:
   * Condition type: **Path**.
   * Values: `/api/*` and `/docs*`.

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.3-alb-rule-path-condition.png" alt="ALB Rule Path Condition" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.3.2: Path condition filtering for /api/* and /docs* endpoints</em></p>
</div>

---

#### Step 3: Configure Forwarding Action
1. **Step 2: Define actions**:
   * Action type: **Forward to target groups**.
   * Target group: **`rag-backend-tg`** (Weight 100%).

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.3-alb-rule-forward-action.png" alt="Forward Action Configuration" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.3.3: Action definition forwarding API requests to rag-backend-tg</em></p>
</div>

---

#### Step 4: Set Rule Priority
1. **Step 3: Set rule priority**:
   * Assign priority value: **`1`**.

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.3-alb-rule-priority.png" alt="Rule Priority Setting" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.3.4: Priority 1 assigned to ensure the API rule is evaluated prior to the catch-all default</em></p>
</div>

---

#### Step 5: Verify Consolidated Rule Table
Click **Create**. The listener rules dashboard displays the active path-based configuration:

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.3-alb-rules-completed-list.png" alt="Completed Listener Rules Table" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.3.5: Final listener rule table enforcing clear separation between backend and frontend targets</em></p>
</div>

---

## 5.4.4. End-to-End Verification via ALB Public DNS

With the load balancer configured, verify system connectivity directly through the public DNS endpoint in a web browser:

$$\text{URL: } \texttt{http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com}$$

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.4-alb-dns-browser-verify.png" alt="Browser Verification of ALB Public DNS" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.4.4.1: Live browser response verifying successful end-to-end routing via Application Load Balancer</em></p>
</div>

* Live HTTP 200 JSON response from the FastAPI Backend service:
```json
{"message":"Hệ thống RAG Backend đang hoạt động trơn tru!"}
```

This validates that the communication path **Internet Client → ALB → Target Group → Docker Container on EC2** is fully functional with minimal network latency.

> [!TIP]
> The initial JSON response confirms direct Layer 7 routing to the backend target group. When users interact with the full web client in **Lab 5.5**, the complete Next.js UI (NexusDoc AI) is loaded seamlessly through this ALB DNS endpoint.

---

### Lab 5.4 Summary:
Completing Lab 5.4 transitions the enterprise RAG assistant into a production-ready operational state:
1. **EC2 Compute Node** runs securely within VPC boundaries with authenticated SSH control.
2. **Application Load Balancer (`rag-lb`)** provides Multi-AZ fault tolerance and a unified entrypoint.
3. **Path-Based Routing** cleanly segregates backend AI APIs from frontend user interfaces.
4. **Target Health Probing** guarantees traffic is only dispatched to active, responsive containers.

Next Module: [**Lab 5.5: End-to-End RAG Testing & Security Guardrails**](../5.5-testing-rag/).
