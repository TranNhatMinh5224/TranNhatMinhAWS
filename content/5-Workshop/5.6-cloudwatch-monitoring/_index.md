---
title: "Operational Monitoring & Incident Alerting with Amazon CloudWatch"
date: 2026-08-25
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
aliases:
  - /5-workshop/5.6-cloudwatch-monitoring/
  - /5-Workshop/5.6-cloudwatch-monitoring/
---

# 5.6. Operational Monitoring & Incident Alerting with Amazon CloudWatch

### Lab 5.6 Overview

Following the end-to-end integration and security testing of the RAG pipeline, establishing unified **Observability** and **Automated Incident Alerting** is imperative to ensure system stability, resilience, and high availability in enterprise production environments.

Lab 5.6 focuses on three technical milestones:
1. **Application Load Balancer Telemetry Analytics**: Tracking live metrics (`RequestCount`, `HTTPCode_Target_2XX_Count`, `TargetResponseTime`, `CapacityUtilization`).
2. **Centralized Operational Dashboard Setup (CloudWatch Dashboard `Dashboard-RAG`)**: Multi-dimensional visualization of EC2 compute workloads, ALB network throughput, API invocation error rates, and EBS storage I/O performance.
3. **Automated Incident Alerting via Amazon SNS (CloudWatch Metric Alarm)**: Configuring a proactive CPU utilization threshold alarm (`RAG-Server-High-CPU-Alarm`) dispatching emergency email alerts to operations personnel.

---

### Implementation Table of Contents:

1. [**5.6.1. Application Load Balancer Network Telemetry**](#561-application-load-balancer-network-telemetry)
2. [**5.6.2. Centralized Observability Dashboard (`Dashboard-RAG`)**](#562-centralized-observability-dashboard-dashboard-rag)
3. [**5.6.3. Automated Alerting with Amazon SNS (CloudWatch Metric Alarm)**](#563-automated-alerting-with-amazon-sns-cloudwatch-metric-alarm)

---

## 5.6.1. Application Load Balancer Network Telemetry

### 1. Technical Objectives
* **Amazon CloudWatch** provides integrated observability across AWS services, ingesting operational metrics in real-time.
* For the **Application Load Balancer (`rag-lb`)**, three mission-critical telemetry metrics are continuously tracked:
  1. **`RequestCount`**: The total volume of HTTP/HTTPS requests handled by the Load Balancer across specified intervals.
  2. **`HTTPCode_Target_2XX_Count`**: The number of successful response codes (200 OK, 201 Created) returned from target instances.
  3. **`TargetResponseTime`**: The average elapsed time (in seconds) between when a target receives an HTTP request and when it finishes sending response bytes back to the ALB.

---

### 2. Live AWS Console Telemetry Evidence

Navigate to **CloudWatch Management Console** $\rightarrow$ select **Metrics** $\rightarrow$ choose **All metrics** $\rightarrow$ select namespace **`ApplicationELB`** $\rightarrow$ **`Per AppELB Metrics`** $\rightarrow$ select Load Balancer **`app/rag-lb/dd9f64ed734dab43`**.

<div align="center">
  <img src="/images/5-Workshop/5.6/5.6.1-cloudwatch-per-appelb-metrics.png" alt="Load Balancer Metrics List on CloudWatch Console" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.6.1: CloudWatch Per AppELB Metrics view tracking app/rag-lb/dd9f64ed734dab43 resources</em></p>
</div>

<div align="center">
  <img src="/images/5-Workshop/5.6/5.6.1-cloudwatch-alb-metrics.png" alt="CloudWatch Metrics Monitoring for Application Load Balancer" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.6.2: Amazon CloudWatch Metrics dashboard displaying RequestCount, HTTPCode_Target_2XX_Count, and TargetResponseTime</em></p>
</div>

#### Telemetry Analysis Breakdown:

| Metric Name | Namespace / Dimension | Statistic | Evaluation Period | Operational Observation |
| :--- | :--- | :--- | :--- | :--- |
| **RequestCount** | `ApplicationELB • RequestCount • LoadBalancer` | Average / Sum | 15 minutes | Clear request spikes visible during testing windows (11:00 - 12:00 and 12:30 - 13:00) correlating with interactive RAG queries. |
| **HTTPCode_Target_2XX_Count** | `ApplicationELB • HTTPCode_Target_2XX_Count • LoadBalancer` | Average | 15 minutes | Aligns 100% with request volume, verifying zero 5XX server errors and zero 4XX routing faults across the testing lifecycle. |
| **TargetResponseTime** | `ApplicationELB • TargetResponseTime • LoadBalancer` | Average | 15 minutes | Consistently maintained within ~0.05s to 0.12s, demonstrating responsive compute performance from `enterprise-rag-server` and Qdrant vector indexing. |

---

## 5.6.2. Centralized Observability Dashboard (`Dashboard-RAG`)

### 1. Technical Objectives
To provide technical teams with single-pane-of-glass operational visibility, a customized dashboard named **`Dashboard-RAG`** was created:

1. In **CloudWatch Console** $\rightarrow$ select **Dashboards** $\rightarrow$ click **Create dashboard** $\rightarrow$ name it **`Dashboard-RAG`**.
2. Add multi-dimensional visualization widgets:
   * **Widget 1 (CPUUtilization)**: Monitors EC2 host processor workload.
   * **Widget 2 (HTTPCode_Target_2XX_Count, RequestCount, TargetResponseTime)**: Tracks ALB traffic flow and response latencies.
   * **Widget 3 (CallCount, ErrorCount)**: Monitors API invocation volumes and runtime error rates.
   * **Widget 4 (VolumeAvgIOPS, VolumeAvgReadLatency, VolumeAvgThroughput)**: Tracks underlying EBS storage I/O performance.

<div align="center">
  <img src="/images/5-Workshop/5.6/5.6.2-cloudwatch-dashboard-rag.png" alt="Unified CloudWatch Dashboard-RAG Visualization" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.6.3: Unified CloudWatch Dashboard-RAG summarizing CPU, ALB metrics, Call/Error Counts, and EBS Volume IOPS</em></p>
</div>

---

## 5.6.3. Automated Alerting with Amazon SNS (CloudWatch Metric Alarm)

The system configures a proactive **Metric Alarm** to immediately notify operations personnel if the EC2 host encounters high CPU utilization due to intensive vector embedding computation or traffic surges:

#### Step 1: Select Metric and Trigger Conditions
* **Namespace**: `AWS/EC2`
* **Metric name**: `CPUUtilization`
* **InstanceId**: RAG server instance (`enterprise-rag-server` / `i-0f7f40a8245434328`)
* **Statistic**: `Average`, **Period**: `5 minutes`
* **Threshold type**: `Static` $\rightarrow$ Condition: `Greater > threshold`.

<div align="center">
  <img src="/images/5-Workshop/5.6/5.6.3-cloudwatch-alarm-cpu-metric.png" alt="Configuring CPUUtilization Metric for CloudWatch Alarm" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.6.4: Configuring 5-minute evaluation period and threshold conditions for host CPUUtilization</em></p>
</div>

#### Step 2: Configure Notification Actions via Amazon SNS
* **Alarm state trigger**: `In alarm`.
* **Send a notification to**: Select existing SNS topic: **`Default_CloudWatch_Alarms_Topic`**.
* **Email endpoint**: `nhatminh5224.forwork@gmail.com` (Administrator email for urgent notifications).

<div align="center">
  <img src="/images/5-Workshop/5.6/5.6.3-cloudwatch-alarm-sns-action.png" alt="Configuring Amazon SNS Notification Action" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.6.5: Configuring SNS notification action dispatching alerts to nhatminh5224.forwork@gmail.com</em></p>
</div>

#### Step 3: Alarm Name and Successful Activation
* Alarm name: **`RAG-Server-High-CPU-Alarm`**.
* Click **Create alarm**. CloudWatch confirms successful creation with active monitoring status (`Actions enabled`).

<div align="center">
  <img src="/images/5-Workshop/5.6/5.6.3-cloudwatch-alarm-created-success.png" alt="Successfully Created CloudWatch Alarm RAG-Server-High-CPU-Alarm" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Figure 5.6.6: CloudWatch Alarm RAG-Server-High-CPU-Alarm successfully provisioned with automated notification actions enabled</em></p>
</div>

---

### Lab 5.6 Summary

Through Lab 5.6, the enterprise RAG infrastructure achieved complete production observability:
* **Observability**: Telemetry measurements from Amazon CloudWatch Metrics confirm 100% 2XX delivery reliability and low target response latency under interactive load.
* **Centralized Visibility**: The **Dashboard-RAG** dashboard provides single-pane-of-glass insight across compute, storage, and networking layers.
* **Proactive Response**: The **CloudWatch Alarm with Amazon SNS** integration guarantees immediate automated alerts to engineers upon resource saturation.
