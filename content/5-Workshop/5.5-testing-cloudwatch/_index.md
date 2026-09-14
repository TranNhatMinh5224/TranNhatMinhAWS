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

Following the end-to-end cloud infrastructure provisioning on AWS—spanning VPC, S3 Data Lake, RDS PostgreSQL, Qdrant Vector DB, EC2 Application Server, and Application Load Balancer (ALB)—the pivotal subsequent stage in the system engineering lifecycle involves **End-to-End Integration Testing** and establishing **Operational Observability & Monitoring**.

Lab 5.5 focuses on three core technical milestones:
1. **End-to-End RAG Inference Pipeline Testing via ALB DNS**: Access the web user interface directly through the public DNS endpoint of the Load Balancer, ingest enterprise knowledge documents (`TTTN-01.docx`), and execute semantic inquiries empowered by real-time streaming responses via **Server-Sent Events (SSE Streaming)**.
2. **2-Tier Enterprise Security Guardrails & Anti-Hallucination Testing**: Evaluate prompt injection detection mechanisms, sensitive keyword filtering, and polite **Out-of-Domain Refusal** protocols ensuring zero hallucination when queries fall outside the document context.
3. **Infrastructure Performance Monitoring via Amazon CloudWatch Metrics**: Track operational telemetry metrics from the Application Load Balancer (`RequestCount`, `HTTPCode_Target_2XX_Count`, `TargetResponseTime`) to analyze live user traffic patterns, request success rates, and target processing latencies.

---

### Implementation Table of Contents:

1. [**5.5.1. End-to-End RAG Pipeline Testing via ALB Web Interface**](#551-end-to-end-rag-pipeline-testing-via-alb-web-interface)
2. [**5.5.2. Testing 2-Tier Security Guardrails & Hallucination Prevention**](#552-testing-2-tier-security-guardrails--hallucination-prevention)
3. [**5.5.3. System Observability with Amazon CloudWatch Metrics**](#553-system-observability-with-amazon-cloudwatch-metrics)

---

## 5.5.1. End-to-End RAG Pipeline Testing via ALB Web Interface

### 1. Technical Objectives
* Validate Internet traffic routing from end-users through the Application Load Balancer (`rag-lb`) to frontend containers (Next.js) and backend services (FastAPI).
* Verify integrity across all four stages of the Enterprise RAG lifecycle:
  1. **Document Ingestion**: File parsing, chunking, and embedding vector extraction using the `BAAI/bge-m3` model.
  2. **Vector Storage**: Storing 1024-dimensional vectors into the `enterprise_knowledge` collection within Qdrant.
  3. **Hybrid Search & Re-ranking**: Semantic similarity matching combined with Cosine distance scoring.
  4. **Generation with Streaming**: Large Language Model context synthesis and progressive token streaming back to client browsers over Server-Sent Events (SSE).

---

### 2. Live Testing Evidence

Navigate to the application web interface using the ALB DNS hostname:
`http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com`

* Select the enterprise knowledge document: **`TTTN-01.docx`** (Internship Report Document).
* Submit an in-domain business query: **"Trình độ đào tạo và ngành đào tạo của tôi là gì?"** *(What is my degree level and major?)*.
* Inspect the browser DevTools (F12) Network tab to confirm SSE streaming chunks received over HTTP 200 `/api/v1/chat/stream`.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.1-web-rag-chat-e2e.png" alt="End-to-End Chatbot Web UI Testing via ALB" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.1: Web AI Assistant streaming semantic responses grounded in TTTN-01.docx via SSE protocol with HTTP 200 OK status</em></p>
</div>

#### Test Result Analysis:
* **Factual Extraction Precision**: The assistant returned exact data points matching the source document:
  * Degree level: *Đại học (Bachelor's Degree)*
  * Field of study: *Công nghệ thông tin (Information Technology)*
  * Major: *Kỹ thuật phần mềm (Software Engineering)*
* **First-Token Latency**: Enabled by Server-Sent Events (SSE), initial response tokens reached the client within ~450ms, drastically eliminating perceived wait time compared to traditional blocking HTTP calls.

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

## 5.5.3. System Observability with Amazon CloudWatch Metrics

### 1. Monitoring Objectives
* **Amazon CloudWatch** provides integrated observability and monitoring across AWS services, ingesting operational metrics in real-time.
* For the **Application Load Balancer (`rag-lb`)**, three mission-critical telemetry metrics are continuously tracked:
  1. **`RequestCount`**: The total volume of HTTP/HTTPS requests handled by the Load Balancer across specified intervals.
  2. **`HTTPCode_Target_2XX_Count`**: The number of successful response codes (200 OK, 201 Created) returned from target instances.
  3. **`TargetResponseTime`**: The average elapsed time (in seconds) between when a target receives an HTTP request and when it finishes sending response bytes back to the ALB.

---

### 2. Live AWS Console Telemetry Evidence

Navigate to **CloudWatch Management Console** $\rightarrow$ select **Metrics** $\rightarrow$ choose **All metrics** $\rightarrow$ select namespace **`AWS/ApplicationELB`** $\rightarrow$ filter by Load Balancer **`rag-lb`** and plot the target performance graph.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-alb-metrics.png" alt="CloudWatch Metrics Monitoring for Application Load Balancer" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.3: Amazon CloudWatch Metrics dashboard displaying RequestCount, HTTPCode_Target_2XX_Count, and TargetResponseTime for Application Load Balancer rag-lb</em></p>
</div>

#### Telemetry Analysis Breakdown:

| Metric Name | Namespace / Dimension | Statistic | Evaluation Period | Operational Observation |
| :--- | :--- | :--- | :--- | :--- |
| **RequestCount** | `ApplicationELB • RequestCount • LoadBalancer` | Average / Sum | 15 minutes | Clear request spikes visible during testing windows (11:00 - 12:00 and 12:30 - 13:00) correlating with interactive RAG stream queries. |
| **HTTPCode_Target_2XX_Count** | `ApplicationELB • HTTPCode_Target_2XX_Count • LoadBalancer` | Average | 15 minutes | Aligns 100% with request volume, verifying zero 5XX server errors and zero 4XX routing faults across the testing lifecycle. |
| **TargetResponseTime** | `ApplicationELB • TargetResponseTime • LoadBalancer` | Average | 15 minutes | Consistently maintained within ~0.05s to 0.12s, demonstrating responsive compute performance from `enterprise-rag-server` and Qdrant vector indexing. |

---

### Lab 5.5 Summary

Through Lab 5.5, the **Enterprise Knowledge AI RAG Assistant** successfully satisfied all production readiness standards:
* **High Availability**: Efficiently served end-users through the public Application Load Balancer DNS endpoint with smooth Server-Sent Events (SSE) streaming.
* **Enterprise Security**: 2-tier guardrails successfully suppressed ungrounded hallucinations and gracefully deflected out-of-domain inquiries.
* **Full Observability**: Amazon CloudWatch telemetry confirmed 100% 2XX delivery reliability and low target response latency under interactive load.
