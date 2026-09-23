---
title: "Building an Enterprise RAG Pipeline"
date: 2026-09-23
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
---

# 5.1. Building an Enterprise RAG Pipeline: From Web Client to Amazon Bedrock & 68% Cost Optimization on AWS

{{% notice info %}}
* **Author:** Tran Nhat Minh (Solutions Architecture & Cloud Engineering Intern)
* **Publishing Channel:** [AWS Study Group (FCJ) — Facebook Community](https://web.facebook.com/groups/awsstudygroupfcj/?multi_permalinks=2284725838959042&notif_id=1790147738731057&notif_t=feedback_reaction_generic&ref=notif)
* **Live Post Link:** [https://web.facebook.com/groups/awsstudygroupfcj/permalink/2284725838959042/](https://web.facebook.com/groups/awsstudygroupfcj/?multi_permalinks=2284725838959042&notif_id=1790147738731057&notif_t=feedback_reaction_generic&ref=notif)
{{% /notice %}}

---

### Attached System Architecture Diagram:

<div align="center" style="margin: 25px 0;">
  <img src="/images/enterprise_rag_full_architecture.png" alt="Full Enterprise RAG AWS Cloud Architecture Diagram" style="width: 100%; max-width: 950px; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.12); border: 1px solid #E2E8F0;" />
  <p><em>Figure 5.1.1: End-to-End NexusDoc AI Architecture: Zero-Trust Multi-AZ VPC, 2-Tier Guardrails, Graviton3, Qdrant, and Amazon Bedrock Mantle</em></p>
</div>

---

### Official Published Community Article:

> **Building an Enterprise RAG Pipeline: From Web Client to Amazon Bedrock & 68% Cost Optimization on AWS**
>
> I recently engineered an Enterprise RAG (Retrieval-Augmented Generation) architecture combining Zero-Trust network segmentation with containerized infrastructure (ECS Fargate / Graviton), optimizing both enterprise data security and cloud operating economics.
>
> **Why is this architecture ideal for Enterprises?**
>
> ✅ **Sensitive Data Never Leaves AWS Cloud:**  
> Engineered with a Multi-AZ VPC across isolated subnet tiers. Amazon RDS PostgreSQL and Qdrant Vector DB reside strictly within an Isolated Database Subnet without an Internet Gateway, eliminating public database exposure. Engineering teams administer databases securely via AWS Systems Manager (SSM) Session Manager rather than open SSH ports.
>
> ✅ **2-Tier Security Guardrails:**  
> Rigorous data protection and zero hallucination enforcement:
> * **Tier 1 (Pre-flight):** Intercepts and rejects Prompt Injection, Jailbreak attacks, and attempts to exfiltrate API Keys or sensitive internal credentials (PII).
> * **Tier 2 (Context Grounding):** Strictly bounds LLM reasoning to the retrieved context, automatically appending exact page/article citations and politely declining when evidence is absent from internal documents.
>
> ✅ **68% TCO Cost Optimization:**  
> Rather than provisioning dedicated GPU clusters ($600 – $800/month running 24/7), the platform pairs power-efficient AWS Graviton3 ARM64 compute for vector search with on-demand Foundation Models via Amazon Bedrock (Pay-as-you-go), reducing total cloud spend to ~$270/month.
>
> ✅ **Centralized Credential Security with AWS Secrets Manager & KMS:**  
> Completely eliminates static `.env` file risks; all 16 production environment variables are KMS-encrypted and dynamically injected at runtime via IAM Roles.
>
> ✅ **Practical Production Utility:**  
> Perfectly tailored for corporate governance policies, compliance standards, legal contracts, and engineering runbooks — users query via a responsive Web UI, receiving streaming answers with grounded page citations for instant verification.
>
> ---
> An architecture aimed at establishing a true Enterprise Knowledge Assistant: ironclad security, factual accuracy, and optimal cloud economics.  
>
> 🔗 **Live Community Post Link:** [AWS Study Group FCJ Facebook](https://web.facebook.com/groups/awsstudygroupfcj/?multi_permalinks=2284725838959042&notif_id=1790147738731057&notif_t=feedback_reaction_generic&ref=notif)
