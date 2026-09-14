---
title: "Day 2 - Investigate"
date: 2026-09-12
weight: 3
chapter: false
pre: " <b> 6.3. </b> "
aliases:
  - /6-competitions/6.3-day2/
  - /6-Competitions/6.3-Day2/
---

# 6.3. Day 2: Investigate (Agentic Cloud Investigation)

The training and live competition curriculum for Day 2 is structured according to professional standards from [Prove It: Agentic Cloud Investigation Series — Day 02 · Investigate](https://docs.cloudthinker.io/learn/workshops/prove-it/day-02-investigate), hosted by CloudThinker in partnership with FCAJ and AWS Vietnam.

---

### 1. Context & Professional Objectives for Day 02

* **Mindset Shift**:
  * While **Day 01** focused on resource boundaries: *"What exists in a cloud account?"* (Inventory & Boundaries), **Day 02** poses a far more challenging and urgent operational question: **"What caused this, right now?"**.
  * Production observability does not hand you a single clean problem; it hands you an alert stream. Signal reduction and correlation determine whether an autonomous investigator agent is economically viable and practically effective.
* **Core Permissions Policy (Zero-Change & Read-Only)**:
  * Absolute enforcement of the read-only principle: the investigator agent operates in **Read-only** mode on a live Kubernetes Demo Cluster.
  * The agent can inspect deployments, pods, events, logs, configurations, and network telemetry; it **cannot** restart, scale, deploy, edit resources, or read secrets.
  * Engineers never enter credentials. Simply select the demo environment and click *Use demo*.
  * **The agent recommends, people decide**: No fix or remediation is applied during Day 02. Every intervention requires explicit human engineer approval.
* **Redaction & Security Policy**:
  * Anything identifying a real system (internal domain names, private IPs, cluster IDs, ARNs, secret keys) must be redacted before sharing or presenting.

---

### 2. Rules of the Room & Agenda (150 Minutes)

| Time Window | Block | Requirements & Deliverables |
| :--- | :--- | :--- |
| **00:00 – 00:35** (35 mins) | **Learn Block** | Master the 8 signal reduction layers and root cause reasoning methodology in production environments. |
| **00:35 – 01:00** (25 mins) | **Keynote** | Deep dive: *"The Integration Problem Was a Context Problem"* — Connecting 100+ Cloud & Observability platforms via executable code instead of stuffing tool schemas into LLM context. |
| **01:00 – 01:30** (30 mins) | **Practice Block** | 30-minute non-stop live lab: 1 team, 1 read-only agent, diagnosing a live Kubernetes production degradation. |
| **01:30 – 01:50** (20 mins) | **Share Block** | 3-minute presentation of causal mechanism and evidence + 2-minute cross-examination; comparing diverse conclusions across teams. |

> [!NOTE]
> **Keynote Summary (25 mins)**: *"The Integration Problem Was a Context Problem"*.
> Why writing code for an agent to call beats packing tool schemas into its context window, and how the engineering team rapidly built 100+ secure integrations to cloud and observability platforms (AWS, Kubernetes, Datadog, Prometheus) without context exhaustion or reasoning degradation.

---

### 3. The Eight Learnings: Signal Reduction & Incident Investigation

#### 3.1. You cannot investigate what you cannot rank
A production night does not hand you one incident. It hands you a stream:
* An access finding fires on a production IAM role at 02:14.
* 180 `AccessDenied` lines land in the audit log in the exact same minute.
* Three downstream services fire near-identical alerts simultaneously.
* By 02:16, the on-call engineer has five dashboards open for a single underlying issue.

In a typical workspace, an overnight stream of roughly **13,000 raw events** must collapse into approximately **40 clusters** worth acting on. The investigation is not the hard part at 2:00 AM; **choosing what to investigate** is the decisive challenge.

The four traditional responses and their high hidden costs:

| Traditional Response | What It Costs |
| :--- | :--- |
| **Hire more on-call engineers** | Burnout, and alert volume doubles again next quarter. |
| **Raise alert thresholds** | The one critical alert that actually mattered drops below the line and gets missed. |
| **Mute the noisy channel** | A dangerous blind spot that nobody owns and nobody remembers creating. |
| **Add another dashboard** | One more screen that nobody reads at 02:14 in the morning. |

Each of these is an unwritten, informal decision about what you agree to lose. That is the same governance gap addressed on Day 01, targeted at the signal instead of at the agent.

---

#### 3.2. Noise dies in layers, not in one filter
Reduction is a sequential 4-stage pipeline: **Ingest $\rightarrow$ Suppress $\rightarrow$ Correlate $\rightarrow$ Classify & Route**. 

Almost everything occurs in the second step (**Suppress**), which comprises **8 layers running in strict priority order**. The first layer to match wins:

| Order | Layer | Function & Noise Dropped |
| :---: | :--- | :--- |
| 1 | **Deduplication** | Drops exact repeats of the same event. |
| 2 | **Rate limit** | Suppresses bursts above a per-key ceiling. |
| 3 | **Snooze** | Honors signals that an engineer intentionally muted. |
| 4 | **Prior verdict** | Filters patterns previously classified as noise by human operators (*self-learning layer*). |
| 5 | **Noise signature** | Drops known benign static patterns. |
| 6 | **Flapping** | Suppresses metrics oscillating across a threshold repeatedly. |
| 7 | **Cascade** | Drops downstream secondary effects of an identified root signal. |
| 8 | **Severity normalization** | **Drops nothing**. Re-evaluates and corrects mislabeled severity stamps assigned by third-party tools. |

> [!NOTE]
> * **Cascade** removes the largest volume of alerts, but carries the highest risk of masking a real outage if the root signal was incorrectly mapped.
> * **Severity normalization** confronts an uncomfortable truth: provider-stamped severity is merely a guess, and you are entitled to re-grade it.
> * **Prior verdict** is the autonomous learning layer: a background agent reviews closed incidents, identifies recurrent patterns with identical verdicts, and writes them into suppression rules so the pipeline becomes quieter over time.

---

#### 3.3. Every suppression rule needs an escape hatch
Silence must expire and must be overridable, or it becomes an unmonitored permanent blind spot:

| Escape Hatch Property | System Behavior |
| :--- | :--- |
| **The Window Grows** | A pattern confirmed as noise is silenced for 6 hours. Confirmed again: 24 hours. Again: 7 days. |
| **The Bypass Wins** | Any High or Critical signal matching the suppressed pattern immediately bypasses the filter and resets the suppression window to zero. |
| **The Release** | An engineer manually unmuting the signal, or a route into an active incident, clears the window immediately. |

> [!IMPORTANT]
> **Data Retention**: A suppressed event is preserved in storage, never deleted. Engineers can always query: *"What did the system silence last night?"*.

---

#### 3.4. Reduction is what makes the investigator agent affordable
Without signal reduction, autonomous investigation becomes economically unsustainable:
* A CloudWatch alarm flapped 18 times in 53 minutes.
* If every firing triggered an autonomous Root Cause Analysis (RCA), the system would launch 11 separate investigations for the exact same problem, producing 11 identical reports, and generating **11 LLM API bills**.

To ensure economic feasibility, **3 strict gates** must be satisfied before spinning up an investigator agent:
1. **At least one actionable signal**: A cluster composed entirely of suppressed signals never pays for an agent.
2. **A new signature, not a repeat**: Alert volume alone does not re-arm the investigation trigger; technical novelty does.
3. **Cooldown period (No recent run on the same cluster)**: A mandatory minimum interval between consecutive investigations on the same resource cluster.

---

#### 3.5. The agent splits the question, not the work
An investigation progresses through 4 phases: **Gather context $\rightarrow$ Branching checkpoint $\rightarrow$ Parallel hypothesis testing $\rightarrow$ Single unified verdict**.

* **Fan-out by hypothesis**: The system spawns 2 to 4 (maximum 8) read-only sub-investigators running concurrently. Each tests a competing hypothesis against the same body of evidence.
* **Single lead verdict**: Sub-investigators record no separate external output; the lead agent synthesizes findings into one definitive verdict.
* **The Distinguishing Query**: The defining skill of modern investigation is identifying the **single query whose result differs depending on which hypothesis is true**. This query definitively rules out (*kills*) the false hypothesis. All other queries merely confirm what you already believe.

---

#### 3.6. Order in time is not proof of cause
Three cognitive traps frequently distort incident timeline analysis:

| Cognitive Trap | Manifestation |
| :--- | :--- |
| **After is not because** | Deployment at 10:02, latency spike at 10:05; without a verifiable causal path between them, this is mere coincidence. |
| **Both are symptoms** | Two metrics surge together due to an upstream change; neither caused the other; they share a common root. |
| **The trigger is gone** | The initial surge that triggered the incident ended an hour ago, but the system remains degraded due to self-sustaining load. |

> [!TIP]
> **Classic Case Study: The Retry Storm**:
> * `10:00`: Database failover to standby completes in 30 seconds (expected behavior).
> * `10:01`: All active connections drop at once; thousands of clients fail simultaneously and retry at the exact same instant.
> * `10:06`: Database failover completed; inbound external user traffic returns to normal.
> * `10:30`: System remains heavily degraded. Cascading timeouts generate continuous retries; the retries themselves are now the primary load.
> 
> **Rigorous Classification**:
> * **Trigger**: Failover event at 10:00 — already finished, nothing left to roll back.
> * **Root Cause**: Client retry policy with no upper cap and missing exponential backoff/jitter — this is the sole configuration that was and remains incorrect.
> * **Contributing Factor**: Missing circuit breaker — it would have halted the storm, but this vulnerability existed prior to this incident.

---

#### 3.7. The root cause is the resource that changed
A canonical causal graph consists of 5 node types:

| Node Type | Meaning in Incident Analysis |
| :--- | :--- |
| **Trigger** | The event that set off the incident (often transient and already over). |
| **Root cause** | **The single resource whose own configuration diverged** from its baseline, its previous revision, or its sibling nodes. |
| **Contributing factor** | A pre-existing baseline condition whose change timestamp cannot be established. |
| **Impact** | Customer degradation, phrased in user-centric terms. |
| **Recovery** | The action or mechanism that restored normal operations. |

> [!CAUTION]
> Configuration divergence is a claim about time. It must be proven by **dating each candidate** (creation timestamp, revision history, `last-applied-configuration`). Never identify the root cause by whichever resource currently displays the most severe symptoms—that resource is almost always a **victim**.

---

#### 3.8. A system that scores itself proves nothing
An autonomous system's reliability is proven by what it **refuses to claim** without verifiable proof:

| System Claim | Required Backing Evidence |
| :--- | :--- |
| *"92% accurate"* | An independent verdict written by human engineers—never an agent self-scoring its own execution. |
| *"This caused that"* | A traceable, end-to-end causal path from configuration change to customer impact. |
| *"The fix held"* | An automated re-check executed ~30 minutes post-remediation, reporting verified status. |
| *"I am confident"* | A rival explanation tested concurrently and definitively ruled out by contradictory evidence. |

---

### 4. Team Practice Challenge (30-Minute Live Block)

#### 4.1. Incident Challenge Brief
* **Incident Title**: **Hotel Search Degradation After Traffic Recovery**.
* **Environment**: Read-only Kubernetes Demo Cluster on CloudThinker.
* **Permission Boundaries**:
  * **Permitted**: Inspect deployments, pods, events, logs, configurations, and network traffic telemetry.
  * **Blocked (`[blocked]`)**: Cannot restart, scale, deploy, edit any resources, or read secrets.

#### 4.2. Demo Environment Connection Workflow (3 Steps)
1. Sign in at [app.cloudthinker.io](https://app.cloudthinker.io/) and click **Try a demo environment** ("a read-only cloud we run").
2. Open the **Connections** panel and select **Kubernetes**.
3. Click **Use demo** on the top banner (no credential input required).

#### 4.3. 30-Minute Investigation Pacing Rail
* **T+00**: Connect to cluster and inspect user-facing symptoms (bypass deceptively healthy dashboards).
* **T+05**: Formulate the **Incident Question**: What is broken, for whom, and since when?
* **T+10**: Establish at least **two competing hypotheses** in the investigation log.
* **T+18**: Execute the **Distinguishing Query** that definitively rules out one hypothesis.
* **T+25**: Compile and submit the standardized 5-block incident report before the Share block begins.

#### 4.4. Strategic Prompts for the Agent (What to ask the agent)
To overcome confirmation bias, teams employ four structured query prompts:
1. *"Something is degraded in this cluster. Describe the symptom in terms of what a user would notice, and tell me what your role could not read."*
2. *"Give me at least two different explanations for this symptom that are both consistent with the evidence so far."*
3. *"Which single query would come out differently depending on which of those explanations is true? Run it and show me the raw output."*
4. *"Which resource here can you show actually changed, with a timestamp? Which ones are you only assuming changed?"*

#### 4.5. Troubleshooting Strategies (Stuck?)
* **Dashboards report healthy status**: Inquire what end users are experiencing rather than relying on dashboard status. Deceptively green dashboards are part of the challenge.
* **Agent immediately offers a single confident cause**: Demand a rival hypothesis and the distinguishing query that separates the two.
* **Agent encounters permission errors**: Record the check immediately as `[blocked]`. A blocked check is a valid, informative result.
* **Running short on time**: Submit the report with unproven gaps explicitly identified. That constitutes a complete, professional report.

---

### 5. Standardized 5-Block Incident Report Structure

The competition report is structured into 5 rigorous, standardized blocks (PDF, Doc, or Markdown):

| Report Block | Mandatory Deliverable Requirements |
| :--- | :--- |
| **01 · Incident Question & Scope** | What is broken, which users are impacted, and the precise timestamp when degradation began. |
| **02 · Two Hypotheses, One Ruled Out** | Supporting evidence for each hypothesis and the **specific distinguishing query that ruled out the losing explanation**. |
| **03 · Key Evidence Triplet** | Every claim backed by: **Source — Scope — Time**, tagged with `[verified]` or `[blocked]`. |
| **04 · Causal Mechanism** | Causal graph connecting trigger to customer impact, explicitly noting any unproven links (*unproven edges*). |
| **05 · Root Cause vs. Contributing Factor** | Specifically identified resource configuration divergence with **verifiable timestamps (dated)**, strictly differentiated from undated background conditions. |

---

### 6. Day 02 Professional Glossary

| Term | Operational Definition in Agentic Cloud Investigation |
| :--- | :--- |
| **Signal** | A single operational event after passing through all suppression and reduction layers. |
| **Cluster** | A grouped set of related signals forming an actionable candidate incident. |
| **Suppression** | Silencing an event via prioritized, ordered rules rather than blunt channel muting. |
| **Flapping** | A metric oscillating across an alert threshold repeatedly for a single root condition. |
| **Cascade** | Downstream secondary effects resulting from an already identified upstream root signal. |
| **Trigger** | The initiating event that set off the incident; often transient and completed before investigation begins. |
| **Root cause** | The single resource whose configuration diverged from its baseline, previous revision, or peers. |
| **Contributing factor** | A pre-existing baseline condition whose change timestamp cannot be verified. |
| **Hypothesis** | An explanation framed precisely enough that a specific query could contradict and disprove it. |
| **Blocked** | The agent was prevented by role permissions or safety boundaries; a valid and expected result. |

---

### 7. Looking Ahead to Day 03: Prove It Arena

Having completed Day 02, the team has mastered modern incident investigation capabilities: rigorously distinguishing between **Trigger**, **Root Cause**, and **Contributing Factor**, executing hypothesis elimination via **Distinguishing Queries**, and producing evidence-backed incident reports.

These capabilities will be put to the ultimate test in **Day 03 · Prove It Arena**—an unfamiliar infrastructure environment, an unexpected real-time production outage, and direct technical defense before an expert panel of judges.
