---
title: "Day 3 - Prove It Arena"
date: 2026-09-19
weight: 4
chapter: false
pre: " <b> 6.4. </b> "
aliases:
  - /5-competitions/5.4-day3/
---
# 6.4. Day 3: Prove It Arena (Agentic Cloud Final Championship)

Day 03 closes [Prove It](https://docs.cloudthinker.io/learn/workshops/prove-it/overview), the Agentic Cloud Investigation Series jointly organized by CloudThinker, First Cloud Journey (FCAJ), and AWS Vietnam.

Unlike Day 01 (governance principles and resource inventory) and Day 02 (alert stream reduction and incident causal chains), **Day 03 is an intensive live Arena competition**: no lectures and no keynotes. The day consists of a concise briefing, two scored competitive rounds with an independent **AI Judge**, a strategic break, and an official **Reveal and Close**.

---

### 1. Rules of the Room & Tournament Schedule (150 Minutes, 7 Blocks)

The competition operates across **150 minutes** with an authoritative countdown clock displayed centrally on the Arena board at [arena.cloudthinker.io](https://arena.cloudthinker.io/):

| Block (#) | Session | Duration | Description |
| :---: | :--- | :---: | :--- |
| **1** | **Leadership Intro** | 10 min | Opening remarks from AWS leadership and event organizers. |
| **2** | **Briefing** | 10 min | Room rules, submission economy, AI scoring mechanics, and clock protocol. |
| **3** | **Community Share** | 30 min | Three exemplary reports from Day 01 & Day 02 presented by selected teams across three cities (10 min each). |
| **4** | **Round 1 · Find the Gaps** | 25 min | Read-only architecture review. **30 points**, live public board. |
| **5** | **Break** | 10 min | Round 1 closes, scores stand, and teams calibrate Round 2 strategies. |
| **6** | **Round 2 · Find the Cause** | 45 min | Live customer-impacting production incident. **70 points**, sealed board. |
| **7** | **Reveal and Close** | 20 min | Unsealing the final board, walkthrough of target environments, and championship awards. |

#### Inviolable Rules of the Arena:
* **Strict Read-Only**: The AI Agent inspects the environment. It **cannot change anything, restart services, deploy code, or read secrets**.
* **Zero Credentials Entered**: Participants authenticate via team codes; environments are operated securely on their behalf.
* **Team Recommends, Humans Decide**: Every change proposed in a report is a recommendation with a **Named Owner**. Nothing executes automatically against live infrastructure.
* **Team Roster**: 1 to 4 members per team. One laptop is sufficient; the entire team views the synchronized editor and board.
* **Mandatory Redaction**: Account IDs, internal endpoints, private IPs, and identifiers must be stripped before reports are submitted.

---

### 2. Scoring Mechanics & "The Attempt Economy"

The evaluation panel is an autonomous **AI Agent Judge** operating under deterministic, rigorous guidelines:

| Rule | Operational Mechanism |
| :--- | :--- |
| **One Report per Round** | Standard Markdown (`.md`). Teams can upload local files or type in the Arena web editor. |
| **Versions Are Free** | Save as many drafts as desired. Each draft preserves its precise timestamp and cryptographic hash. |
| **One Final per Round** | Clicking **"Mark final & grade"** dispatches that version to the AI Judge. The latest marked final constitutes the official score. |
| **Three Graded Attempts** | Maximum of **3 graded submissions per round**. Each final submission consumes one attempt. |
| **Three-Minute Cooldown** | Mandatory 3-minute cooldown between attempts to prevent trial-and-error guessing loops. |
| **Mandatory Final Mark** | If time expires without marking a final version, nothing is graded and the round scores **zero points**. *(Strategy: Mark a solid initial baseline early)*. |
| **Tie-Breaker Rule** | Earliest final submission timestamp on the clock takes precedence in rankings. |
| **Zero Hints** | No hint mechanisms exist. Points are never deducted except through graded attempt expenditure. |

> [!IMPORTANT]
> **AI Judge Behavior**:
> * The AI Judge evaluates the report strictly as written across **three independent runs, adopting the median score**.
> * Each submission returns a total score and a **concise actionable feedback note**, guiding improvements for subsequent attempts.
> * The judge **never discloses ground truth answers, gaps, or root causes**, and will never inspect the live environment on your behalf. Reports must stand on self-contained, indisputable evidence.
> * **In Round 2, the board is sealed**: Teams only observe that an attempt was processed; numerical scores remain locked until the Reveal block.

---

### 3. What a Report Needs to Score

Every assertion is valued strictly by the evidence backing it. Every line must answer three foundational questions:

| Verification Question | Criteria | Standard Evidence Tag |
| :--- | :--- | :---: |
| **Source** | Which CLI/API call produced this output? | `[verified]` — Proved by raw output attachment |
| **Scope** | Which environment and IAM role was examined? | `[inferred]` — Reasoned logically from verified facts |
| **Time** | When was this state confirmed true? | `[assumed]` — Hypothesized without hard evidence<br/>`[blocked]` — Access restricted by IAM/Security policy |

> [!TIP]
> **Quality Over Volume**: Findings are uncapped, but the AI Judge penalizes noise and rewards rigor. **One proved finding beats five speculative guesses**, and a report that transparently acknowledges permission boundaries (`[blocked]`) outscores reports that conceal observational gaps.

---

### 4. Round 1 · Find the Gaps (25 Minutes, 30 Points)

* **Mission**: Analyze an unfamiliar cloud environment within 25 minutes, pinpoint architectural vulnerabilities, and prove them with raw telemetry on an open leaderboard.
* **Evaluation Framework**: Assessed across the **5 AWS Well-Architected Framework Lenses**: Cost, Security, Performance, Reliability, and Operational Excellence.

#### Three Mandatory Report Blocks:
1. **Block 01 · What You Looked At**: Target environment description, explored inventory, and blocked IAM/network boundaries.
2. **Block 02 · What You Would Fix**: Prioritized findings ordered by operational impact. Each finding requires raw output evidence, a verification tag, and attribution to at most one Well-Architected lens.
3. **Block 03 · What Needs a Person**: Specific changes requiring human change-board approval, and speculative leads intentionally discarded.

#### Round 1 Time Budget:
* `T+00`: Inspect environment configuration via Agent before drafting text.
* `T+05`: Consolidate finding shortlist (five lenses provide a balanced frame, not a quota).
* `T+10`: **Submit first version and mark final**. *(Early judge feedback outweighs ten additional minutes of unguided drafting)*.
* `T+18`: Submit refined second version targeting identified weaknesses.
* `T+23`: Conclude drafting. Round closes precisely on the clock.

---

### 5. Round 2 · Find the Cause (45 Minutes, 70 Points)

* **Mission**: Investigate an active customer-impacting production outage under a sealed leaderboard.
* **Objective**: Establish an unbroken **Causal Chain** from user-facing symptoms down to the exact resource whose configuration diverged, followed by an actionable response proposal.

#### Five Mandatory Report Blocks:
1. **Block 01 · Question & Scope**: Problem statement (what is broken, affected users, onset timestamp) and unobservable data boundaries.
2. **Block 02 · Hypotheses (One Ruled Out)**: Present at least **two rival hypotheses**, detailing the specific metrics or logs that conclusively eliminated the incorrect path.
3. **Block 03 · Evidence**: Unaltered raw logs, API calls, and telemetry with explicit timestamps.
4. **Block 04 · The Mechanism**: Step-by-step failure propagation model, clearly identifying any unproven edge in the causal chain.
5. **Block 05 · Root Cause & Response**: The specific resource verified to have changed, separated from baseline static conditions, paired with a remediating proposal and named approval owner.

#### Round 2 Time Budget:
* `T+00`: Study customer symptom description in original phrasing before checking dashboards.
* `T+05`: Formulate precise incident scope: *What failed? Who is impacted? When did it begin?*
* `T+12`: Formulate two rival hypotheses and identify differentiating telemetry.
* `T+25`: **Submit first version and mark final** to secure baseline points.
* `T+40`: Submit enhanced version strengthening the weakest causal link.

---

### 6. Day 03 Arena Glossary

| Term | Arena Definition |
| :--- | :--- |
| **Board** | Real-time leaderboard tracking team scores and rankings (Public in Round 1, Sealed in Round 2). |
| **Version** | Saved report draft stored with immutable timestamp and content hash. Draft saves are unlimited. |
| **Final** | The single designated version per round evaluated by the AI Judge upon clicking "Mark final & grade". |
| **Graded Attempt** | Three autonomous evaluation passes by the AI Judge on a marked final (Quota: 3 per round). |
| **Median Score** | The middle value across the AI Judge's three runs, forming the official score for that attempt. |
| **Lens** | One of five Well-Architected review angles: Cost, Security, Performance, Reliability, Operations. |
| **Causal Chain** | The end-to-end deductive pathway connecting observed symptoms to the root configuration change. |
| **Trigger / Root Cause / Contributing Factor** | *Trigger*: Event precipitating the incident; *Root Cause*: Diverged resource configuration; *Contributing Factor*: Pre-existing latent condition. |
| **Blocked** | Access denied by IAM or network boundary. Documenting blocked scope constitutes a valid finding. |

---

### 7. Post-Series Outcomes & Next Steps (What Comes Next)

Completing all three days of the **Prove It: Agentic Cloud Investigation Series** delivers significant achievements:
* **Three Production Portfolio Artifacts**: Comprehensive documentation covering Agent Governance, Kubernetes Troubleshooting, and Arena Incident Defense.
* **Series Skill Certificates**: Official certification validating expertise in AI-assisted cloud diagnostics and enterprise resilience.
* **CloudThinker Ambassador Program**: Outstanding finalists qualify for selection into the prestigious 3-month **CloudThinker Ambassador Program**, collaborating with international cloud leaders on next-generation agentic technologies.
