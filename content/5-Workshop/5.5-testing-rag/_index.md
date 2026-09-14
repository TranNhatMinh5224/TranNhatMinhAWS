---
title: "End-to-End RAG Pipeline Testing & Security Guardrails"
date: 2026-08-25
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
aliases:
  - /5-workshop/5.5-testing-rag/
  - /5-Workshop/5.5-testing-rag/
  - /5-workshop/5.5-testing-cloudwatch/
  - /5-Workshop/5.5-testing-cloudwatch/
---

# 5.5. End-to-End RAG Pipeline Testing & Security Guardrails

### Lab 5.5 Overview

Following the end-to-end cloud infrastructure provisioning on AWS—spanning VPC, S3 Data Lake, RDS PostgreSQL, Qdrant Vector DB, EC2 Application Server, and Application Load Balancer (ALB)—the pivotal subsequent stage in the system engineering lifecycle involves **End-to-End Integration Testing** and validating automated AI data security guardrails.

Lab 5.5 focuses on two core technical milestones:
1. **End-to-End RAG Inference Pipeline Testing via ALB DNS**: Access the **NexusDoc AI (Deep Research Pro)** interface through the public DNS endpoint of the Load Balancer, test semantic search accuracy, verify information extraction of internship location and intended project deliverables, and validate exact source citations (`TTTN-01.docx`).
2. **2-Tier Enterprise Security Guardrails & Anti-Hallucination Testing**: Challenge the system with out-of-domain financial forecast inquiries to evaluate the **Zero-Hallucination Guardrail**, enforcing strict contextual adherence and polite refusal when external data is requested.

---

### Implementation Table of Contents:

1. [**5.5.1. End-to-End RAG Pipeline Testing via ALB Web Interface**](#551-end-to-end-rag-pipeline-testing-via-alb-web-interface)
2. [**5.5.2. Testing 2-Tier Security Guardrails & Hallucination Prevention**](#552-testing-2-tier-security-guardrails--hallucination-prevention)

---

## 5.5.1. End-to-End RAG Pipeline Testing via ALB Web Interface

### 1. Technical Objectives
* Validate Internet traffic routing from end-users through the Application Load Balancer (`rag-lb`) to frontend containers (Next.js) and backend services (FastAPI).
* Verify integrity across all four stages of the Enterprise RAG lifecycle:
  1. **Document Ingestion**: File parsing, chunking, and embedding vector extraction using the `BAAI/bge-m3` model.
  2. **Vector Storage**: Storing 1024-dimensional vectors into the `enterprise_knowledge` collection within Qdrant.
  3. **Hybrid Search & Re-ranking**: Semantic similarity matching combined with BAAI Re-ranker cross-encoder scoring.
  4. **Generation with Grounded Citations**: Large Language Model context synthesis, appending exact source file names and page numbers.

---

### 2. Live Testing Evidence

Navigate to the application web interface using the ALB DNS hostname:
`http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com`

#### Scenario 1: Internship Address Ingestion & Source Citation Verification
* Select the enterprise knowledge document: **`TTTN-01.docx`** (Internship Report Document).
* Submit the business query: **"địa chỉ thực tập là ở đâu"** *(Where is the internship address?)*.
* The NexusDoc AI system processes the context and returns factual information with clear source attribution:

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.1-nexusdoc-chat-citation.png" alt="NexusDoc AI Information Extraction and Precise Source Citation" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.1.1: NexusDoc AI Assistant synthesizing knowledge, returning the exact Bitexco 36th-floor address and citing TTTN-01.docx - Page 1</em></p>
</div>

---

#### Scenario 2: Project Deliverable Factual Extraction
* Within the active document session for `TTTN-01.docx`, submit the follow-up prompt:
* Query: **"sản phẩm dự kiến là"** *(What are the expected project deliverables?)*.
* The AI Assistant retrieves and formulates the concise factual response:

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.1-nexusdoc-chat-product.png" alt="Testing Retrieval of Expected Project Deliverables" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.1.2: AI Assistant accurately extracting the project deliverable: "Capstone Project building real-world application on AWS Free Tier" grounded in Page 1</em></p>
</div>

---

#### Test Result Analysis:
* **Factual Extraction Precision**: The assistant returned exact data points matching the source document `TTTN-01.docx`:
  * Internship Address: *Tầng 36 Tòa nhà Bitexco Financial Tower, Số 2 đường Hải Triều, Phường Sài Gòn, TP. Hồ Chí Minh*.
  * Expected Deliverable: *Dự án Capstone Project xây dựng ứng dụng thực tế trên AWS Free Tier*.
* **Grounded Source Citation**: Transparently displays verified citation badges (*`Nguồn: TTTN-01.docx - Trang 1`*), enabling instant fact-checking.
* **Responsive Latency**: Context retrieval and answer formulation execute smoothly with high factual precision.

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

Challenge the system with out-of-domain speculative questions (e.g. corporate financial forecasting):

* **Test Query**: 
  > *"Dự báo xu hướng giá cổ phiếu của tập đoàn Amazon và tình hình kinh doanh của công ty trong quý tới sẽ ra sao?"* *(What is the forecasted Amazon stock trend and financial outlook next quarter?)*
* **Expectation**: The model must strictly avoid speculative financial advice or ungrounded claims, gracefully triggering the configured guardrail:

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.2-nexusdoc-guardrail-amazon-stocks.png" alt="Testing Guardrails Out-of-Domain Financial Refusal" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.5.2.1: System guardrail triggered, safely declining ungrounded financial forecast: "Tài liệu được cung cấp không đề cập đến thông tin này."</em></p>
</div>

#### Evaluation Highlights:
* **Compliance & Determinism**: The system safely and cleanly replied: *"Tài liệu được cung cấp không đề cập đến thông tin này."*.
* **Safe Containment**: Zero unverified financial speculation, preventing hallucination risks and protecting organizational trust.

---

### Lab 5.5 Summary

Through Lab 5.5, the **Enterprise Knowledge AI RAG Assistant** successfully satisfied all production readiness standards:
* **High Availability & Precision**: Serves users via the Application Load Balancer, extracting specific internship address and project deliverable entities grounded in `TTTN-01.docx`.
* **Enterprise Security**: 2-tier guardrails cleanly declined speculative financial forecasting, eliminating hallucination risks entirely.
