---
title: "Blog 3"
date: 2026-07-14
weight: 1
chapter: false
pre: " <b> 3.3. </b> "
---

# PROVISION ORACLE DATABASE@AWS RESOURCES USING TERRAFORM

The **Oracle Database@AWS** solution enables enterprise workloads to run Oracle databases on dedicated Exadata infrastructure co-located within AWS data centers. This allows application workloads on Amazon EC2 instances to access Oracle databases with sub-millisecond network latency. To manage this deployment efficiently, **Terraform** is utilized as the primary Infrastructure as Code (IaC) tool.

### Key architecture components:

*   **Customer VPC (AWS Cloud)**: Hosts Amazon EC2 application servers. These application instances communicate with Oracle databases via a low-latency network connection using **ODB peering**.
*   **ODB Network**: Private network interface connecting the customer VPC and the OCI Child site, containing Client and Backup subnets.
*   **OCI Child Site**: Dedicated physical Exadata infrastructure deployed directly inside the AWS data center, running within an OCI Virtual Cloud Network (VCN).
*   **OCI Control Plane**: Manages the local child site automatically from the OCI parent region to streamline operations and patching.
*   **Terraform Provisioning**: Leverages declarative Terraform providers to automate the creation of network peering routes, Exadata VM Clusters, and database instances dynamically.

![Oracle Database@AWS Architecture](/images/3-BlogsPosted/blog3.png)

---

*   **Social Share Link**: [Facebook Post](https://www.facebook.com/share/p/1DZnVk6ZYL/)
*   **Reference Blog Link**: [AWS Database Blog - Provision Oracle Database@AWS with Terraform](https://aws.amazon.com/vi/blogs/database/provision-oracle-databaseaws-resources-using-terraform/)