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

### 5. Live Production Incident Report: Hotel Search Degradation After Traffic Recovery

Read-only live incident report tracing customer-visible search failure to retry-amplified saturation of the rate-service capacity boundary.

---

#### 5.1. Executive Summary

* **Verdict**: The incident is ongoing.
* **Verified root cause**: The `search` service retries each request against a `rate` service capped at **20 backend QPS**; at the observed **7.60 search RPS** and **2.87 attempts per request**, demand reaches **21.81 backend attempts/s**, **9.1% above the configured limit**. The 256-entry queue averaged **88.5% full** and reached **100%**, producing `ResourceExhausted` and then `DeadlineExceeded` responses.
* **Customer outcome**: Customers received **no successful hotel-search outcomes (Success Rate: 0.000)** even though Kubernetes showed healthy pods and nodes.
* **Scope**: `hotel-prod-apse1`, namespaces `hotel-reservation` and `synthetics`, customer path `GET /hotels`, live read-only evidence. No configuration or workload was changed.

| Key Metric | Observed Value | Scope / Window | Operational Meaning |
| :--- | :---: | :--- | :--- |
| **Customer search success** | **0.000 (0.0%)** | 30-minute average (Synthetic user journey) | Customers experienced total search unavailability |
| **Search p95 latency** | **6.05 s (6,050.8 ms)** | Observed range 5.41 – 6.33 s on customer path | Latency severely degraded across all queries |
| **Rate queue utilization** | **88.5% average** | 226.6 of 256 entries average; maximum 256 | Queue fully saturated causing cascading timeouts |

> [!IMPORTANT]
> **Bottom line**: Treat customer outcome success as authoritative. Kubernetes readiness and completed RPS are **false-green signals** for this failure mode.

---

#### 5.2. Customers Lost Successful Hotel Searches

During the bounded 30-minute window (`2026-09-12 02:49:49` – `03:19:34 UTC`), the synthetic user journey continuously exercised the same hotel-search URL at 8 configured RPS. The traffic process completed **7.35 RPS** on average (91.9% of configured traffic), but the result success rate remained **0.000** and p95 latency averaged **6,050.8 ms**.

| Metric | Observed Value | Window / Scope | Status |
| :--- | :---: | :--- | :---: |
| **Configured traffic** | `8.00 RPS` | 2026-09-12 02:49:49 – 03:19:34 UTC | `[Verified]` |
| **Completed traffic** | `7.35 RPS` average | 103 samples; same window | `[Verified]` |
| **Successful outcomes** | **`0.000`** average | 103 traffic samples and 176 observer samples | `[Verified]` |
| **p95 latency** | `6,050.8 ms` average | Range 5,414.9 – 6,332.4 ms | `[Verified]` |
| **Search throughput** | `7.60 RPS` average | 2026-09-12 02:49:57 – 03:19:43 UTC | `[Verified]` |

The earliest retained post-recovery traffic record is `2026-09-11 14:55:02 UTC`. All **2,559 retained samples** through `2026-09-12 03:19:34 UTC` reported zero success, a continuous observed duration of **12h 24m 32s**.

---

#### 5.3. Retry Amplification Saturated the Rate-Service Boundary

* **Fault origin**: The capacity contract between `search` and `rate`, specifically `RATE_RPC_MAX_ATTEMPTS=3` at the caller and `RATE_BACKEND_QPS_LIMIT=20` with `RATE_QUEUE_CAPACITY=256` at the callee.

| Stage | Observed Value | Technical Mechanism | Status |
| :--- | :---: | :--- | :---: |
| **Traffic recovery** | `8 configured RPS` | Resumed by 2026-09-11 14:55:02 UTC | `[Verified]` |
| **Retry amplification** | `2.87 attempts / request` | Average attempts per search request | `[Verified]` |
| **Attempted rate** | **`21.81 attempts/s`** | `7.60 RPS × 2.87 = 21.81` (9.1% above cap) | `[Derived]` |
| **Configured rate boundary** | `20 backend QPS; Queue 256` | Maximum backend capacity limit | `[Verified]` |
| **Queue pressure** | `226.6 avg; 256 max` | Queue depth saturation | `[Verified]` |
| **Dependency failures** | `ResourceExhausted, DeadlineExceeded, Canceled` | gRPC application-level errors from search to rate | `[Verified]` |
| **Customer symptom** | **`0.000 successful outcomes; 6.05s p95`** | Complete client-side search failure | `[Verified]` |

* **Causal chain**: Queue saturation converts the initial capacity rejection into long waits and deadline exhaustion, so retries intensify rather than absorb the overload (Retry Storm).
* **Observed failure volume**: Within one observed 30-minute search-log slice, the dependency emitted **10,850 `DeadlineExceeded`**, **1,476 `Canceled`**, and **1,055 `ResourceExhausted`** records. Observer timeout deltas summed to 34,529 and failure deltas to 13,334.

---

#### 5.4. Competing Hypotheses — Evidence Disposition

| Hypothesis | Evidence | Disposition |
| :--- | :--- | :---: |
| **Node saturation** | 4/4 nodes Ready; no pressure; node CPU 0%; maximum node memory 6% | **`REJECTED`** |
| **Missing backend endpoints** | Frontend, search, and rate each had one ready endpoint (1/1 ready) | **`REJECTED`** |
| **Active crash loop** | No Pending or Failed pods; all inspected deployments Ready | **`REJECTED`** |
| **Search cannot reach rate** | Search receives application-level gRPC `ResourceExhausted` and `DeadlineExceeded` from dependency=rate | **`REJECTED`** |
| **Rate capacity plus retries** | Observed attempt rate (21.81) exceeds cap (20) while queue reaches 256 and customer success is zero | **`CONFIRMED`** |

---

#### 5.5. Why the Dashboards Disagreed With Users (False-Green Dashboards)

The Kubernetes control plane reports availability, not useful outcomes:
1. `frontend`, `search`, and `rate` each reported `1/1` ready and available replicas.
2. All three services had ready endpoints.
3. `frontend`, `search`, and `rate` define no readiness or liveness probe, so pod readiness cannot detect a saturated queue or a dependency deadline spiral.
4. Node CPU and memory were far below capacity.
5. The traffic generator completed 91.9% of configured RPS, but every completed customer outcome was unsuccessful.

$\rightarrow$ **A dashboard centered on pod state, node utilization, or completed RPS therefore stays green while the customer journey is fully unavailable.**

---

#### 5.6. Recommended Response Matrix

| Action ID | Recommended Action | Owner | Priority |
| :---: | :--- | :---: | :---: |
| **R1** | **Workaround**: Reduce search-to-rate retry amplification, starting with a canary of `RATE_RPC_MAX_ATTEMPTS=1` | Search owner | **P0** |
| **R2** | **Fix**: Validate sustainable rate-backend throughput, then align `RATE_BACKEND_QPS_LIMIT` and replica capacity above peak attempted load | Rate owner | **P0** |
| **R3** | **Guardrail**: Reject or shed load before the queue approaches 256; keep retry budget within the original request deadline | Search + rate owners | **P1** |
| **O1** | **Detection**: Page on customer outcome success and queue depth, not completed RPS or pod readiness alone | SRE | **P1** |
| **O2** | **Health**: Add functional readiness that fails when the search dependency path cannot serve within its SLO | Service owners | **P1** |

* **Fix verification gate**: Customer-path success becomes non-zero and stable; p95 latency returns within SLO; `rate` queue remains below capacity during sustained 8 RPS; dependency `ResourceExhausted` and `DeadlineExceeded` stop increasing.

---

#### 5.7. Evidence Ledger and Limitations

* **Verified live checks**:
  * `discover.sh --max-items 20`: Context `hotel-prod-apse1`; 4 nodes, all Ready; metrics available.
  * `workload_health.sh --namespace hotel-reservation --max-items 40`: No degraded deployments; no warning events.
  * `node_pressure.sh --max-items 20`: No node pressure; low current node utilization.
  * Bounded `kubectl get` queries: Service routing, ready EndpointSlices, deployment env, resources, probes.
  * Bounded logs: `search-slo-observer`, `search-traffic`, `search`, and `rate` with 30-min aggregation.
* **Access limitations**:
  * Direct `pods/exec` was denied by RBAC for `system:serviceaccount:platform:cloudthinkerreadonly`.
  * Kubernetes `services/proxy` access was also denied (no ad hoc HTTP GET or direct metrics scrape).
  * No write, rollout, scale, restart, or configuration change was attempted.

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
