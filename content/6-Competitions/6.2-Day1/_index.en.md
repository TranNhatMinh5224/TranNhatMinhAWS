---
title: "Day 1 - Govern"
date: 2026-09-08
weight: 2
chapter: false
pre: " <b> 6.2. </b> "
aliases:
  - /5-competitions/5.2-day1/
---

# 6.2. Day 1: Govern (Agentic Cloud Investigation)

The Day 1 workshop and practice challenges adhered strictly to the curriculum of [Prove It: Agentic Cloud Investigation Series — Day 01 · Govern](https://docs.cloudthinker.io/learn/workshops/prove-it/day-01-govern), jointly presented by CloudThinker, FCAJ, and AWS Vietnam.

---

### 1. Context & Core Objectives

* **Industry Problem**: AI coding agents excel at generating code and passing tests within local repositories, but when placed into live cloud environments, they frequently produce hallucinations, erroneous assumptions, or ungoverned infrastructure modifications.
* **Day 01 Objective**: Equip cloud engineers with actionable methodologies to govern, audit, and direct AI agents in investigating live AWS environments safely and strictly through an evidence-based approach.

---

### 2. The Five Foundational Learnings

During the technical briefing (*Learn Block - 35 mins*), our team absorbed and implemented the 5 core principles:

1. **Agent Definition (`Agent = Model + Environment`)**: An agent's capability and safety depend critically on its operating environment and tools, not just the underlying LLM.
2. **Boundary Awareness**: Cloud infrastructure has no single bounded workspace folder; agents must be explicitly constrained to approved scopes.
3. **Human-in-the-Loop**: "Auto mode" requires human oversight; any infrastructure changes must mandate explicit human approval.
4. **Layered Interaction**: Each tool call passes through multiple governance layers: CLI/SDK, VPC networking boundaries, IAM Least-Privilege policies, and API endpoints.
5. **Claim Verification**: Every cloud claim produced by an agent must be backed by three pillars: **Source — Scope — Time**.

---

### 3. Hands-on Practice Block (95 mins)

Connecting to a dedicated, read-only AWS Demo Account, **Team 06 — WAR** completed a structured investigation:

* **Defined Investigative Question**: Selected a deep-dive investigation into Well-Architected pillars (Security, Cost Optimization, Reliability, and Performance).
* **Directed AI Agent Inspection**: Prompted and guided the agent to inspect live AWS resources (EC2, S3, IAM, Security Groups) without disruption.
* **Authored Optimization & Investigation Report**:
  * **Categorized 4-Tier Verification Labels**: Each agent finding was strictly audited and labeled:
    * `[verified]`: Supported by unambiguous, direct configuration logs and evidence.
    * `[inferred]`: Logically deduced from validated resource parameters.
    * `[assumed]`: Unsubstantiated AI assumptions requiring further proof.
    * `[blocked]`: Obstructed by permission boundaries or network policies.
  * **Dropped Unsupported Claims**: Proactively eliminated broad, generic AI advice lacking concrete backing in the live environment.
  * **Redacted Sensitive Information**: Anonymized all AWS Account IDs, ARNs, and sensitive data prior to submission.
  * **Designated Human Approval Actions**: Highlighted *The One Finding to fix first* and clearly separated recommendations that strictly require human authorization.

---

### 4. Evaluation & Day 1 Scoring (Share Block)

Following report submission and presentation before the Judging Panel and AWS Mentors, **Team 06 — WAR** attained:

* **Status**: Official verification and completion of Day 1 requirements (☑️).
* **Day 1 Score**: **70.8 points** — Recognizing our disciplined governance methodology, evidence-backed findings, and professional optimization reporting.

<div style="text-align: center; margin: 25px 0;">
  <img src="/images/5-Competitions/KetQuaDay1_TeamWAR.png" alt="Team 06 WAR Day 1 Official Evaluation Results" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); max-width: 100%; height: auto;" />
  <p style="font-style: italic; color: #666; margin-top: 8px;">Official Day 1 scoring and verification sheet for Team 06 (WAR) from the Organizing Committee</p>
</div>

---

### 5. Day 1 Activities & Recap Photos

Highlights of team collaboration and hands-on session at the AWS Vietnam Office (7th Floor, Grand Terra Tower, 36 Cat Linh, Hanoi):

<div style="text-align: center; margin: 25px 0;">
  <img src="/images/5-Competitions/RecapDay1.1.JPG" alt="Day 1 Recap - Working session at AWS Vietnam Office (Photo 1)" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 90%; height: auto; margin-bottom: 20px;" />
  <p style="font-style: italic; color: #666; margin-top: -10px; margin-bottom: 25px;">Day 1 working and mentoring session at AWS Vietnam Office (Photo 1)</p>
  
  <img src="/images/5-Competitions/RecapDay1.2.JPG" alt="Day 1 Recap - Working session at AWS Vietnam Office (Photo 2)" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 90%; height: auto;" />
  <p style="font-style: italic; color: #666; margin-top: 8px;">Day 1 commemorative working session at AWS Vietnam Office (Photo 2)</p>
</div>
