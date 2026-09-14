---
title: "RAG Pipeline Testing, Security Guardrails & CloudWatch Monitoring"
date: 2026-08-25
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
aliases:
  - /5-workshop/5.5-testing-cloudwatch/
  - /5-Workshop/5.5-testing-cloudwatch/
---

# 5.5. RAG Pipeline Testing, Security Guardrails & Amazon CloudWatch Monitoring

### Lab 5.5 Overview

Following the end-to-end cloud infrastructure provisioning on AWS—spanning VPC, S3 Data Lake, RDS PostgreSQL, Qdrant Vector DB, EC2 Application Server, and Application Load Balancer (ALB)—the pivotal subsequent stage in the system engineering lifecycle involves **End-to-End Integration Testing** and establishing **Operational Observability, Dashboards & Automated Alarms**.

Lab 5.5 focuses on three core technical milestones:
1. **End-to-End RAG Inference Pipeline Testing via ALB DNS**: Access the **NexusDoc AI (Deep Research Pro)** interface through the public DNS endpoint of the Load Balancer, test semantic search accuracy, verify exact document page citations (`TTTN-01.docx`), and evaluate real-time streaming responses via **Server-Sent Events (SSE Streaming)**.
2. **2-Tier Enterprise Security Guardrails & Anti-Hallucination Testing**: Evaluate prompt injection detection mechanisms, sensitive keyword filtering, and polite **Out-of-Domain Refusal** protocols ensuring zero hallucination when queries fall outside the document context.
3. **Comprehensive Observability, Dashboards & Metric Alarms with Amazon CloudWatch**:
   * Track network telemetry metrics from the Application Load Balancer (`RequestCount`, `HTTPCode_Target_2XX_Count`, `TargetResponseTime`, `CapacityUtilization`).
   * Build a centralized real-time visualization dashboard (**CloudWatch Dashboard `Dashboard-RAG`**).
   * Configure proactive automated incident alerting (**CloudWatch Metric Alarm `RAG-Server-High-CPU-Alarm`**) integrated with **Amazon SNS** to dispatch email alerts to system administrators.

---

### Implementation Table of Contents:

1. [**5.5.1. End-to-End RAG Pipeline Testing via ALB Web Interface**](#551-end-to-end-rag-pipeline-testing-via-alb-web-interface)
2. [**5.5.2. Testing 2-Tier Security Guardrails & Hallucination Prevention**](#552-testing-2-tier-security-guardrails--hallucination-prevention)
3. [**5.5.3. Performance Monitoring, Dashboard Setup & CloudWatch Alarms**](#553-performance-monitoring-dashboard-setup--cloudwatch-alarms)

---

## 5.5.1. End-to-End RAG Pipeline Testing via ALB Web Interface

### 1. Technical Objectives
* Validate Internet traffic routing from end-users through the Application Load Balancer (`rag-lb`) to frontend containers (Next.js) and backend services (FastAPI).
* Verify integrity across all four stages of the Enterprise RAG lifecycle:
  1. **Document Ingestion**: File parsing, chunking, and embedding vector extraction using the `BAAI/bge-m3` model.
  2. **Vector Storage**: Storing 1024-dimensional vectors into the `enterprise_knowledge` collection within Qdrant.
  3. **Hybrid Search & Re-ranking**: Semantic similarity matching combined with BAAI Re-ranker cross-encoder scoring.
  4. **Generation with Streaming & Grounded Citations**: Large Language Model context synthesis, appending exact source file names and page numbers, streamed directly to client browsers over Server-Sent Events (SSE).

---

### 2. Live Testing Evidence

Navigate to the application web interface using the ALB DNS hostname:
`http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com`

#### Scenario 1: Enterprise Knowledge Retrieval & Source Citation Verification
* Select the enterprise knowledge document: **`TTTN-01.docx`** (Internship Report Document).
* Submit the business query: **"địa chỉ thực tập là ở đâu"** *(Where is the internship address?)*.
* The NexusDoc AI system processes the context and returns factual information with clear source attribution:

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.1-nexusdoc-chat-citation.png" alt="NexusDoc AI Information Extraction and Precise Source Citation" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.1.1: NexusDoc AI Assistant synthesizing knowledge, returning the exact Bitexco 36th-floor address and citing TTTN-01.docx - Page 1</em></p>
</div>

#### Scenario 2: Real-time Streaming Verification via Developer Tools
* Submit an in-domain query: **"Trình độ đào tạo và ngành đào tạo của tôi là gì?"** *(What is my degree level and major?)*.
* Inspect the browser DevTools (F12) Network tab to confirm SSE streaming chunks received over HTTP 200 `/api/v1/chat/stream`.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.1-web-rag-chat-e2e.png" alt="End-to-End Chatbot Web UI Testing via ALB" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.1.2: Web AI streaming semantic responses grounded in TTTN-01.docx via SSE protocol with HTTP 200 OK status</em></p>
</div>

#### Test Result Analysis:
* **Factual Extraction Precision**: The assistant returned exact data points matching the source document:
  * Internship Address: *Tầng 36 Tòa nhà Bitexco Financial Tower, Số 2 đường Hải Triều, Phường Sài Gòn, TP. Hồ Chí Minh*.
  * Degree level: *Đại học (Bachelor's Degree)*, Major: *Công nghệ thông tin (Information Technology)*.
* **Grounded Source Citation**: Transparently displays verified citation badges (*`Nguồn: TTTN-01.docx - Trang 1`*), enabling instant fact-checking.
* **First-Token Latency**: Enabled by Server-Sent Events (SSE), initial response tokens reached the client within ~450ms.

---

## 5.5.2. Testing 2-Tier Security Guardrails & Hallucination Prevention

### 1. 2-Tier Enterprise Security Architecture

For production-grade enterprise AI applications, unauthorized data leakage and out-of-context hallucination present unacceptable compliance risks. The system implements a robust two-layer defense-in-depth framework:

```
[User Inbound Query]
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: Regex & Keyword Pre-Flight Check (Fast Guardrail)   │
│  - Detects Prompt Injection (e.g., "Ignore previous", ...)  │
│  - Blocks jailbreaks, forbidden words, and anomalous tokens │
└─────────────────────────────┬───────────────────────────────┘
          │ (Pass)
          ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 2: System Prompt Hardening & Context Grounding         │
│  - Strict context-bounded generation (Zero Hallucination)   │
│  - Enforces polite refusal when evidence is missing:        │
│    "The provided document does not mention this..."         │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Live Security Testing Evidence

Submit out-of-domain conversational queries or simulated jailbreak prompts to assess safe rejection behavior:

* **Test Query**: *"mày là ai"* *(who are you)* or non-contextual chitchat questions.
* **Expectation**: The model must not hallucinate external personas or make ungrounded inferences; it must trigger configured guardrail protocols.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.2-guardrails-chitchat-refusal.png" alt="Testing Guardrails Out-of-Domain Refusal" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.2: Enterprise guardrail response: "Tài liệu được cung cấp không đề cập đến thông tin này..." (The provided document does not mention this information)</em></p>
</div>

#### Evaluation Highlights:
* **Compliance & Determinism**: The system responded with standard compliance verbiage: *"Tài liệu được cung cấp không đề cập đến thông tin này. Bạn có câu hỏi nào khác liên quan đến tài liệu không?"*.
* **Safe Containment**: No system prompt leakage or unverified claims occurred, ensuring complete data security and enterprise brand safety.

---

## 5.5.3. Performance Monitoring, Dashboard Setup & CloudWatch Alarms

### 1. Application Load Balancer Network Telemetry

Navigate to **CloudWatch Management Console** $\rightarrow$ select **Metrics** $\rightarrow$ choose **All metrics** $\rightarrow$ select namespace **`ApplicationELB`** $\rightarrow$ **`Per AppELB Metrics`** $\rightarrow$ select Load Balancer **`app/rag-lb/dd9f64ed734dab43`**.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-per-appelb-metrics.png" alt="Load Balancer Metrics List on CloudWatch Console" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.3.1: CloudWatch Per AppELB Metrics view tracking app/rag-lb/dd9f64ed734dab43 resources</em></p>
</div>

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-alb-metrics.png" alt="CloudWatch Metrics Monitoring for Application Load Balancer" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.3.2: Amazon CloudWatch Metrics dashboard displaying RequestCount, HTTPCode_Target_2XX_Count, and TargetResponseTime</em></p>
</div>

#### Telemetry Analysis Breakdown:

| Metric Name | Namespace / Dimension | Statistic | Evaluation Period | Operational Observation |
| :--- | :--- | :--- | :--- | :--- |
| **RequestCount** | `ApplicationELB • RequestCount • LoadBalancer` | Average / Sum | 15 minutes | Clear request spikes visible during testing windows (11:00 - 12:00 and 12:30 - 13:00) correlating with interactive RAG stream queries. |
| **HTTPCode_Target_2XX_Count** | `ApplicationELB • HTTPCode_Target_2XX_Count • LoadBalancer` | Average | 15 minutes | Aligns 100% with request volume, verifying zero 5XX server errors and zero 4XX routing faults across the testing lifecycle. |
| **TargetResponseTime** | `ApplicationELB • TargetResponseTime • LoadBalancer` | Average | 15 minutes | Consistently maintained within ~0.05s to 0.12s, demonstrating responsive compute performance from `enterprise-rag-server` and Qdrant vector indexing. |

---

### 2. Setting Up Centralized Monitoring Dashboard (CloudWatch Dashboard)

To provide technical teams with single-pane-of-glass operational visibility, a customized dashboard named **`Dashboard-RAG`** was created:

1. In **CloudWatch Console** $\rightarrow$ select **Dashboards** $\rightarrow$ click **Create dashboard** $\rightarrow$ name it **`Dashboard-RAG`**.
2. Add multi-dimensional visualization widgets:
   * **Widget 1 (CPUUtilization)**: Monitors EC2 host processor workload.
   * **Widget 2 (HTTPCode_Target_2XX_Count, RequestCount, TargetResponseTime)**: Tracks ALB traffic flow and response latencies.
   * **Widget 3 (CallCount, ErrorCount)**: Monitors API invocation volumes and runtime error rates.
   * **Widget 4 (VolumeAvgIOPS, VolumeAvgReadLatency, VolumeAvgThroughput)**: Tracks underlying EBS storage I/O performance.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-dashboard-rag.png" alt="Unified CloudWatch Dashboard-RAG Visualization" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.3.3: Unified CloudWatch Dashboard-RAG summarizing CPU, ALB metrics, Call/Error Counts, and EBS Volume IOPS</em></p>
</div>

---

### 3. Configuring Automated Alerting with Amazon SNS (CloudWatch Metric Alarm)

The system configures a proactive **Metric Alarm** to immediately notify operations personnel if the EC2 host encounters high CPU utilization due to intensive vector embedding computation or traffic surges:

#### Step 1: Select Metric and Trigger Conditions
* **Namespace**: `AWS/EC2`
* **Metric name**: `CPUUtilization`
* **InstanceId**: RAG server instance (`enterprise-rag-server` / `i-0f7f40a8245434328`)
* **Statistic**: `Average`, **Period**: `5 minutes`
* **Threshold type**: `Static` $\rightarrow$ Condition: `Greater > threshold`.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-alarm-cpu-metric.png" alt="Configuring CPUUtilization Metric for CloudWatch Alarm" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.3.4: Configuring 5-minute evaluation period and threshold conditions for host CPUUtilization</em></p>
</div>

#### Step 2: Configure Notification Actions via Amazon SNS
* **Alarm state trigger**: `In alarm`.
* **Send a notification to**: Select existing SNS topic: **`Default_CloudWatch_Alarms_Topic`**.
* **Email endpoint**: `nhatminh5224.forwork@gmail.com` (Administrator email for urgent notifications).

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-alarm-sns-action.png" alt="Configuring Amazon SNS Notification Action" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.3.5: Configuring SNS notification action dispatching alerts to nhatminh5224.forwork@gmail.com</em></p>
</div>

#### Step 3: Alarm Name and Successful Activation
* Alarm name: **`RAG-Server-High-CPU-Alarm`**.
* Click **Create alarm**. CloudWatch confirms successful creation with active monitoring status (`Actions enabled`).

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-alarm-created-success.png" alt="Successfully Created CloudWatch Alarm RAG-Server-High-CPU-Alarm" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.3.6: CloudWatch Alarm RAG-Server-High-CPU-Alarm successfully provisioned with automated notification actions enabled</em></p>
</div>

---

### Lab 5.5 Summary

Through Lab 5.5, the **Enterprise Knowledge AI RAG Assistant** successfully satisfied all production readiness standards:
* **High Availability & Precision**: Serves users via the Application Load Balancer with responsive Server-Sent Events (SSE) streaming and grounded page citations.
* **Enterprise Security**: 2-tier guardrails successfully suppressed ungrounded hallucinations and gracefully deflected out-of-domain inquiries.
* **Full Observability & Alerting**: Real-time metrics tracking via **CloudWatch Metrics**, centralized visualization through **Dashboard-RAG**, and automated incident dispatch via **CloudWatch Alarms & Amazon SNS**.
