---
title: "Proposal"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# Serverless & Event-Driven Game Backend on AWS
## Cost-Optimized & Scalable Backend Architecture for Live-Service Games

### 1. Executive Summary
This proposal outlines an architectural solution for a **Live-Service Game Backend** running on AWS cloud infrastructure. Instead of maintaining an idle game server fleet 24/7 when no players are active, the system strictly adheres to an **on-demand compute provisioning model**: compute resources are spun up only during login, matchmaking, and live game session execution.

The entire **Metagame** (authentication, asset distribution, matchmaking, and post-match storage) is built completely serverless. Live game sessions requiring dedicated hardware are hosted within an **EC2 Spot Fleet (Graviton ARM64 architecture)**, dynamically spun up on-demand by the Matchmaker. Deployment and updates are managed entirely via **GitOps (CI/CD Pipelines)**, eliminating manual code pushes to production environments.

---

### 2. Problem Statement

#### Current Problem
*   **Substantial Idle Costs**: Traditional game server architectures maintain 24/7 dedicated virtual instances, creating immense infrastructure waste during off-peak hours when player traffic is minimal.
*   **High Egress & Egress Gateway Costs**: Persistent NAT Gateways and Load Balancers incur continuous hourly charges and data transfer fees regardless of active usage.
*   **Deployment & Release Overhead**: Deploying small game patches or updating server binaries traditionally requires rebaking full AMIs, slowing down release cycles and risking downtime.
*   **Network Security Exposure**: Permanently open security group ports on game servers invite DDoS attempts and unauthorized network scanning.

#### Proposed Solution
The system enforces a core design rule: **Serverless for everything except live game sessions**. Dedicated game sessions reside behind a dedicated network boundary within a VPC, fully decoupled from authentication and matchmaking flows.

The architecture comprises four independent processing flows with isolated triggers and trust boundaries:
1.  **Flow C (GitOps Deployment Loop)**: Automates CI/CD via GitHub Actions and AWS CodeDeploy, updates Lambda Alias versions, uploads asset bundles to S3, and updates EC2 Launch Templates without impacting active matches.
2.  **Flow A (Player Auth & Asset Distribution)**: Authenticates players via Amazon Cognito User Pool and grants scoped temporary IAM credentials via Cognito Identity Pool for direct asset/patch downloads from S3.
3.  **Flow R (Synchronous Matchmaking & EC2 Control Plane)**: Handles synchronous matchmaking requests via CloudFront + WAF, API Gateway, and Matchmaker Lambda in a Private Subnet. Lambda invokes the EC2 Control Plane over a private VPC Interface Endpoint to request warm Spot instances, opens dynamic Security Group rules per player/session, and returns connection endpoints to the client.
4.  **Flow E (Asynchronous Post-Match Processing & Analytics)**: Asynchronously captures post-match logs and metrics using DynamoDB Streams and Async Lambda, fully decoupled to avoid matchmaking latency.

#### Benefits & Return on Investment (ROI)
*   **Up to 70-80% Cost Savings**: Leverages ARM64 Graviton EC2 Spot instances combined with zero-idle serverless compute. Eliminates NAT Gateway and persistent Load Balancer costs.
*   **Enhanced Security Posture**: All requests require valid JWT validation before reaching application code. Game server security groups open dynamically per player IP during a match and are revoked immediately afterward.
*   **Zero-Downtime Patching**: Centralized S3 asset bundling enables EC2 UserData scripts to pull the latest binaries on boot without requiring full AMI rebakes.

---

### 3. Solution Architecture

#### Overall Architecture Diagram
![Serverless & Event-Driven Game Backend Architecture](/images/2-Proposal/serverless_game_backend_architecture.png)

#### Architectural Flow Breakdown:

##### 1. Flow C — GitOps Deployment Loop
*   **C1 - C2**: Developers push code and IaC to the Git Repository. GitHub Actions triggers the artifact build pipeline.
*   **C3**: CodeDeploy performs traffic shifting to new Lambda Version Aliases and updates EC2 Launch Templates.
*   **C4**: Client builds, patches, and server bundles are uploaded to Amazon S3. Faulty releases trigger automatic rollbacks without interrupting live matchmaking.

##### 2. Flow A — Player Auth & Security
*   **A1 - A2**: Players log in; Cognito User Pool authenticates and issues JWT Tokens.
*   **A3 - A4**: Clients exchange JWTs at Cognito Identity Pool for scoped temporary IAM credentials to download assets directly from S3.
*   **A5**: JWT Tokens are passed to Flow R where API Gateway Cognito Authorizers validate requests before invoking the Matchmaker Lambda.

##### 3. Flow R — Request & Matchmaking
*   **R1 - R2**: Matchmaking requests pass through CloudFront + AWS WAF to API Gateway.
*   **R3 - R4**: Matchmaker Lambda (in a Private Subnet) writes match state to Amazon DynamoDB via a VPC Gateway Endpoint.
*   **G1 - G2**: Matchmaker Lambda calls the EC2 Control Plane via a private VPC Interface Endpoint to request warm instances from the ASG Spot fleet and opens dynamic Security Group rules.
*   **G3 - G4**: EC2 Spot instances boot in the Public Subnet, using UserData scripts and IAM Instance Profiles to pull the latest server binaries from S3.
*   **R5**: Lambda returns the public IP/Port to the client, establishing direct UDP/TCP game connections via the Internet Gateway.

##### 4. Flow E — Asynchronous Processing
*   **E1 - E3**: Post-match results are written to DynamoDB. DynamoDB Streams automatically trigger Async Lambda functions to process logs and push analytics, completely decoupled from matchmaking latency.

#### AWS Services Used
-   **Amazon Cognito**: User authentication (User Pool) and scoped temporary credential delegation (Identity Pool).
-   **Amazon API Gateway & CloudFront + AWS WAF**: Edge request routing, DDoS protection, and web application security.
-   **AWS Lambda**: Serverless matchmaking logic, version aliasing, and post-match processing.
-   **Amazon EC2 Spot Fleet (Graviton ARM64)**: Cost-optimized live game server instances.
-   **Amazon DynamoDB**: Single Table Design for match state and event streaming via DynamoDB Streams.
-   **Amazon S3**: Centralized asset, build, patch, and server bundle repository.
-   **VPC Endpoints**: Gateway Endpoint (DynamoDB) and Interface Endpoint (EC2 API) for private, in-network service communication.
-   **AWS CodeDeploy & GitHub Actions**: Automated GitOps deployment pipeline.
-   **AWS KMS & Amazon CloudWatch**: Encryption at rest/in transit and comprehensive monitoring.

---

### 4. Technical Implementation

#### Implementation Phases
1.  **Phase 1: Architecture Research & Design (Month 1)**
    *   Latency and bandwidth requirements analysis; DynamoDB Single Table schema design.
    *   VPC network layout (Public Subnets for EC2 Game Fleet, Private Subnets for Matchmaker Lambda and VPC Endpoints).
2.  **Phase 2: IaC & GitOps Pipeline Setup (Months 1-2)**
    *   Provision AWS infrastructure using Terraform / AWS CDK.
    *   Establish GitHub Actions CI/CD workflows for Flow C (artifact build, S3 upload, and CodeDeploy automation).
3.  **Phase 3: Auth & Matchmaking Flow Implementation (Month 2)**
    *   Configure Cognito User Pool & Identity Pool (Flow A).
    *   Develop Matchmaker Lambda, API Gateway Cognito Authorizers, and CloudFront + WAF edge security (Flow R).
4.  **Phase 4: EC2 Spot Fleet & VPC Endpoints Integration (Months 2-3)**
    *   Create Launch Templates for Graviton ARM64 EC2 Spot Fleets with UserData boot scripts.
    *   Deploy VPC Gateway Endpoints (DynamoDB) and Interface Endpoints (EC2 API).
    *   Implement dynamic Security Group IP rule management for player sessions.
5.  **Phase 5: Asynchronous Analytics & Load Testing (Month 3)**
    *   Enable DynamoDB Streams and Async Lambda functions for post-match data pipelines (Flow E).
    *   Perform load testing, simulate player traffic spikes, and validate Spot interruption handling.

#### Technical Requirements & Security
-   **Multi-Layer Authentication**: Strict JWT token validation on all API endpoints.
-   **Dynamic Port Security**: No permanently open inbound ports. Security group rules are granted dynamically per player IP during active matches and revoked immediately post-match.
-   **Private Network Isolation**: Matchmaker Lambda resides in Private Subnets, interacting with DynamoDB and EC2 APIs via private VPC Endpoints.
-   **Data Protection**: Data at rest encrypted via AWS KMS; data in transit encrypted via TLS 1.3.

---

### 5. Timeline & Milestones

```
+-----------------------------------------------------------------------------------+
| Month 1: Research & IaC Infrastructure Design                                     |
|   - VPC, Subnet, and Security Group layout design                                 |
|   - DynamoDB Single Table schema and Serverless architecture definition           |
+-----------------------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------------------+
| Month 2: Auth, Matchmaking & EC2 Spot Fleet Development                           |
|   - Cognito User Pool / Identity Pool & S3 Scoped Credentials setup               |
|   - API Gateway, Matchmaker Lambda & VPC Endpoints development                    |
|   - Graviton ARM64 EC2 Spot Fleet Launch Template creation                        |
+-----------------------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------------------+
| Month 3: GitOps Automation, Async Processing & Load Testing                       |
|   - GitHub Actions + CodeDeploy CI/CD pipeline automation                         |
|   - DynamoDB Streams + Async Lambda analytics pipeline implementation             |
|   - Load testing, cost optimization, and final documentation                      |
+-----------------------------------------------------------------------------------+
```

---

### 6. Budget Estimation

By eliminating persistent NAT Gateways, avoiding standing Load Balancers, and utilizing Graviton ARM64 EC2 Spot instances, infrastructure costs are minimized:

| AWS Service | Configuration / Estimated Scale | Estimated Monthly Cost (USD) |
| :--- | :--- | :--- |
| **AWS Lambda** (Matchmaker & Async) | 1,000,000 requests/month, 512MB RAM | ~$0.20 |
| **Amazon API Gateway** | 1,000,000 HTTP requests/month | ~$1.00 |
| **Amazon DynamoDB** | On-Demand Mode (Read/Write capacity units) | ~$2.50 |
| **Amazon Cognito** | < 10,000 MAU (Monthly Active Users) | **Free Tier** |
| **Amazon S3** | 20GB Asset, Client Build, Patch & Server Bundle storage | ~$0.46 |
| **Amazon CloudFront & AWS WAF** | 50GB Egress, WAF Basic Rules | ~$3.50 |
| **Amazon EC2 Spot Fleet** (Graviton ARM64) | `c6g.large` Spot Instance (~$0.02/hr), avg. 100 match hours/month | ~$2.00 |
| **VPC Endpoints** | Gateway Endpoint (Free) + Interface Endpoint | ~$7.20 |
| **Total Estimated Cost** | **Serverless & Event-Driven Game Backend** | **~$16.86 USD / Month** |

> [!TIP]
> **Key Cost Highlights**:
> 1. Zero NAT Gateway charges (saves ~$32/month).
> 2. Zero standing Load Balancer charges (saves ~$20/month).
> 3. Graviton ARM64 EC2 Spot reduces compute cost by 70-80%.
> 4. Centralized S3 bundling maintains thin AMIs with minimal snapshot storage costs.

---

### 7. Risk Assessment

#### Risk Matrix & Mitigation Strategies

| Identified Risk | Impact | Probability | Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **EC2 Spot Interruption** | High | Medium | Utilize Auto Scaling Groups with diversified Spot pools (Multi-AZ / Multi-Instance types). ASGs automatically rebalance upon receiving 2-minute interruption notices. |
| **Traffic Spikes** | Medium | Medium | Metagame components (Cognito, API Gateway, Lambda, DynamoDB) are pure Serverless and auto-scale instantly with incoming demand. |
| **Security Breach / Unauthorized Access** | High | Low | Enforce JWT token verification at API Gateway. Dynamically revoke Security Group rules post-match. Private Subnet isolation via VPC Endpoints. |
| **Faulty Build Deployment** | Medium | Low | GitOps pipeline supports automated zero-downtime rollbacks for Lambda Version Aliases and Launch Templates. |

---

### 8. Expected Outcomes

*   **Architectural Excellence**: Successful deployment of a Production-Ready, Serverless & Event-Driven Game Backend delivering ultra-low matchmaking latency and instant scalability.
*   **Extreme Cost Efficiency**: Demonstrates a true pay-as-you-go operational model, delivering >75% cost savings over traditional 24/7 server infrastructure.
*   **Long-Term Value**: Provides a reusable **Architectural Blueprint** for deploying future live-service games on AWS.